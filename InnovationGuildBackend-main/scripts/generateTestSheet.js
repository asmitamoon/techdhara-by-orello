/**
 * Generates scripts/data/migration.xlsx with one sample row per role,
 * one innovation, and one problem — enough to do a full end-to-end test
 * of migrateFromExcel.js.
 *
 * Sheets: NO | AO | VLE | INNOVATOR | GENERAL_USER | Innovations | Problems
 * Each role sheet contains only the columns relevant to that role.
 *
 * Usage:
 *   node scripts/generateTestSheet.js
 */

const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const OUT_PATH = path.join(__dirname, 'data', 'migration.xlsx');

// Creates a worksheet with column widths auto-fitted to content
function makeSheet(data) {
  const ws = XLSX.utils.json_to_sheet(data);
  if (!data.length) return ws;
  const headers = Object.keys(data[0]);
  ws['!cols'] = headers.map(h => {
    const max = data.reduce((m, row) => {
      const v = row[h] !== undefined && row[h] !== null ? String(row[h]) : '';
      return Math.max(m, v.length);
    }, h.length); // seed with header length
    return { wch: Math.min(max + 2, 60) }; // +2 padding, cap at 60 chars
  });
  return ws;
}

// Ensure the output directory exists
fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });

// ─── Sheet 1: NO (Nodal Org) ──────────────────────────────────────────────────

const noUsers = [
  {
    fullName: 'Test Nodal Org',
    email: 'no@test.com',
    phone: '',
    loginType: 'email',
    password: 'NO@1234',
    createdAt: '2022-03-10',
    orgName: 'Test Nodal Organisation',
    hqState: 'MH',
    orgType: 'non-profit',
    operationalStates: 'MH,GJ',
    website: 'https://testno.org',
    description: 'A test nodal organisation for migration testing.',
    hasRuralPrograms: 'yes',
    hasTechIntegration: 'no',
    potentialAoCount: 5,
    channels: 'Own Organization Branches, Cooperatives',
  },
];

// ─── Sheet 2: AO (Affiliated Org) ────────────────────────────────────────────
// nodalOrg — email or phone of the NO user this AO belongs to

const aoUsers = [
  {
    fullName: 'Test Affiliated Org',
    email: 'ao@test.com',
    phone: '',
    loginType: 'email',
    password: 'Affiliated@5678',
    createdAt: '2022-05-18',
    orgName: 'Test Affiliated Organisation',
    orgType: 'ngo',
    orgTypeOther: '',
    streamOfWork: 'agriculture,skill_building',
    streamOfWorkOther: '',
    pocName: 'Ramesh Kumar',
    village: 'Koregaon',
    district: 'PUN',
    state: 'MH',
    website: 'https://testao.org',
    nodalOrg: 'no@test.com',
  },
];

// ─── Sheet 3: VLE ─────────────────────────────────────────────────────────────
// affiliatedOrg — email or phone of the AO user this VLE belongs to (optional)

const vleUsers = [
  {
    fullName: 'Test VLE User',
    email: 'vle@test.com',
    phone: '',
    loginType: 'email',
    password: 'VleUser@9012',
    createdAt: '2022-08-04',
    mobile: '9876543210',
    age: 28,
    gender: 'male',
    village: 'Koregaon',
    district: 'PUN',
    state: 'MH',
    mainLivelihood: 'Farming',
    livelihoodExperience: 5,
    languages: 'english,hindi',
    vleCategory: 'Mechanic',
    affiliatedOrg: 'ao@test.com',
    supportAssessment: 'open_to_innovations,has_smartphone',
    hasMachineExp: 'Yes',
    trainingsTaken: 'Basic farming and agri-tech training',
    machineExpYears: 3,
    machinesWorkedWith: 'Mini tiller,Pump set',
    otherLivelihoods: 'Carpentry',
    yearlyRevenue: 50000,
    qualification: 'Class 10',
    vleStatus: 'listed',
  },

  // Phone-only VLE (no email) — tests phone-based cross-reference in Problems sheet.
  // postedBy in Problems sheet can reference this user by phone number '9000000002'.
  {
    fullName: 'Phone Only VLE',
    email: '',
    phone: '9000000002',
    loginType: 'phone',
    password: 'PhoneVle@3456',
    createdAt: '2023-01-22',
    mobile: '9000000002',
    age: 32,
    gender: 'female',
    village: 'Shirgaon',
    district: 'RTG',
    state: 'MH',
    mainLivelihood: 'Fishing',
    livelihoodExperience: 8,
    languages: 'marathi,hindi',
    vleCategory: 'Other',
    vleCategoryOther: 'Fisherfolk',
    affiliatedOrg: 'ao@test.com',
    supportAssessment: 'open_to_innovations',
    hasMachineExp: 'No',
    trainingsTaken: '',
    machineExpYears: '',
    machinesWorkedWith: '',
    otherLivelihoods: '',
    yearlyRevenue: 40000,
    qualification: 'Class 8',
    vleStatus: 'listed',
  },
];

