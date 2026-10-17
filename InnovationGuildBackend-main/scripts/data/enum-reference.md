# Excel Migration — Enum Reference

Valid values for every dropdown, radio button, and checkbox column in `migration.xlsx`.
Columns not listed here accept free text.

---

## Common: createdAt (all sheets)

| Rule | Detail |
|------|--------|
| ISO date string | `2023-06-15` — preserves the original registration/creation date from the old system |
| Leave blank | Defaults to the date the migration script runs |

---

## Common: password (NO, AO, VLE, INNOVATOR, GENERAL_USER sheets)

| Rule | Detail |
|------|--------|
| Plain text | Enter the desired password — the migration script hashes it automatically |
| Leave blank | Falls back to the default password `TechDhaara@1234` |
| Google login | Leave blank — Google users have no password |

---

## Common: loginType (all sheets)

| Value | Meaning |
|-------|---------|
| `email` | User logs in with email + password |
| `phone` | User logs in with phone  (no email stored) |
| `google` | User logs in via Google OAuth only (no password; must have email) |

---

## SHEET: NO

| Column | Valid values |
|--------|-------------|
| `loginType` | `email` · `phone` · `google` |
| `orgType` | `non-profit` · `for-profit` · `government` · `hybrid` |
| `hqState` | 2-letter state code (e.g. `MH`, `DL`, `GJ`) |
| `operationalStates` | Comma-separated state codes — e.g. `MH,GJ,MP` |
| `hasRuralPrograms` | `yes` · `no` · `under_progress` |
| `hasTechIntegration` | `yes` · `no` · `under_progress` |
| `channels` | Comma-separated. One or more of: `Own Organization Branches` · `FPOs / FPCs` · `Cooperatives` · `Gram Panchayats` · `Other formal village or block level set-ups` |
| `potentialAoCount` | Integer — min `1`, max `10000` |

---

## SHEET: AO

| Column | Valid values |
|--------|-------------|
| `loginType` | `email` · `phone` · `google` |
| `orgType` | `fpc` · `shg` · `ngo` · `other` (if `other`, fill `orgTypeOther`) |
| `streamOfWork` | Comma-separated: `agriculture` · `skill_building` · `livelihoods` · `textiles` · `arts_crafts` · `climate_change` · `other` (if `other`, fill `streamOfWorkOther`) |
| `nodalOrg` | Email or phone of the NO user this AO belongs to |

---

## SHEET: VLE

| Column | Valid values |
|--------|-------------|
| `loginType` | `email` · `phone` · `google` |
| `gender` | `male` · `female` · `other` |
| `languages` | Comma-separated language names — e.g. `english,hindi,marathi` (any string accepted; common values: `english`, `hindi`, `marathi`, `tamil`, `telugu`, `kannada`, `malayalam`, `bengali`, `gujarati`, `punjabi`, `odia`, `assamese`, `urdu`) |
| `vleCategory` | `Mechanic` · `Electrician` · `Plumber` · `Other` (if `Other`, fill `vleCategoryOther`) |
| `supportAssessment` | Comma-separated: `open_to_innovations` · `willing_to_travel` · `open_to_investments` · `has_smartphone` · `village_groups` · `literate_local_language` · `identify_tech_gaps` · `business_experience` |
| `hasMachineExp` | `Yes` · `No` (case-insensitive) |
| `vleStatus` | `listed` · `interested` · `active` · `commercial` |
| `affiliatedOrg` | Email or phone of the AO user this VLE belongs to |
| `age` | Integer — min `10`, max `100` |
| `livelihoodExperience` | Number — years, min `0` |
| `machineExpYears` | Number — years, min `0` (required when `hasMachineExp=Yes`) |
| `yearlyRevenue` | Number — annual revenue in rupees, min `0` |

> **Note:** `mobile` is **required** — store as 10-digit number without `+91` (e.g. `9876543210`). Leaving it blank will cause the profile to be skipped.

---

## SHEET: INNOVATOR

| Column | Valid values |
|--------|-------------|
| `loginType` | `email` · `phone` · `google` |
| `state` | 2-letter state code (e.g. `MH`, `DL`) |
| `district` | District code (e.g. `PUN`, `NDL`) |
| `startDate` | ISO date string — e.g. `2020-06-01` |

---

## SHEET: GENERAL_USER

