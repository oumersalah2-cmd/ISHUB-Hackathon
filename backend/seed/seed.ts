import { getDatabase } from '../src/services/db.js';

async function runSeed() {
  console.log('🌱 Starting database seeding...');
  const db = getDatabase();
  await db.resetAndSeed();

  const tickets = await db.queryAll('SELECT id, customer_name, subject, category, status, purchase_date FROM tickets');
  const policies = await db.queryAll('SELECT id, title, category FROM policies');

  console.log(`✅ Successfully seeded ${policies.length} policies:`);
  policies.forEach((p: any) => console.log(`   - [${p.id}] ${p.title} (${p.category})`));

  console.log(`✅ Successfully seeded ${tickets.length} tickets:`);
  tickets.forEach((t: any) => console.log(`   - [${t.id}] ${t.subject} (${t.status}, Category: ${t.category}, Purchase: ${t.purchase_date ?? 'NULL'})`));

  console.log('🎉 Seeding complete. Database is ready.');
}

runSeed().catch((err) => {
  console.error('❌ Error during seeding:', err);
  process.exit(1);
});
