/**
 * Excel → MongoDB Migration Script
 *
 * Reads one Excel file with 7 sheets:
 *   Sheet "NO"           – Nodal Org users
 *   Sheet "AO"           – Affiliated Org users  (nodalOrg col → email/phone of their NO)
 *   Sheet "VLE"          – VLE users              (affiliatedOrg col → email/phone of their AO)
 *   Sheet "INNOVATOR"    – Innovator users
 *   Sheet "GENERAL_USER" – General users
 *   Sheet "Innovations"  – one row per innovation (innovator col → email/phone of INNOVATOR user)
 *   Sheet "Problems"     – one row per InnovationRequest (postedBy → email/phone of poster)
 *
 * Usage:
 *   node scripts/migrateFromExcel.js                          # reads ./scripts/data/migration.xlsx
 *   node scripts/migrateFromExcel.js --file ./custom.xlsx     # custom file path
 *   node scripts/migrateFromExcel.js --dry-run                # validate + duplicate check (still connects DB)
 */

require('dotenv').config();
const path = require('path');
const XLSX = require('xlsx');
const mongoose = require('mongoose');
const connectDB = require('../src/config/database');

// Models
const User = require('../src/models/User');
const NodalOrgProfile = require('../src/models/NodalOrgProfile');
const AoProfile = require('../src/models/AoProfile');
const VleProfile = require('../src/models/VleProfile');
const InnovatorProfile = require('../src/models/InnovatorProfile');
const GeneralUserProfile = require('../src/models/GeneralUserProfile');
const Innovation = require('../src/models/Innovation');
const InnovationRequest = require('../src/models/InnovationRequest');

// Utilities
// NOTE: normalizePhoneNumber is inlined below instead of imported from mobileAuth.js
// because mobileAuth.js imports sms.js which eagerly initializes a Twilio client at
// require-time → crashes if TWILIO_* env vars are missing.
const { upsertOperations } = require('../src/utils/dbHelpers');
const { updateProblemKeywords, extractKeywords } = require('../src/services/matching/keywordExtractor');
const { findMatchingInnovations } = require('../src/services/matching/matchingService');

// ─── CLI args ────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const fileArgIdx = args.indexOf('--file');
const EXCEL_PATH =
  fileArgIdx !== -1 && args[fileArgIdx + 1]
    ? path.resolve(args[fileArgIdx + 1])
    : path.join(__dirname, 'data', 'migration.xlsx');

// ─── Constants ────────────────────────────────────────────────────────────────
const DEFAULT_PASSWORD = 'TechDhaara@1234';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const splitCSV = (val) =>
  val ? String(val).split(',').map((s) => s.trim()).filter(Boolean) : [];

const str = (val) => (val !== undefined && val !== null ? String(val).trim() : '');

// Return undefined for empty/null/NaN so Mongoose uses its own required/default logic.
// Guards:
//   Number('') === 0  → would break min-value validations (e.g. age min:10)
//   Number('abc') === NaN → would store NaN in DB or produce confusing validation errors
const num = (val) => {
  if (val === undefined || val === null || val === '') return undefined;
  const n = Number(val);
  return isNaN(n) ? undefined : n;
};

// Inlined from src/services/auth/mobileAuth.js to avoid importing sms.js which
// eagerly calls require('twilio')(SID, TOKEN) at module load and crashes if env vars are missing.
function normalizePhoneNumber(phone) {
  let normalized = String(phone).replace(/\s+/g, '').replace(/[()-]/g, '');
  if (!normalized.startsWith('+')) {
    if (normalized.startsWith('91') && normalized.length === 12) {
      normalized = '+' + normalized;       // 91XXXXXXXXXX → +91XXXXXXXXXX
    } else if (normalized.length === 10) {
      normalized = '+91' + normalized;     // XXXXXXXXXX → +91XXXXXXXXXX
    }
  }
  return normalized;
}

// Parse a date value from Excel — returns a Date object or undefined for blank/invalid.
// Accepts ISO strings ('2023-06-15'), JS-parseable strings, and Excel serial numbers.
function parseDate(val) {
  if (val === undefined || val === null || val === '') return undefined;
  const d = new Date(val);
  return isNaN(d.getTime()) ? undefined : d;
}

// Parse truthy Excel boolean values: 'true', 'yes', '1', true, 1
function parseBool(val) {
  if (val === undefined || val === null || val === '') return undefined;
  return ['true', 'yes', '1', 1, true].includes(
    typeof val === 'string' ? val.toLowerCase() : val
  );
}

// Normalize 'yes/no/under progress' variants to match NodalOrgProfile enum exactly:
// ['yes', 'no', 'under_progress']. Returns undefined for unrecognized values so
// Mongoose omits the field rather than storing an invalid enum value.
function normalizeYesNoProgress(val) {
  const v = str(val).toLowerCase().trim();
  if (v === 'yes') return 'yes';
  if (v === 'no') return 'no';
  if (v === 'under progress' || (v.includes('under') && v.includes('progress'))) return 'under_progress';
  return undefined;
}

// Case-insensitive match against an enum array — returns the canonical enum string
// (preserving its original casing) or undefined if no match. Prevents Mongoose
// enum validation failures when the Excel column casing doesn't match the schema.
function normalizeToEnum(val, enumValues) {
  const v = str(val).trim();
  if (!v) return undefined;
  return enumValues.find(e => e.toLowerCase() === v.toLowerCase());
}

