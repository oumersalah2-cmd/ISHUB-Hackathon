import type { Ticket, Policy, TicketUpdate, AgentResult } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787';

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || data.error || data.message || `Request failed with status ${response.status}`);
  }
  return data;
}

export const api = {
  // Health check
  async checkHealth(): Promise<{
    status: string;
    database: { connected: boolean; tickets_count: number; policies_count: number };
    ai: { provider: string; model: string };
  }> {
    return fetchJson('/api/health');
  },

  // Tickets
  async getTickets(): Promise<{ success: boolean; tickets: Ticket[] }> {
    return fetchJson('/api/tickets');
  },

  async getTicket(id: string): Promise<{ success: boolean; ticket: Ticket; missing_fields: string[] }> {
    return fetchJson(`/api/tickets/${encodeURIComponent(id)}`);
  },

  // Policies
  async getPolicies(category?: string, query?: string): Promise<{ success: boolean; policies: Policy[]; count: number }> {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (query) params.set('query', query);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return fetchJson(`/api/policies${qs}`);
  },

  // Agent investigation
  async investigate(payload: {
    ticket_id: string;
    clarification_answer?: string;
    conversation?: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  }): Promise<AgentResult> {
    return fetchJson('/api/agent/investigate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Confirm update (Explicit human approval)
  async confirmUpdate(ticketId: string, payload: {
    approved_category: string;
    proposed_status: string;
    response_draft: string;
    supporting_policy_ids: string[];
  }): Promise<{ success: boolean; message: string; update: any }> {
    return fetchJson(`/api/tickets/${encodeURIComponent(ticketId)}/confirm`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Updates audit trail
  async getAllUpdates(): Promise<{ success: boolean; count: number; updates: TicketUpdate[] }> {
    return fetchJson('/api/updates');
  },

  async getUpdate(id: number): Promise<{ success: boolean; update: TicketUpdate }> {
    return fetchJson(`/api/updates/${id}`);
  },

  async getTicketUpdates(ticketId: string): Promise<{ success: boolean; count: number; updates: TicketUpdate[] }> {
    return fetchJson(`/api/tickets/${encodeURIComponent(ticketId)}/updates`);
  }
};
