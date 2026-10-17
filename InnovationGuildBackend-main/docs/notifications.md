# Notifications

## Channels

| Channel | Provider | Implementation |
|---|---|---|
| In-app | MongoDB (`Notification` model) | Retrieved via `GET /api/common/notifications` |
| Email | SendGrid | `src/services/notification/channels/email.js` |
| SMS | Twilio | `src/services/notification/channels/sms.js` |
| WhatsApp | Twilio | `src/services/notification/channels/whatsapp.js` |

**Channel selection per user:**
- Email users (registered via email/Google) → email
- Phone users (registered via mobile) → SMS + WhatsApp
- Phone number resolved by `phoneResolver.js`: prefers `user.phone`, falls back to `VleProfile.mobile`
- In-app is always sent regardless of login method

---

## Events

### Auth / Registration

| Event | Trigger | Recipient | Channels |
|---|---|---|---|
| `REGISTRATION_RECEIVED` | Role profile completion | User | In-app, email, SMS, WhatsApp |
| `NEW_USER_REGISTERED` | Innovator / VLE / AO registers | Admin | In-app, email |
| `NEW_NODAL_ORG_REGISTERED` | NO registers | Admin | In-app, email |
| `USER_APPROVED` | Admin approves user | User | In-app, email, SMS, WhatsApp |
| `USER_REJECTED` | Admin rejects user | User | In-app, email, SMS, WhatsApp |

### AO Registration (NO flow)

| Event | Trigger | Recipient | Channels |
|---|---|---|---|
| `AO_PENDING` | AO registered by NO | NO | In-app, email, SMS, WhatsApp |
| `AO_APPROVED` | NO approves AO | AO | In-app, email, SMS, WhatsApp |
| `AO_REJECTED` | NO rejects AO | AO | In-app, email, SMS, WhatsApp |

### VLE Registration (AO flow)

| Event | Trigger | Recipient | Channels |
|---|---|---|---|
| `VLE_REGISTERED_BY_AO` | AO registers VLE | VLE | In-app, email, SMS, WhatsApp |
| `VLE_REGISTERED_CONFIRMED` | VLE registration confirmed | AO | In-app, email, SMS, WhatsApp |

### Content Approval

| Event | Trigger | Recipient | Channels |
|---|---|---|---|
| `NEW_INNOVATION_SUBMITTED` | Innovator submits innovation | Admin | In-app, email |
| `INNOVATION_APPROVED` | Admin approves innovation | Innovator | In-app, email, SMS, WhatsApp |
| `INNOVATION_REJECTED` | Admin rejects innovation | Innovator | In-app, email, SMS, WhatsApp |
| `PROBLEM_APPROVED` | Admin/org approves problem | Problem poster | In-app, email, SMS, WhatsApp |
| `PROBLEM_REJECTED` | Admin/org rejects problem | Problem poster | In-app, email, SMS, WhatsApp |
| `SERVICE_REQUEST_APPROVED` | Admin approves service request | Poster | In-app, email, SMS, WhatsApp |
| `SERVICE_REQUEST_REJECTED` | Admin rejects service request | Poster | In-app, email, SMS, WhatsApp |
| `EDIT_REQUESTED` | Admin requests edits to content | Content creator | In-app, email, SMS, WhatsApp |

### Broadcasts (fired on approval)

| Event | Trigger | Recipient | Channels |
|---|---|---|---|
| `NEW_INNOVATION_PUBLISHED` | Innovation approved → published | All approved VLE + AO | In-app, email, WhatsApp |
| `NEW_PROBLEM_PUBLISHED` | Problem approved → published | All approved INNOVATOR | In-app, email, WhatsApp |
| `NEW_AO_APPROVED` | New AO approved | All approved INNOVATOR | In-app, email, WhatsApp |

### Pilots

| Event | Trigger | Recipient | Channels |
|---|---|---|---|
| `PILOT_REQUEST_RECEIVED` | VLE requests pilot on an innovation | Innovator | In-app, email, SMS, WhatsApp |
| `VLE_PILOT_REQUEST` | VLE requests a pilot (same event) | The VLE's AO + NO | In-app, email, SMS, WhatsApp |
| `PILOT_REQUEST_SUBMITTED` | VLE requests a pilot (same event) | Admins | In-app, email |
| `PILOT_STATUS_CHANGED` | Pilot status updated | VLE + Innovator | In-app, email, SMS, WhatsApp |
| `PILOT_IMPLEMENTED` | Pilot marked as implemented | VLE + Innovator | In-app, email, SMS, WhatsApp |

### Problems & Service Requests

| Event | Trigger | Recipient | Channels |
|---|---|---|---|
| `VLE_SUBMITTED_PROBLEM` | VLE submits a problem | AO | In-app, email, SMS, WhatsApp |
| `PROBLEM_CREATED_FOR_VLE` | AO/NO creates problem on behalf of VLE | VLE | In-app, email, SMS, WhatsApp |
| `NEW_SERVICE_REQUEST_SUBMITTED` | VLE submits service request | Admin + AO | In-app, email, SMS, WhatsApp |
| `FIELD_REPORT_SUBMITTED` | AO submits field report | Admin | In-app, email |

### Comments

| Event | Trigger | Recipient | Channels |
|---|---|---|---|
| `COMMENT_RECEIVED` | Comment posted on innovation or problem | Content owner | In-app, email, SMS, WhatsApp |

### Other

| Event | Trigger | Recipient | Channels |
|---|---|---|---|
| Contact form | User submits contact form | Admin (email address) | Email only |
| Newsletter welcome | User subscribes to newsletter | User | Email only |
