import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import dotenv from 'dotenv';
import { getDatabase } from './src/services/db.js';
import { investigateTicket } from './src/services/ai.js';

// Safe environment loading without logging secrets
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const devVarsPath = path.resolve(__dirname, '.dev.vars');
const backendEnvPath = path.resolve(__dirname, '.env');
const rootEnvPath = path.resolve(__dirname, '../.env');

if (fs.existsSync(devVarsPath)) {
  dotenv.config({ path: devVarsPath });
}
if (fs.existsSync(backendEnvPath)) {
  dotenv.config({ path: backendEnvPath });
}
if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
}

async function main() {
  console.log('======================================================================');
  console.log('  RESOLVAI - LIVE RUN ON SEED TICKETS (T-001 .. T-005)');
  console.log('  Reference Date: 2026-10-24');
  console.log('======================================================================\n');

  const db = getDatabase();
  await db.resetAndSeed();

  const ticketIds = ['T-001', 'T-002', 'T-003', 'T-004', 'T-005'];

  for (const ticketId of ticketIds) {
    console.log(`\n================== TICKET ${ticketId} ==================`);

    const result = await investigateTicket({ ticket_id: ticketId }, db);

    if (result.type === 'error') {
      console.log(`STATUS: ERROR`);
      console.log(`Message: ${result.message}`);
      console.log('Raw JSON:');
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(`STATUS: LIVE MODEL`);
      console.log('Raw JSON:');
      console.log(JSON.stringify(result, null, 2));

      // If clarification needed (T-002), proceed with turn 2 clarification answer
      if (result.type === 'clarification') {
        console.log(`\n--- TURN 2: Officer provides clarification ---`);
        const turn2Result = await investigateTicket(
          {
            ticket_id: ticketId,
            clarification_answer: 'Customer stated purchase date was 2026-10-18'
          },
          db
        );

        if (turn2Result.type === 'error') {
          console.log(`STATUS: ERROR`);
          console.log(`Message: ${turn2Result.message}`);
          console.log('Turn 2 Raw JSON:');
          console.log(JSON.stringify(turn2Result, null, 2));
        } else {
          console.log(`STATUS: LIVE MODEL`);
          console.log('Turn 2 Raw JSON:');
          console.log(JSON.stringify(turn2Result, null, 2));
        }
      }
    }
  }

  console.log('\n======================================================================');
  console.log('  LIVE RUN COMPLETE');
  console.log('======================================================================\n');
}

main().catch((err) => {
  console.error('Fatal live_run error:', err.message || err);
  process.exit(1);
});