| Column | Valid values |
|--------|-------------|
| `loginType` | `email` · `phone` · `google` |
| `gender` | `male` · `female` · `other` |
| `state` | 2-letter state code |
| `district` | District code |
| `age` | Integer — min `10`, max `100` |

> **Note:** `mobile` is **required** — store as 10-digit number without `+91`. Leaving it blank will cause the profile to be skipped.

---

## SHEET: Innovations

| Column | Valid values |
|--------|-------------|
| `innovator` | Email or phone of the INNOVATOR user |
| `yearLaunched` | 4-digit year — min `1900`, max current year |
| `sellingPriceMin` | Number — minimum selling price in rupees. **Single fixed price? Enter the same value in both min and max.** |
| `sellingPriceMax` | Number — maximum selling price in rupees. Leave both blank if price is unknown. |
| `numberOfUnitsInstalled` | Number — count of units installed/deployed |
| `category` | Comma-separated (up to 3): `agriculture` · `textiles` · `fisheries` · `bamboo` · `poultry` · `dairy` · `others` (if `others`, fill `categoryOther`) |
| `subcategory` | Comma-separated (up to 3): `maintenance_and_management` · `processing` · `production` · `others` (if `others`, fill `subcategoryOther`) |
| `innovationStage` | `idea` · `mvp` · `poc` · `sales` |
| `powerSource` | `manual` · `bullock` · `petrol_diesel` · `electrical` · `renewable` |
| `renewableType` | Required if `powerSource=renewable`: `solar` · `wind` · `biomass` · `hydro` · `geothermal` · `others` |
| `engineCapacity` | Required if `powerSource=petrol_diesel` — e.g. `5 HP` |
| `motorCapacity` | Required if `powerSource=electrical` or `renewable` — e.g. `1-2 kW` |
| `pullCapacity` | Optional if `powerSource=manual` or `bullock` |
| `coveredOperations` | Comma-separated (up to 3): `bed_making` · `drying` · `harvesting` · `interculture` · `irrigation` · `oil_extraction` · `packaging` · `quality_testing` · `raking` · `shelling` · `sowing` · `spraying` · `threshing` · `tillage` · `transportation` · `weeding` · `winnowing` |
| `distributorNetwork` | `yes` · `only_few` · `not_any` |
| `spareParts` | `yes` · `no` |
| `maintenanceTraining` | `yes` · `no` |
| `technicalTraining` | `yes` · `no` · `not_needed` |
| `demoInstallations` | `yes` · `no` |
| `financingSupport` | `yes` · `no` · `open_to_explore` · `not_needed` |
| `salesLocation` | Comma-separated state codes — e.g. `MH,GJ,MP` |

---

## SHEET: Problems

| Column | Valid values |
|--------|-------------|
| `postedBy` | Email or phone of the VLE/AO/NO user who posted the problem |
| `category` | `agriculture` · `textiles` · `bamboo` · `fisheries` · `poultry` · `dairy` · `others` (if `others`, fill `categoryOther`) |
| `valueChainStages` | Comma-separated: `maintenance_and_management` · `processing` · `production` |
| `energySource` | Comma-separated: `manual` · `bullock` · `petrol_diesel` · `electrical` · `renewable` |
| `operationsUndertaken` | Comma-separated (up to 10): `bed_making` · `drying` · `harvesting` · `interculture` · `irrigation` · `oil_extraction` · `packaging` · `quality_testing` · `raking` · `shelling` · `sowing` · `spraying` · `threshing` · `tillage` · `transportation` · `weeding` · `winnowing` |
| `machineOperations` | Same options as `operationsUndertaken` (up to 10) |
| `knowMachinery` | `yes` · `no` |

---

## State Codes

Use the `stateCode` field from provided **`states.json`**.

Example entries:

| `stateCode` | `stateName` |
|-------------|-------------|
| `MH` | Maharashtra |
| `DL` | Delhi |
| `GJ` | Gujarat |
| `AP` | Andhra Pradesh |
| `TS` | Telangana |
| … | *(see states.json for the full list)* |

---

## District Codes

Use the `districtCode` field from provided **`districts.json`**.
Filter by `stateCode` to find districts for a specific state.

Example entries:

| `districtCode` | `districtName` | `stateCode` |
|----------------|----------------|-------------|
| `PUN` | Pune | `MH` |
| `NDL` | New Delhi | `DL` |
| `RTG` | Ratnagiri | `MH` |
| … | *(see districts.json for the full list)* | |