/** Build user flags from the loginType column.
 *  Valid values: 'email' | 'phone' | 'google'
 *  Users register via exactly one method — there is no combined type.
 */
function buildLoginFlags(loginType) {
  const type = str(loginType).toLowerCase() || 'email';
  return {
    isEmailUser: type === 'email',
    isPhoneUser: type === 'phone',
    isGoogleUser: type === 'google',
    isEmailVerified: type === 'email' || type === 'google',
    isPhoneVerified: type === 'phone',
    needsPassword: type !== 'google', // Google users have no password
  };
}

/** Summary counters */
const summary = {
  NO: { created: 0, skipped: 0, errored: 0 },
  AO: { created: 0, skipped: 0, errored: 0 },
  VLE: { created: 0, skipped: 0, errored: 0 },
  INNOVATOR: { created: 0, skipped: 0, errored: 0 },
  GENERAL_USER: { created: 0, skipped: 0, errored: 0 },
  Innovations: { created: 0, skipped: 0, errored: 0 },
  Problems: { created: 0, skipped: 0, errored: 0 },
};

// ─── Sheet parsers ────────────────────────────────────────────────────────────
function parseSheet(workbook, sheetName) {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    console.warn(`⚠️  Sheet "${sheetName}" not found in Excel file.`);
    return [];
  }
  return XLSX.utils.sheet_to_json(sheet, { defval: '' });
}

// ─── DB fallback lookup ───────────────────────────────────────────────────────
/**
 * Look up a user's _id by email OR phone.
 * Accepts either format — auto-detects based on content:
 *   email:  'ao@example.com'
 *   phone:  '9876543210' / '+919876543210' / '919876543210'
 *
 * Checks the in-memory map first (populated as users are created),
 * then falls back to DB — handles re-runs where users already exist
 * in DB but aren't in the current sheet.
 */
async function resolveUserId(identifier, userIdMap) {
  if (!identifier) return null;

  // Detect phone: digits only (with optional leading + or country code)
  const cleaned = String(identifier).trim();
  const isPhone = /^\+?\d{7,15}$/.test(cleaned.replace(/[\s()-]/g, ''));

  if (isPhone) {
    let normalized;
    try { normalized = normalizePhoneNumber(cleaned); } catch { normalized = cleaned; }
    if (userIdMap[normalized]) return userIdMap[normalized];
    const user = await User.findOne({ phone: normalized }).select('_id').lean();
    if (user) { userIdMap[normalized] = user._id; return user._id; }
    return null;
  }

  // Treat as email
  const normalized = cleaned.toLowerCase();
  if (userIdMap[normalized]) return userIdMap[normalized];
  const user = await User.findOne({ email: normalized }).select('_id').lean();
  if (user) { userIdMap[normalized] = user._id; return user._id; }
  return null;
}

// ─── User creation helper ─────────────────────────────────────────────────────

/**
 * Create a User doc (or skip if already exists).
 * Returns the saved/existing user, or null on unrecoverable error.
 *
 * NOTE: In dry-run mode we still connect to DB so duplicate checks work correctly.
 * We just skip the .save() calls. The userIdMap is populated with a fake ObjectId
 * in dry-run so the NO→AO→VLE chain continues to resolve correctly.
 */
async function createUser(row, roleLabel, userIdMap) {
  const email = str(row.email).toLowerCase();
  const flags = buildLoginFlags(row.loginType);

  // Normalize phone — required for phone users, optional for others
  let phone = '';
  if (str(row.phone)) {
    try { phone = normalizePhoneNumber(str(row.phone)); } catch {
      phone = str(row.phone);
    }
  }

  // Google accounts are always identified by email — passport.js:19 does
  // User.findOne({ email }) on every Google login. Without an email the
  // migrated user can never be found and passport creates a duplicate.
  if (flags.isGoogleUser && !email) {
    console.error(`  [${roleLabel}] Google users must have an email (passport looks up by email) — skipped`);
    return null;
  }

  // Must have at least one identifier
  if (!email && !phone) {
    console.error(`  [${roleLabel}] Row missing both email and phone — skipped`);
    return null;
  }

  // Human-readable label for log messages — avoids empty brackets for phone-only users
  const label = email || phone;

  // Duplicate check — by email if present, by phone otherwise
  let existing = null;
  if (email) existing = await User.findOne({ email });
  if (!existing && phone) existing = await User.findOne({ phone });

  if (existing) {
    console.warn(`  [${roleLabel}] SKIP — user already exists: ${label}`);
    if (email) userIdMap[email] = existing._id;
    if (phone) userIdMap[phone] = existing._id;
    summary[roleLabel].skipped++;
    return existing;
  }

  const userData = {
    fullName: str(row.fullName) || undefined,
    role: roleLabel,
    status: 'APPROVED',
    registrationComplete: true,
    isEmailUser: flags.isEmailUser,
    isPhoneUser: flags.isPhoneUser,
    isGoogleUser: flags.isGoogleUser,
    isEmailVerified: flags.isEmailVerified,
    isPhoneVerified: flags.isPhoneVerified,
  };

  // Only store email for email/google login; only store phone for phone login.
  // Prevents data pollution if a phone-user row accidentally has an email column filled.
  if (email && (flags.isEmailUser || flags.isGoogleUser)) userData.email = email;
  if (phone && flags.isPhoneUser) userData.phone = phone;

  if (flags.needsPassword) {
    // Use the password column if provided, otherwise fall back to DEFAULT_PASSWORD.
    // Pre-save hook on User model hashes whatever plain-text value is set here.
    userData.passwordHash = str(row.password) || DEFAULT_PASSWORD;
  }

  // Preserve original creation date if provided — falls back to Mongoose auto-timestamp.
  // approvedAt uses the same date so it doesn't show the migration date for old users.
  const createdAt = parseDate(row.createdAt) || new Date();
  userData.approvedAt = createdAt;
  userData.createdAt = createdAt;
  userData.updatedAt = createdAt;

  if (DRY_RUN) {
    const fakeId = new mongoose.Types.ObjectId();
    if (email) userIdMap[email] = fakeId;
    if (phone) userIdMap[phone] = fakeId;
    console.log(`  [DRY-RUN][${roleLabel}] Would create user: ${label}`);
    summary[roleLabel].created++;
    return { _id: fakeId, email, phone, role: roleLabel };
  }

  const user = new User(userData);
  await user.save();
  // Index by both so cross-references work regardless of which identifier is used
  if (email) userIdMap[email] = user._id;
  if (phone) userIdMap[phone] = user._id;
  summary[roleLabel].created++;
  return user;
}

