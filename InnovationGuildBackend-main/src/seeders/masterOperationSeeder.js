require('dotenv').config();
const MasterOperation = require('../models/MasterOperation');
const connectDB = require('../config/database');

const DEFAULT_OPERATIONS = [
  'Bed Making',
  'Drying',
  'Harvesting',
  'Interculture',
  'Irrigation',
  'Oil Extraction',
  'Packaging',
  'Quality Testing',
  'Raking',
  'Shelling',
  'Sowing',
  'Spraying',
  'Threshing',
  'Tillage',
  'Transportation',
  'Weeding',
  'Winnowing',
];

const seedOperations = async () => {
  try {
    await connectDB();

    let inserted = 0;
    let skipped = 0;

    for (const label of DEFAULT_OPERATIONS) {
      const value = label.toLowerCase().replace(/\s+/g, '_').trim();
      const existing = await MasterOperation.findOne({ value });
      if (existing) {
        skipped++;
      } else {
        await MasterOperation.create({ label, value, isUserAdded: false });
        inserted++;
      }
    }

    console.log('✅ MasterOperation seeding complete');
    console.log(`   Inserted: ${inserted}`);
    console.log(`   Skipped (already exist): ${skipped}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding operations:', error.message);
    process.exit(1);
  }
};

seedOperations();