// ─── Sheet 4: INNOVATOR ───────────────────────────────────────────────────────

const innovators = [
  {
    fullName: 'Test Innovator',
    email: 'innovator@test.com',
    phone: '',
    loginType: 'email',
    password: 'Innovator@2345',
    createdAt: '2021-11-30',
    addressLine1: '123 Tech Park, Baner',
    addressLine2: 'Near Pune University',
    district: 'PUN',
    state: 'MH',
    description: 'A passionate agricultural innovator building affordable machinery.',
    enterpriseName: 'AgriTech Innovations Pvt Ltd',
    startDate: '2020-06-01',
    links: 'https://agritech-innovations.com',
  },
];

// ─── Sheet 5: GENERAL_USER ────────────────────────────────────────────────────

const generalUsers = [
  {
    fullName: 'Test General User',
    email: 'user@test.com',
    phone: '',
    loginType: 'email',
    password: 'General@6789',
    createdAt: '2023-04-07',
    mobile: '9876543211',
    age: 25,
    gender: 'female',
    state: 'MH',
    district: 'PUN',
    village: 'Koregaon',
  },

  // Google-only login — isGoogleUser:true, isEmailUser:false, no password.
  // passport.js checks (isEmailUser && !isGoogleUser) — false for this user,
  // so Google OAuth login flows straight through without blocking.
  {
    fullName: 'Test Google User',
    email: 'googleuser@test.com',
    phone: '',
    loginType: 'google',
    password: '',
    createdAt: '2023-06-15',
    mobile: '9000000001',
    age: 22,
    gender: 'other',
    state: 'DL',
    district: 'NDL',
    village: 'Connaught Place',
  },
];

// ─── Sheet 6: Innovations ─────────────────────────────────────────────────────