// ─── Role migrations ──────────────────────────────────────────────────────────

async function migrateNOUsers(rows, userIdMap) {
  console.log('\n── Migrating Nodal Org (NO) users ──');
  console.log(`   Found ${rows.length} rows`);

  for (const row of rows) {
    const label = str(row.email).toLowerCase() || str(row.phone);
    try {
      const user = await createUser(row, 'NO', userIdMap);
      if (!user) { summary.NO.errored++; continue; }

      const existingProfile = await NodalOrgProfile.findOne({ userId: user._id });
      if (existingProfile) continue;

      const profileData = {
        userId: user._id,
        orgName: str(row.orgName),
        hqState: str(row.hqState),
        // Enum: ['non-profit','for-profit','government','hybrid'] — all lowercase.
        // normalizeToEnum handles 'Government'→'government', 'Non-Profit'→'non-profit'.
        // Falls back to raw lowercase value so Mongoose gives a clear enum error
        // if the Excel has something completely unrecognized.
        orgType: normalizeToEnum(row.orgType, ['non-profit', 'for-profit', 'government', 'hybrid'])
          || str(row.orgType).toLowerCase(),
        operationalStates: splitCSV(row.operationalStates),
        numberOfAffiliatedOrgs: num(row.numberOfAffiliatedOrgs) ?? 0,
        website: str(row.website) || undefined,
        description: str(row.description) || undefined,
        // Enum: ['yes', 'no', 'under_progress'] — lowercase. Normalize so Excel
        // variants like 'Yes'/'YES'/'under progress' don't fail Mongoose validation.
        hasRuralPrograms: normalizeYesNoProgress(row.hasRuralPrograms),
        hasTechIntegration: normalizeYesNoProgress(row.hasTechIntegration),
        channels: splitCSV(row.channels)
          .map(c => normalizeToEnum(c, [
            'Own Organization Branches',
            'FPOs / FPCs',
            'Cooperatives',
            'Gram Panchayats',
            'Other formal village or block level set-ups'
          ]))
          .filter(Boolean),
        potentialAoCount: num(row.potentialAoCount),
      };
      const noCreatedAt = parseDate(row.createdAt);
      if (noCreatedAt) { profileData.createdAt = noCreatedAt; profileData.updatedAt = noCreatedAt; }

      if (DRY_RUN) {
        console.log(`  [DRY-RUN][NO] Would create NodalOrgProfile for: ${label}`);
        continue;
      }

      await new NodalOrgProfile(profileData).save();
      console.log(`  ✓ NO created: ${label}`);
    } catch (err) {
      console.error(`  ✗ NO error [${label}]: ${err.message}`);
      summary.NO.errored++;
    }
  }
}

async function migrateAOUsers(rows, userIdMap) {
  console.log('\n── Migrating Affiliated Org (AO) users ──');
  console.log(`   Found ${rows.length} rows`);

  for (const row of rows) {
    const label = str(row.email).toLowerCase() || str(row.phone);
    try {
      // Validate nodalOrgIdentifier reference (accepts email or phone of the NO user)
      const noIdentifier = str(row.nodalOrg).trim();
      if (!noIdentifier) {
        console.error(`  ✗ AO [${label}]: missing nodalOrg — skipped`);
        summary.AO.errored++;
        continue;
      }
      // DB fallback: resolveUserId checks map first, then DB
      const noId = await resolveUserId(noIdentifier, userIdMap);
      if (!noId) {
        console.error(`  ✗ AO [${label}]: nodalOrg "${noIdentifier}" not found in sheet or DB — skipped`);
        summary.AO.errored++;
        continue;
      }

      const user = await createUser(row, 'AO', userIdMap);
      if (!user) { summary.AO.errored++; continue; }

      const existingProfile = await AoProfile.findOne({ userId: user._id });
      if (existingProfile) continue;

      const profileData = {
        userId: user._id,
        orgName: str(row.orgName),
        // Form submits lowercase values: 'fpc', 'shg', 'ngo', 'other'
        orgType: str(row.orgType).toLowerCase(),
        orgTypeOther: str(row.orgTypeOther) || undefined,
        // Form dropdown values are all lowercase: 'agriculture', 'skill_building', etc.
        streamOfWork: splitCSV(row.streamOfWork).map(v => v.toLowerCase().trim()),
        streamOfWorkOther: str(row.streamOfWorkOther) || undefined,
        pocName: str(row.pocName),
        village: str(row.village),
        district: str(row.district),
        state: str(row.state),
        website: str(row.website) || undefined,
        nodalOrg: noId,
      };
      const aoCreatedAt = parseDate(row.createdAt);
      if (aoCreatedAt) { profileData.createdAt = aoCreatedAt; profileData.updatedAt = aoCreatedAt; }

      if (DRY_RUN) {
        console.log(`  [DRY-RUN][AO] Would create AoProfile for: ${label}`);
        continue;
      }

      await new AoProfile(profileData).save();
      console.log(`  ✓ AO created: ${label}`);
    } catch (err) {
      console.error(`  ✗ AO error [${label}]: ${err.message}`);
      summary.AO.errored++;
    }
  }
}

