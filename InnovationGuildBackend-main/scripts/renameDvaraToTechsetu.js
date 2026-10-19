/**
 * One-off data update: rename the service request ownership value "Dvara" to "Techsetu".
 *
 * The ownership options changed from Dvara / FPO / Individual to Techsetu / FPO / Individual.
 * Existing ServiceRequest records saved with "Dvara" would otherwise fail validation the
 * next time they are edited and would not match the new "Techsetu" filter in admin lists.
 *
 * Safe to run more than once: it only touches records still set to "Dvara".
 *
 * Usage:
 *   node scripts/renameDvaraToTechsetu.js      (or: npm run migrate:dvara-to-techsetu)
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../src/config/database');

async function main() {
  await connectDB();

  // Use the raw collection so the update is not blocked by the model's new enum.
  const collection = mongoose.connection.collection('servicerequests');
  const result = await collection.updateMany(
    { ownership: 'Dvara' },
    { $set: { ownership: 'Techsetu' } }
  );

  console.log(`Updated ${result.modifiedCount} service request(s) from "Dvara" to "Techsetu".`);
}

main()
  .catch((err) => {
    console.error('Rename failed:', err);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