const innovations = [
  {
    innovator: 'innovator@test.com',
    createdAt: '2022-07-15',
    innovationName: 'Smart Mini Tiller',
    description: 'An affordable petrol-powered mini tiller designed for small and marginal farms, reducing tillage time by 60% compared to manual labour.',
    category: 'agriculture,others',
    categoryOther: 'Farm Mechanisation',
    subcategory: 'production',
    subcategoryOther: '',
    innovationStage: 'mvp',
    yearLaunched: 2022,
    powerSource: 'petrol_diesel',
    engineCapacity: '5 HP',
    motorCapacity: '',
    renewableType: '',
    pullCapacity: '',
    dimensions: '1.2m x 0.8m x 1.0m',
    weight: '85 kg',
    coveredOperations: 'tillage,sowing,interculture',
    manufacturingLocation: 'Pune, Maharashtra',
    sellingPriceMin: 45000,
    sellingPriceMax: 65000,
    numberOfUnitsInstalled: 12,
    distributorNetwork: 'only_few',
    salesLocation: 'MH,GJ,MP',
    spareParts: 'yes',
    maintenanceTraining: 'yes',
    financingSupport: 'open_to_explore',
    technicalTraining: 'yes',
    demoInstallations: 'yes',
    suitableCrops: 'Wheat, Soybean, Maize, Vegetables',
    suitableTerrains: 'Flat to mildly sloped terrain',
    suitableSoil: 'Loamy and clay soils',
    weatherConditions: 'Suitable for all weather',
    otherUsageConditions: '',
    importedParts: 'Engine sourced from Japan; all other parts domestic',
    attachments: 'Rotavator, furrow opener',
    performanceParams: 'Covers 0.5 acre/hour; fuel consumption 1.2 L/hour',
  },

  // Second innovation — solar-powered fish dryer. Intentionally matches Problem 2
  // (fish drying equipment for coastal villages) so the post-migration NLP matching
  // phase has a visible match to verify against.
  {
    innovator: 'innovator@test.com',
    createdAt: '2023-03-20',
    innovationName: 'Solar Fish Dryer',
    description: 'A low-cost solar-powered mechanical fish dryer for coastal fisherfolk. Reduces drying time from 3-4 days to 6-8 hours and maintains quality during monsoon season, cutting post-harvest losses significantly.',
    category: 'fisheries',
    categoryOther: '',
    subcategory: 'processing',
    subcategoryOther: '',
    innovationStage: 'poc',
    yearLaunched: 2023,
    powerSource: 'renewable',
    engineCapacity: '',
    motorCapacity: '1-2 kW',
    renewableType: 'solar',
    pullCapacity: '',
    dimensions: '2.0m x 1.5m x 1.2m',
    weight: '40 kg',
    coveredOperations: 'drying,packaging',
    manufacturingLocation: 'Ratnagiri, Maharashtra',
    sellingPriceMin: 18000,
    sellingPriceMax: 25000,
    numberOfUnitsInstalled: 4,
    distributorNetwork: 'not_any',
    salesLocation: 'MH,GJ',
    spareParts: 'no',
    maintenanceTraining: 'yes',
    financingSupport: 'open_to_explore',
    technicalTraining: 'not_needed',
    demoInstallations: 'yes',
    suitableCrops: 'Pomfret, Mackerel, Sardine, Bombay Duck',
    suitableTerrains: 'Coastal flat terrain',
    suitableSoil: '',
    weatherConditions: 'Works in all weather including monsoon',
    otherUsageConditions: 'Requires direct sunlight for 4+ hours/day for optimal performance',
    importedParts: 'Solar panels sourced from Gujarat; frame and drying racks locally fabricated',
    attachments: '',
    performanceParams: 'Dries 20 kg fish per batch; 6-8 hour cycle time in full sun',
  },
];

// ─── Sheet 7: Problems ────────────────────────────────────────────────────────