async function migrateVLEUsers(rows, userIdMap) {
  console.log('\n── Migrating VLE users ──');
  console.log(`   Found ${rows.length} rows`);

  for (const row of rows) {
    const label = str(row.email).toLowerCase() || str(row.phone);
    try {
      const user = await createUser(row, 'VLE', userIdMap);
      if (!user) { summary.VLE.errored++; continue; }

      const existingProfile = await VleProfile.findOne({ userId: user._id });
      if (existingProfile) continue;

      // Resolve affiliatedOrg — DB fallback included
      let affiliatedOrgId = null;
      let registrationType = 'SELF_REGISTERED';
      if (str(row.affiliatedOrg)) {
        affiliatedOrgId = await resolveUserId(str(row.affiliatedOrg), userIdMap);
        if (!affiliatedOrgId) {
          console.warn(`  ⚠ VLE [${label}]: affiliatedOrg "${row.affiliatedOrg}" not found — registering as SELF_REGISTERED`);
        } else {
          registrationType = 'AO_REGISTERED';
        }
      }

      // VleProfile.mobile is a contact field (not a login identifier) — store as-is.
      // Do NOT normalize with +91; the frontend stores the raw number the user typed.
      const mobile = str(row.mobile);
      if (!mobile) {
        console.error(`  ✗ VLE [${label}]: mobile is required but empty — profile skipped`);
        summary.VLE.errored++;
        continue;
      }

      const profileData = {
        userId: user._id,
        registrationType,
        mobile,
        age: num(row.age),
        gender: str(row.gender).toLowerCase(),
        village: str(row.village),
        district: str(row.district),
        state: str(row.state),
        affiliatedOrg: affiliatedOrgId,
        mainLivelihood: str(row.mainLivelihood),
        livelihoodExperience: num(row.livelihoodExperience) ?? 0,
        otherLivelihoods: splitCSV(row.otherLivelihoods),
        yearlyRevenue: num(row.yearlyRevenue),
        qualification: str(row.qualification) || undefined,
        // Language values from the dropdown are all lowercase ('english', 'hindi', etc.)
        languages: splitCSV(row.languages).map(v => v.toLowerCase().trim()),
        // Frontend VLE form always sets this — all live VLEs have true or false.
        // Default to false so migrated profiles don't have an undefined that
        // could break the profile-edit conditional block.
        hasMachineExp: parseBool(row.hasMachineExp) ?? false,
        // trainingsTaken is a plain text field shown when hasMachineExp=yes
        trainingsTaken: str(row.trainingsTaken) || undefined,
        machineExpYears: num(row.machineExpYears) ?? 0,
        machinesWorkedWith: splitCSV(row.machinesWorkedWith),
        // Enum: ['Mechanic','Electrician','Plumber','Other'] — title case, required.
        // normalizeToEnum does case-insensitive matching ('mechanic' → 'Mechanic').
        // If blank or unrecognized, default to 'Other'.
        // IMPORTANT: VleProfile.vleCategoryOther is required by the model whenever
        // vleCategory === 'Other' — so we must always provide it in that case.
        ...(() => {
          const rawCat = str(row.vleCategory);
          const mapped = normalizeToEnum(rawCat, ['Mechanic', 'Electrician', 'Plumber', 'Other']);
          const finalCategory = mapped || 'Other';
          let finalCategoryOther;
          if (finalCategory === 'Other') {
            // Use raw Excel text if it was an unrecognised custom value (e.g. 'Progressive Farmer')
            // otherwise use the vleCategoryOther column; fall back to 'Not Specified' so the
            // required validator does not throw when both cells are blank.
            finalCategoryOther = (rawCat && rawCat.toLowerCase() !== 'other')
              ? rawCat
              : (str(row.vleCategoryOther) || 'Not Specified');
          }
          return { vleCategory: finalCategory, vleCategoryOther: finalCategoryOther };
        })(),
        // Enum: ['listed','interested','active','commercial'] — all lowercase.
        vleStatus: str(row.vleStatus).toLowerCase() || 'listed',
        // Enum values are snake_case: 'open_to_innovations', 'willing_to_travel', etc.
        supportAssessment: splitCSV(row.supportAssessment).map(v => v.toLowerCase().trim()),
      };
      const vleCreatedAt = parseDate(row.createdAt);
      if (vleCreatedAt) { profileData.createdAt = vleCreatedAt; profileData.updatedAt = vleCreatedAt; }

      if (DRY_RUN) {
        console.log(`  [DRY-RUN][VLE] Would create VleProfile for: ${label}`);
        continue;
      }

      await new VleProfile(profileData).save();
      console.log(`  ✓ VLE created: ${label}`);
    } catch (err) {
      console.error(`  ✗ VLE error [${label}]: ${err.message}`);
      summary.VLE.errored++;
    }
  }
}

