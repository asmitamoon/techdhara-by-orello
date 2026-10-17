# VLE account creation requirements

Recorded: 18 September 2026.

This document lists the data needed to create a Village Level Entrepreneur (VLE)
account through the current application. Required fields below follow the frontend
registration validation; backend differences are recorded separately.

## Account access

For self-registration, select the VLE role and use one of these methods:

| Method | Required information or action |
| --- | --- |
| Email | Email address, password, password confirmation, and email OTP verification |
| Mobile | Mobile number, password, password confirmation, and SMS OTP verification |
| Google | Google account authorization, followed by completion of the VLE profile |

The frontend password rules require 8–50 characters, including at least one
uppercase letter, one lowercase letter, and one number. Email/SMS OTPs are six digits.
A profile mobile number is required even when registering with email or Google.
Passwords and OTPs should be entered in the registration flow, not collected in a
migration document.

## Required profile details

| Detail | API field | Current form requirement |
| --- | --- | --- |
| Full name | `fullName` | 2–50 characters; English letters and spaces |
| Mobile number | `mobile` | 10-digit Indian number starting with 6, 7, 8, or 9 |
| Age | `age` | Whole number from 10 to 100 |
| Gender | `gender` | Male, female, or other |
| State | `state` | Select a state |
| District | `district` | Select a district |
| Village/city | `village` | 3–50 characters |
| Organization affiliation | `affiliatedOrg` | Select an organization, or select “Not affiliated” |
| Main livelihood | `mainLivelihood` | 3–50 characters |
| Livelihood experience | `livelihoodExperience` | Whole number from 1 to 100 years |
| Yearly revenue | `yearlyRevenue` | Positive whole number; zero is rejected by the form |
| Highest qualification | `qualification` | 3–50 characters |
| Languages known | `languages` | At least one language |
| Machine/equipment experience | `hasMachineExp` | Answer Yes or No; sent to the API as a boolean |
| VLE category | `vleCategory` | Mechanic, Electrician, Plumber, or Other |

The form describes yearly revenue as information that will not be showcased on
the website. This review did not independently audit all places where that value
may be exposed.

## Conditionally required details

When machine/equipment experience is **Yes**, supply:

| Detail | API field | Current form requirement |
| --- | --- | --- |
| Training details | `trainingsTaken` | Nonempty; maximum 200 characters |
| Machine experience | `machineExpYears` | Whole number from 1 to 100 years |
| Machines worked with | `machinesWorkedWith` | At least one entry |

When VLE category is **Other**, supply `vleCategoryOther`: a nonempty description
of up to 50 characters using letters, numbers, spaces, or hyphens.

For self-registration, organization selection is required unless “Not affiliated”
is selected. The frontend uses `isNotAffiliated` to control this choice and omits
`affiliatedOrg` from the API payload when not affiliated.

## Optional details

| Detail | Field | Notes |
| --- | --- | --- |
| Profile photograph | `profilePic` in the form | Optional; JPEG, PNG, or WebP; maximum 10 MB under frontend validation |
| Other livelihoods | `otherLivelihoods` | List of additional livelihoods |
| Support/readiness assessment | `supportAssessment` | Optional selections listed below |

Support/readiness assessment choices:

- Open to learning about new innovations.
- Willing to travel for exposure and learning.
- Open to investing in the livelihood opportunity.
- Has access to a smartphone and internet.
- Engaged with village groups and community initiatives.
- Can read and write in the local language.
- Can identify local technology gaps in village livelihoods.
- Has basic entrepreneurial or business experience.

## Registration by an affiliated organization

The AO-assisted flow collects email or phone, a password, OTP verification, and
the VLE profile details. The backend links the VLE to the logged-in AO automatically
and records `registrationType=AO_REGISTERED`. The controller creates these accounts
with `status=APPROVED`. The model defaults self-registered profiles to
`registrationType=SELF_REGISTERED`.

## Validation differences to consider during migration

- **Yearly revenue and qualification:** required by the form, optional in backend
  registration validation. The backend accepts zero revenue, while the form rejects it.
- **Livelihood experience:** the form requires 1–100 whole years; backend registration
  validation accepts nonnegative values, including zero.
- **Machine experience years:** required as 1–100 whole years by the form when machine
  experience is Yes. Backend validation does not enforce the same conditional
  positive-year requirement and supplies a default of zero.
- **Affiliation:** the self-registration form requires an organization selection or
  an explicit “Not affiliated” choice; the backend accepts an omitted organization.
- **Other category:** the form and database model require the category description
  when Other is selected, but the registration request validator does not enforce
  this condition itself.

These differences are findings, not changes made to the application. Decide how to
handle existing records with missing or zero values before importing them; do not
invent personal or business information to satisfy the form.

## Source files

- [Frontend registration schema](../InnovationGuild-main/src/schemas/registrationSchema.js)
- [Frontend shared validation](../InnovationGuild-main/src/schemas/common.js)
- [VLE registration form](../InnovationGuild-main/src/pages/common/Register/_components/VleProfileForm.jsx)
- [Backend profile validation](../InnovationGuildBackend-main/src/validators/userValidation.js)
- [Backend authentication validation](../InnovationGuildBackend-main/src/validators/authValidation.js)
- [VLE profile model](../InnovationGuildBackend-main/src/models/VleProfile.js)
- [VLE self-registration controller](../InnovationGuildBackend-main/src/api/controllers/auth/vleRegistrationController.js)
- [AO-assisted VLE registration controller](../InnovationGuildBackend-main/src/api/controllers/ao/vleManagementController.js)
