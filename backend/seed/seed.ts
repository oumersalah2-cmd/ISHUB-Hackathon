import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDatabase } from '../src/services/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runSeed() {
  console.log('🌱 Starting database seeding with seed-data.json...');
  const db = getDatabase();
  await db.resetAndSeed();

  const tickets = await db.queryAll('SELECT id, customer_name, subject, category, status, order_id, purchase_date, shipping_date FROM tickets ORDER BY id ASC');
  const policies = await db.queryAll('SELECT id, title, category FROM policies ORDER BY id ASC');

  console.log(`✅ Successfully seeded ${policies.length} policies:`);
  policies.forEach((p: any) => console.log(`   - [${p.id}] ${p.title} (${p.category})`));

  console.log(`✅ Successfully seeded ${tickets.length} tickets:`);
  tickets.forEach((t: any) => console.log(`   - [${t.id}] ${t.subject} (${t.status}, Category: ${t.category}, Order: ${t.order_id ?? 'NULL'}, Purchase: ${t.purchase_date ?? 'NULL'}, Shipping: ${t.shipping_date ?? 'NULL'})`));

  console.log('🎉 Seeding complete. Database is ready.');
}

runSeed().catch((err) => {
  console.error('❌ Error during seeding:', err);
  process.exit(1);
});