async function migrateInnovators(rows, userIdMap) {
  console.log('\n── Migrating INNOVATOR users ──');
  console.log(`   Found ${rows.length} rows`);

  for (const row of rows) {
    const label = str(row.email).toLowerCase() || str(row.phone);
    try {
      const user = await createUser(row, 'INNOVATOR', userIdMap);
      if (!user) { summary.INNOVATOR.errored++; continue; }

      const existingProfile = await InnovatorProfile.findOne({ userId: user._id });
      if (existingProfile) continue;

      const profileData = {
        userId: user._id,
        enterpriseName: str(row.enterpriseName) || 'NA',
        startDate: parseDate(row.startDate),
        links: str(row.links) || undefined,
        addressLine1: str(row.addressLine1),
        addressLine2: str(row.addressLine2) || undefined,
        district: str(row.district),
        state: str(row.state),
        description: str(row.description),
      };
      const innovatorCreatedAt = parseDate(row.createdAt);
      if (innovatorCreatedAt) { profileData.createdAt = innovatorCreatedAt; profileData.updatedAt = innovatorCreatedAt; }

      if (DRY_RUN) {
        console.log(`  [DRY-RUN][INNOVATOR] Would create InnovatorProfile for: ${label}`);
        continue;
      }

      await new InnovatorProfile(profileData).save();
      console.log(`  ✓ INNOVATOR created: ${label}`);
    } catch (err) {
      console.error(`  ✗ INNOVATOR error [${label}]: ${err.message}`);
      summary.INNOVATOR.errored++;
    }
  }
}

async function migrateGeneralUsers(rows, userIdMap) {
  console.log('\n── Migrating GENERAL_USER users ──');
  console.log(`   Found ${rows.length} rows`);

  for (const row of rows) {
    const label = str(row.email).toLowerCase() || str(row.phone);
    try {
      const user = await createUser(row, 'GENERAL_USER', userIdMap);
      if (!user) { summary.GENERAL_USER.errored++; continue; }

      const existingProfile = await GeneralUserProfile.findOne({ userId: user._id });
      if (existingProfile) continue;

      // GeneralUserProfile.mobile is a contact field — store as-is, no +91 normalization.
      const mobile = str(row.mobile);
      // Mongoose required:true doesn't reject empty strings — check explicitly.
      if (!mobile) {
        console.error(`  ✗ GENERAL_USER [${label}]: mobile is required but empty — profile skipped`);
        summary.GENERAL_USER.errored++;
        continue;
      }

      const profileData = {
        userId: user._id,
        mobile,
        age: num(row.age),
        gender: str(row.gender).toLowerCase(),
        state: str(row.state),
        district: str(row.district),
        village: str(row.village),
      };
      const guCreatedAt = parseDate(row.createdAt);
      if (guCreatedAt) { profileData.createdAt = guCreatedAt; profileData.updatedAt = guCreatedAt; }

      if (DRY_RUN) {
        console.log(`  [DRY-RUN][GENERAL_USER] Would create GeneralUserProfile for: ${label}`);
        continue;
      }

      await new GeneralUserProfile(profileData).save();
      console.log(`  ✓ GENERAL_USER created: ${label}`);
    } catch (err) {
      console.error(`  ✗ GENERAL_USER error [${label}]: ${err.message}`);
      summary.GENERAL_USER.errored++;
    }
  }
}

// ─── Innovation migration ─────────────────────────────────────────────────────