const problems = [
  {
    postedBy: 'vle@test.com',
    createdAt: '2022-09-20',
    problemTitle: 'Need affordable harvesting machine for small farms',
    problemDescription: 'Small and marginal farmers in our region still rely on manual harvesting which is slow and expensive. We need a low-cost harvesting machine that fits narrow rows and can be operated by one person.',
    regionState: 'MH',
    regionDistrict: 'PUN',
    regionVillage: 'Koregaon',
    category: 'agriculture',
    categoryOther: '',
    valueChainStages: 'production,processing',
    crops: 'Wheat, Rice, Soybean',
    operationsUndertaken: 'harvesting,threshing',
    machineOperations: 'harvesting,winnowing',
    currentMethodology: 'Farmers use sickles and manual threshers. Labour cost is Rs 500/day per worker and harvesting takes 5-7 days per acre.',
    knowMachinery: 'yes',
    machineChallenge: 'Existing combine harvesters are too large (need 4+ feet row spacing) and too expensive (Rs 15-20 lakh). Smaller options from China have poor spare parts availability.',
    energySource: 'petrol_diesel,manual',
    pullCapacity: '',
    engineCapacity: '7 HP preferred',
    motorCapacity: '',
    renewableType: '',
    specificInfo: 'Fields are typically 0.5-2 acres. Row spacing is 6-9 inches for wheat.',
    problemSize: 'Approximately 2,000 farmers in 50 villages across Pune and Satara districts',
    endProducts: 'Wheat grain, Rice grain, Soybean seeds',
    salesChannels: 'APMC markets, local mandis, government procurement (MSP)',
    newChannels: 'FPO-linked bulk sales, online agri platforms',
    currentRevenue: 80000,
    expectedRevenue: 200000,
    machineBudget: 30000,
  },

  // Problem posted by phone-only VLE — referenced by phone number, not email.
  // Tests that resolveUserId correctly finds the user via phone lookup.
  {
    postedBy: '9000000002',
    createdAt: '2023-02-11',
    problemTitle: 'Need fish drying equipment for coastal villages',
    problemDescription: 'Coastal fisherfolk in Ratnagiri need affordable mechanical fish dryers. Sun drying takes 3-4 days and quality is poor during monsoon season, causing huge post-harvest losses.',
    regionState: 'MH',
    regionDistrict: 'RTG',
    regionVillage: 'Shirgaon',
    category: 'fisheries',
    categoryOther: '',
    valueChainStages: 'processing',
    crops: 'Pomfret, Mackerel, Sardine',
    operationsUndertaken: 'drying,packaging',
    machineOperations: 'drying',
    currentMethodology: 'Sun drying on bamboo racks. Takes 3-4 days in summer. During monsoon fish spoils before drying is complete.',
    knowMachinery: 'no',
    machineChallenge: '',
    energySource: 'electrical',
    pullCapacity: '',
    engineCapacity: '',
    motorCapacity: '1-2 kW',
    renewableType: '',
    specificInfo: 'Solar-powered dryers would be preferred given coastal sunshine availability.',
    problemSize: '500 fishing households in 10 coastal villages',
    endProducts: 'Dried fish for local markets and export',
    salesChannels: 'Local fish markets, wholesale dealers',
    newChannels: 'Online direct-to-consumer, export markets',
    currentRevenue: 60000,
    expectedRevenue: 150000,
    machineBudget: 20000,
  },
];

// ─── Build & write workbook ───────────────────────────────────────────────────

const wb = XLSX.utils.book_new();

XLSX.utils.book_append_sheet(wb, makeSheet(noUsers),      'NO');
XLSX.utils.book_append_sheet(wb, makeSheet(aoUsers),      'AO');
XLSX.utils.book_append_sheet(wb, makeSheet(vleUsers),     'VLE');
XLSX.utils.book_append_sheet(wb, makeSheet(innovators),   'INNOVATOR');
XLSX.utils.book_append_sheet(wb, makeSheet(generalUsers), 'GENERAL_USER');
XLSX.utils.book_append_sheet(wb, makeSheet(innovations),  'Innovations');
XLSX.utils.book_append_sheet(wb, makeSheet(problems),     'Problems');

XLSX.writeFile(wb, OUT_PATH);
console.log(`✓ Test sheet written to: ${OUT_PATH}`);
console.log('\nSheets & row counts:');
console.log(`  NO:           ${noUsers.length}`);
console.log(`  AO:           ${aoUsers.length}`);
console.log(`  VLE:          ${vleUsers.length}`);
console.log(`  INNOVATOR:    ${innovators.length}`);
console.log(`  GENERAL_USER: ${generalUsers.length}`);
console.log(`  Innovations:  ${innovations.length}`);
console.log(`  Problems:     ${problems.length}`);
console.log('\nTest credentials:');
console.log('  no@test.com          — NO           — NO@1234');
console.log('  ao@test.com          — AO           — Affiliated@5678');
console.log('  vle@test.com         — VLE          — VleUser@9012  (mobile: 9876543210)');
console.log('  9000000002           — VLE          — PhoneVle@3456 (phone login only)');
console.log('  innovator@test.com   — INNOVATOR    — Innovator@2345');
console.log('  user@test.com        — GENERAL_USER — General@6789');
console.log('  googleuser@test.com  — GENERAL_USER — Google OAuth only (no password)');
