import type { IDatabaseService } from '../services/db.js';
import type { Policy } from '../types/index.js';
import { searchPoliciesInputSchema, type SearchPoliciesInput } from '../validation/schemas.js';

export interface SearchPoliciesResult {
  success: boolean;
  policies: Policy[];
  count: number;
  message?: string;
  error?: string;
}

export async function searchPolicies(
  input: SearchPoliciesInput,
  db: IDatabaseService
): Promise<SearchPoliciesResult> {
  const parsed = searchPoliciesInputSchema.safeParse(input);
  if (!parsed.success) {
    const errorDetails = (parsed.error.issues || (parsed.error as any).errors || []).map((e: any) => e.message).join(', ');
    return {
      success: false,
      policies: [],
      count: 0,
      error: `Validation error: ${errorDetails}`
    };
  }

  const { query, keywords, category } = parsed.data;
  const searchTerm = (query || keywords || '').trim();

  // If both category and search query are empty, return all policies
  if (!searchTerm && !category) {
    const allPolicies = await db.queryAll<Policy>('SELECT id, policy_code, title, category, policy_text, applicable_conditions, created_at FROM policies');
    const mapped = allPolicies.map((p: any) => ({
      ...p,
      policy_id: p.policy_code || p.id,
      text: p.policy_text
    }));
    return {
      success: true,
      policies: mapped,
      count: mapped.length
    };
  }

  // Tokenize keywords for flexible matching
  const rawTokens = searchTerm
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2);

  // Synonym expansion for common ticket vocabulary (as required by specification)
  const synonymMap: Record<string, string[]> = {
    'money': ['refund'],
    'back': ['refund'],
    'return': ['refund'],
    'broken': ['refund'],
    'damaged': ['refund'],
    'parcel': ['delivery', 'shipping'],
    'shipped': ['delivery', 'shipping'],
    'package': ['delivery', 'shipping'],
    'carrier': ['delivery'],
    'arrived': ['delivery', 'shipping'],
    'arrive': ['delivery', 'shipping'],
    'login': ['account', 'lock', 'reset'],
    'locked': ['account', 'lock', 'reset'],
    'lockout': ['account', 'lock', 'reset'],
    'password': ['account', 'reset', 'unlock']
  };

  const expandedTokens = new Set<string>(rawTokens);
  for (const token of rawTokens) {
    if (synonymMap[token]) {
      synonymMap[token].forEach(syn => expandedTokens.add(syn));
    }
  }

  // Handle multi-word phrase "money back"
  if (searchTerm.toLowerCase().includes('money back')) {
    expandedTokens.add('refund');
  }

  const tokens = Array.from(expandedTokens);

  let sql = 'SELECT id, policy_code, title, category, policy_text, applicable_conditions, created_at FROM policies WHERE 1=1';
  const params: unknown[] = [];

  if (category) {
    sql += " AND (category = ? OR category = 'Other')";
    params.push(category);
  }

  if (tokens.length > 0) {
    const tokenClauses = tokens.map(() => {
      return '(LOWER(title) LIKE ? OR LOWER(policy_text) LIKE ? OR LOWER(applicable_conditions) LIKE ? OR LOWER(policy_code) LIKE ?)';
    });
    sql += ` AND (${tokenClauses.join(' OR ')})`;
    for (const token of tokens) {
      const pattern = `%${token}%`;
      params.push(pattern, pattern, pattern, pattern);
    }
  }

  const matches = await db.queryAll<Policy>(sql, params);

  const mappedMatches = matches.map((m: any) => ({
    ...m,
    policy_id: m.policy_code || m.id,
    text: m.policy_text
  }));

  return {
    success: true,
    policies: mappedMatches,
    count: mappedMatches.length,
    message: mappedMatches.length === 0 ? 'No applicable policy found for the given criteria.' : undefined
  };
}