async function migrateInnovations(innovationRows, userIdMap) {
  console.log('\n── Migrating Innovations ──');
  console.log(`   Found ${innovationRows.length} rows`);

  for (let i = 0; i < innovationRows.length; i++) {
    const row = innovationRows[i];
    const innovatorIdentifier = str(row.innovator).trim();

    try {
      // DB fallback: handles re-runs where innovator already exists in DB but not in sheet
      const innovatorId = await resolveUserId(innovatorIdentifier, userIdMap);
      if (!innovatorId) {
        console.error(`  ✗ Innovation row ${i + 2}: innovator "${innovatorIdentifier}" not found in sheet or DB — skipped`);
        summary.Innovations.errored++;
        continue;
      }

      // Duplicate check by innovatorId + name
      const existing = await Innovation.findOne({
        innovatorId,
        innovationName: str(row.innovationName),
      });
      if (existing) {
        console.warn(`  SKIP Innovation "${str(row.innovationName)}" — already exists for ${innovatorIdentifier}`);
        summary.Innovations.skipped++;
        continue;
      }

      // Upsert covered operations into MasterOperation collection
      // innovationValidation.js transforms coveredOperations via .toLowerCase().trim()
      // — mirror that here since collection.insertOne() bypasses Zod validators.
      const coveredOps = splitCSV(row.coveredOperations).map(v => v.toLowerCase().trim());
      if (!DRY_RUN) await upsertOperations(coveredOps);

      // All innovation category/stage/source values are lowercase in the constants
      // (innovationConstants.js). Normalize so Excel 'Agriculture' → 'agriculture'.
      // 'others' is filtered out — the frontend Zod transform (innovationSchema.js:226-227)
      // strips it from both arrays before sending: `category.filter(c => c !== 'others')`.
      // The custom text goes into categoryOther. Edit mode re-adds 'others' dynamically
      // from categoryOther (InnovationSubmissionPage.jsx:316-319) — if we stored 'others'
      // in the array, the edit form would show duplicate 'others' entries.
      const category = splitCSV(row.category).map(v => v.toLowerCase()).filter(v => v !== 'others');
      const subcategory = splitCSV(row.subcategory).map(v => v.toLowerCase()).filter(v => v !== 'others');
      const salesLocation = splitCSV(row.salesLocation);

      // Build sellingPrice only if at least one bound is provided
      const sellingPrice = {};
      const priceMin = num(row.sellingPriceMin);
      const priceMax = num(row.sellingPriceMax);
      if (priceMin !== undefined) sellingPrice.min = priceMin;
      if (priceMax !== undefined) sellingPrice.max = priceMax;

      const now = new Date();
      const innovationCreatedAt = parseDate(row.createdAt) || now;
      const innovationData = {
        innovatorId,
        innovationName: str(row.innovationName),
        description: str(row.description),
        category,
        categoryOther: str(row.categoryOther) || undefined,
        subcategory,
        subcategoryOther: str(row.subcategoryOther) || undefined,
        // Empty arrays — no placeholder image needed.
        // We use collection.insertOne() below to bypass the Mongoose pre-save hook
        // that requires media.images.length >= 1. The innovator uploads real images
        // via the UI afterward. Using a placeholder external URL here would cause
        // fileUploadController.deleteFile() to crash (it can't parse a placehold.co
        // URL into a DO Spaces object name).
        media: { images: [], videos: [] },
        downloadableResources: [],
        yearLaunched: num(row.yearLaunched),
        // Expected: 'idea'|'mvp'|'poc'|'sales' — lowercase
        innovationStage: str(row.innovationStage).toLowerCase() || undefined,
        sellingPrice: Object.keys(sellingPrice).length ? sellingPrice : undefined,
        numberOfUnitsInstalled: num(row.numberOfUnitsInstalled) ?? 0,
        // Expected: 'yes'|'only_few'|'not_any' — lowercase
        distributorNetwork: str(row.distributorNetwork).toLowerCase() || undefined,
        salesLocation,
        // Expected: 'manual'|'bullock'|'petrol_diesel'|'electrical'|'renewable' — lowercase
        powerSource: str(row.powerSource).toLowerCase() || undefined,
        pullCapacity: str(row.pullCapacity) || undefined,
        engineCapacity: str(row.engineCapacity) || undefined,
        motorCapacity: str(row.motorCapacity) || undefined,
        renewableType: str(row.renewableType).toLowerCase() || undefined,
        dimensions: str(row.dimensions) || undefined,
        weight: str(row.weight) || undefined,
        coveredOperations: coveredOps,
        manufacturingLocation: str(row.manufacturingLocation) || undefined,
        suitableCrops: str(row.suitableCrops) || undefined,
        suitableTerrains: str(row.suitableTerrains) || undefined,
        suitableSoil: str(row.suitableSoil) || undefined,
        weatherConditions: str(row.weatherConditions) || undefined,
        otherUsageConditions: str(row.otherUsageConditions) || undefined,
        importedParts: str(row.importedParts) || undefined,
        // Expected: 'yes'|'no' — lowercase
        spareParts: str(row.spareParts).toLowerCase() || undefined,
        maintenanceTraining: str(row.maintenanceTraining).toLowerCase() || undefined,
        // Expected: 'yes'|'no'|'open_to_explore'|'not_needed' — lowercase
        financingSupport: str(row.financingSupport).toLowerCase() || undefined,
        // Expected: 'yes'|'no'|'not_needed' — lowercase
        technicalTraining: str(row.technicalTraining).toLowerCase() || undefined,
        // Expected: 'yes'|'no' — lowercase
        demoInstallations: str(row.demoInstallations).toLowerCase() || undefined,
        attachments: str(row.attachments) || undefined,
        performanceParams: str(row.performanceParams) || undefined,
        keywords: [], // populated by runPostMigrationMatching() via NLP extraction
        matchingEnabled: true,
        status: 'PUBLISHED',
        approvedAt: innovationCreatedAt,
        views: 0,
        createdAt: innovationCreatedAt,
        updatedAt: innovationCreatedAt,
      };

      if (DRY_RUN) {
        console.log(`  [DRY-RUN] Would create Innovation: "${str(row.innovationName)}" for ${innovatorIdentifier}`);
        summary.Innovations.created++;
        continue;
      }

      // Use collection.insertOne() to bypass the Mongoose pre-save hook which
      // requires at least 1 image in media.images. This lets us store an empty
      // images array safely — innovators add real images via the UI.
      await Innovation.collection.insertOne(innovationData);
      console.log(`  ✓ Innovation created: "${str(row.innovationName)}" (${innovatorIdentifier})`);
      summary.Innovations.created++;
    } catch (err) {
      console.error(`  ✗ Innovation row ${i + 2} error [${innovatorIdentifier}]: ${err.message}`);
      summary.Innovations.errored++;
    }
  }
}

// ─── Problem (InnovationRequest) migration ────────────────────────────────────

async function migrateProblems(problemRows, userIdMap) {
  console.log('\n── Migrating Problems (InnovationRequests) ──');
  console.log(`   Found ${problemRows.length} rows`);

  for (let i = 0; i < problemRows.length; i++) {
    const row = problemRows[i];
    const postedByIdentifier = str(row.postedBy).trim();

    try {
      // DB fallback included
      const postedById = await resolveUserId(postedByIdentifier, userIdMap);
      if (!postedById) {
        console.error(`  ✗ Problem row ${i + 2}: postedBy "${postedByIdentifier}" not found in sheet or DB — skipped`);
        summary.Problems.errored++;
        continue;
      }

      // Duplicate check by postedBy + title
      const existing = await InnovationRequest.findOne({
        postedBy: postedById,
        problemTitle: str(row.problemTitle),
      });
      if (existing) {
        console.warn(`  SKIP Problem "${str(row.problemTitle)}" — already exists for ${postedByIdentifier}`);
        summary.Problems.skipped++;
        continue;
      }

      // Upsert operations into MasterOperation collection
      // innovationRequestValidation.js transforms both via .toLowerCase().trim()
      const operationsUndertaken = splitCSV(row.operationsUndertaken).map(v => v.toLowerCase().trim());
      const machineOperations = splitCSV(row.machineOperations).map(v => v.toLowerCase().trim());
      if (!DRY_RUN) {
        await upsertOperations(operationsUndertaken);
        await upsertOperations(machineOperations);
      }

      // Lowercase energySource values to match controller-stored data
      // (petrol_diesel, electrical, renewable, manual, bullock)
      const energySource = splitCSV(row.energySource).map(v => v.toLowerCase().trim());
      // PROBLEM_SUBCATEGORIES = ['maintenance_and_management', 'processing', 'production'] — lowercase
      const valueChainStages = splitCSV(row.valueChainStages).map(v => v.toLowerCase().trim());

      const problemData = {
        postedBy: postedById,
        registeredBy: null,
        registrationType: 'SELF_CREATED',
        problemTitle: str(row.problemTitle),
        problemDescription: str(row.problemDescription),
        regionState: str(row.regionState),
        regionDistrict: str(row.regionDistrict),
        regionVillage: str(row.regionVillage),
        // PROBLEM_CATEGORIES are all lowercase — normalize so 'Agriculture' → 'agriculture'.
        // Frontend Zod transform (problemSchema.js:107-108): when category === 'others',
        // the field is set to '' and the text goes into categoryOther.
        // Mirror that here so the DB is consistent with records saved via the form.
        ...((() => {
          const cat = str(row.category).toLowerCase();
          if (cat === 'others') {
            return { category: '', categoryOther: str(row.categoryOther) || undefined };
          }
          return { category: cat || undefined, categoryOther: undefined };
        })()),
        valueChainStages,
        crops: str(row.crops) || undefined,
        operationsUndertaken,
        machineOperations,
        currentMethodology: str(row.currentMethodology) || undefined,
        // YES_NO = ['yes', 'no'] — lowercase. Stored as lowercase by controllers.
        knowMachinery: str(row.knowMachinery).toLowerCase() || undefined,
        machineChallenge: str(row.machineChallenge) || undefined,
        energySource,
        pullCapacity: str(row.pullCapacity) || undefined,
        engineCapacity: str(row.engineCapacity) || undefined,
        motorCapacity: str(row.motorCapacity) || undefined,
        renewableType: str(row.renewableType).toLowerCase() || undefined,
        specificInfo: str(row.specificInfo) || undefined,
        problemSize: str(row.problemSize) || undefined,
        endProducts: str(row.endProducts) || undefined,
        salesChannels: str(row.salesChannels) || undefined,
        newChannels: str(row.newChannels) || undefined,
        currentRevenue: num(row.currentRevenue),
        expectedRevenue: num(row.expectedRevenue),
        machineBudget: num(row.machineBudget),
        coverImage: str(row.coverImage) || undefined,
        mediaFiles: [],
        upvotes: 0,
        keywords: [], // populated by runPostMigrationMatching() via NLP extraction
        matchingEnabled: true,
        status: 'PUBLISHED',
      };
      const problemCreatedAt = parseDate(row.createdAt);
      if (problemCreatedAt) {
        problemData.createdAt = problemCreatedAt;
        problemData.updatedAt = problemCreatedAt;
        problemData.approvedAt = problemCreatedAt;
      } else {
        problemData.approvedAt = new Date();
      }

      if (DRY_RUN) {
        console.log(`  [DRY-RUN] Would create Problem: "${str(row.problemTitle)}" for ${postedByIdentifier}`);
        summary.Problems.created++;
        continue;
      }

      await new InnovationRequest(problemData).save();

      // Mirror what approveOrgProblem does: a VLE whose problem is published moves
      // from 'listed' → 'interested'. The vleStatus: 'listed' filter makes this a
      // safe no-op for AO/NO posters — no VleProfile with that userId will match.
      await VleProfile.updateOne(
        { userId: postedById, vleStatus: 'listed' },
        { $set: { vleStatus: 'interested' } }
      );

      console.log(`  ✓ Problem created: "${str(row.problemTitle)}" (${postedByIdentifier})`);
      summary.Problems.created++;
    } catch (err) {
      console.error(`  ✗ Problem row ${i + 2} error [${postedByIdentifier}]: ${err.message}`);
      summary.Problems.errored++;
    }
  }
}

// ─── Post-migration: NLP keyword extraction + Match population ────────────────

async function runPostMigrationMatching() {
  console.log('\n── Post-migration: NLP keywords + Match population ──');

  const allProblems    = await InnovationRequest.find({ status: 'PUBLISHED', matchingEnabled: true });
  const allInnovations = await Innovation.find({ status: 'PUBLISHED', matchingEnabled: true });

  // Update problem keywords — InnovationRequest.save() has no image restriction, safe to call
  for (const p of allProblems) {
    try { await updateProblemKeywords(p._id); }
    catch (e) { console.error(`  ✗ kw-problem ${p._id}: ${e.message}`); }
  }

  // Update innovation keywords via direct DB update — avoids the pre-save hook that
  // requires media.images.length >= 1 (migrated innovations have no images yet)
  for (const inv of allInnovations) {
    try {
      const kw = extractKeywords(`${inv.innovationName} ${inv.description}`);
      await Innovation.updateOne({ _id: inv._id }, { $set: { keywords: kw } });
    } catch (e) { console.error(`  ✗ kw-innovation ${inv._id}: ${e.message}`); }
  }

  // Re-fetch problems so they carry the freshly stored stemmed keywords, then run matching
  const freshProblems = await InnovationRequest.find({ status: 'PUBLISHED', matchingEnabled: true });
  let totalMatches = 0;
  for (const p of freshProblems) {
    try {
      const r = await findMatchingInnovations(p._id);
      totalMatches += r.savedCount;
      if (r.savedCount > 0) console.log(`  ✓ "${p.problemTitle}": ${r.savedCount} match(es) saved`);
    } catch (e) { console.error(`  ✗ match-problem ${p._id}: ${e.message}`); }
  }

  console.log(`  Problems: ${allProblems.length} kw updated | Innovations: ${allInnovations.length} kw updated | Matches saved: ${totalMatches}`);
}

// ─── Summary printer ──────────────────────────────────────────────────────────
function printSummary() {
  console.log('\n═══════════════════════════════════════');
  console.log('        MIGRATION SUMMARY');
  if (DRY_RUN) console.log('        (DRY RUN — no changes saved)');
  console.log('═══════════════════════════════════════');
  const rows = [
    ['Entity', 'Created', 'Skipped', 'Errored'],
    ['─────────────────', '───────', '───────', '───────'],
    ...Object.entries(summary).map(([k, v]) => [k, v.created, v.skipped, v.errored]),
  ];
  rows.forEach(([e, c, s, er]) =>
    console.log(`  ${String(e).padEnd(18)} ${String(c).padStart(7)}  ${String(s).padStart(7)}  ${String(er).padStart(7)}`)
  );
  console.log('═══════════════════════════════════════');
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('╔══════════════════════════════════════╗');
  console.log('║   InnovationGuild Excel Migration    ║');
  console.log('╚══════════════════════════════════════╝');
  if (DRY_RUN) console.log('🔍 DRY RUN mode — DB connected for duplicate checks, no data written\n');
  console.log(`📂 Excel file: ${EXCEL_PATH}`);

  // Load Excel first (fail fast before connecting to DB)
  let workbook;
  try {
    workbook = XLSX.readFile(EXCEL_PATH, { cellDates: true });
  } catch (err) {
    console.error(`\n❌ Could not read Excel file: ${err.message}`);
    console.error(`   Expected path: ${EXCEL_PATH}`);
    console.error('   Create the file or pass --file <path>');
    process.exit(1);
  }

  // Always connect to DB — even in dry-run so duplicate checks work correctly
  await connectDB();

  // Parse sheets — one sheet per role, plus Innovations and Problems
  const noRows           = parseSheet(workbook, 'NO');
  const aoRows           = parseSheet(workbook, 'AO');
  const vleRows          = parseSheet(workbook, 'VLE');
  const innovatorRows    = parseSheet(workbook, 'INNOVATOR');
  const generalUserRows  = parseSheet(workbook, 'GENERAL_USER');
  const innovationRows   = parseSheet(workbook, 'Innovations');
  const problemRows      = parseSheet(workbook, 'Problems');

  console.log(`\n📊 Sheet row counts:`);
  console.log(`   NO:           ${noRows.length}`);
  console.log(`   AO:           ${aoRows.length}`);
  console.log(`   VLE:          ${vleRows.length}`);
  console.log(`   INNOVATOR:    ${innovatorRows.length}`);
  console.log(`   GENERAL_USER: ${generalUserRows.length}`);
  console.log(`   Innovations:  ${innovationRows.length}`);
  console.log(`   Problems:     ${problemRows.length}`);

  // email/phone → ObjectId map, populated as each user is created/skipped
  const userIdMap = {};

  // Process in dependency order: NO → AO → VLE → INNOVATOR → GENERAL_USER → content
  await migrateNOUsers(noRows, userIdMap);
  await migrateAOUsers(aoRows, userIdMap);
  await migrateVLEUsers(vleRows, userIdMap);
  await migrateInnovators(innovatorRows, userIdMap);
  await migrateGeneralUsers(generalUserRows, userIdMap);
  await migrateInnovations(innovationRows, userIdMap);
  await migrateProblems(problemRows, userIdMap);

  if (!DRY_RUN) {
    await runPostMigrationMatching();
  }

  printSummary();

  await mongoose.connection.close();
  process.exit(0);
}

main().catch((err) => {
  console.error('\n❌ Unexpected error:', err.message);
  process.exit(1);
});
