# Architecture Overview

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js + Express 5 |
| Database | MongoDB Atlas (Mongoose) |
| Cache / Queues | Redis (redis-stack) via Bull |
| File Storage | MinIO (local dev) / DigitalOcean Spaces (production) |
| Auth | JWT + Google OAuth 2.0 (Passport) |
| Email | SendGrid |
| SMS / WhatsApp | Twilio |
| Validation | Zod |
| Image processing | Sharp (WebP compression) |
| Video processing | FFmpeg (async, Bull queue) |

---

## Request Lifecycle

Middleware applied in order for every request:

1. CORS — origin: `FRONTEND_URL`, credentials: true
2. `express.json` — 50MB body limit
3. `express.urlencoded` — 50MB, extended
4. `cookieParser`
5. `passport.initialize`
6. Routes — mounted at `/api`
7. 404 handler
8. Global error handler

---

## Route Map

| Prefix | Access |
|---|---|
| `/api/auth` | Public (login/register) + authenticated (profile completion) |
| `/api/public` | Unauthenticated |
| `/api/common` | All authenticated roles |
| `/api/innovator` | INNOVATOR |
| `/api/vle` | VLE |
| `/api/ao` | AO |
| `/api/nodal-org` | NO (Nodal Organization) |
| `/api/org` | AO + NO shared |
| `/api/admin` | ADMIN + SUPER_ADMIN |

---

## Authentication

Three login methods — all produce the same JWT token pair:

- **Email** — register → verify OTP → login
- **Mobile** — enter phone → verify OTP
- **Google OAuth** — redirect to Google → callback → create/find user

**Tokens:**
- Access token — 15 min, JWT, sent in `Authorization: Bearer <token>` header
- Refresh token — 7 days, stored in `RefreshToken` collection, exchanged via `/api/auth/refresh`

**Registration completion:**
After first login, users with `registrationComplete: false` must call their role-specific endpoint (`POST /api/auth/{role}/complete-registration`) before they can access role-protected routes.

---

## User Roles & Status

**Roles:** `SUPER_ADMIN`, `ADMIN`, `NO`, `VLE`, `INNOVATOR`, `AO`, `GENERAL_USER`

**Status lifecycle:**

```
PENDING (default)
    ├── APPROVED
    ├── REJECTED
    ├── SUSPENDED
    └── BANNED
```

- GENERAL_USER is auto-approved on profile completion
- All other non-admin roles go through admin/org approval

---

## Content Statuses

**Innovation:**
```
DRAFT → PENDING_APPROVAL → PUBLISHED
                         └── REJECTED
```

**Pilot:**
```
PENDING → PILOT_STARTED → TRIAL_STARTED → IMPLEMENTED
                                        └── CANCELLED
```

---

## Key Services

| Service | Location | Purpose |
|---|---|---|
| Auth | `src/services/auth/` | OTP management, email/mobile auth flows |
| Matching | `src/services/matching/` | Structured problem-to-innovation matching — scores on shared operations (problem `operationsUndertaken`/`machineOperations` ∩ innovation `coveredOperations`) plus raw-material/crop overlap. Location is computed for display but not scored. |
| Notification | `src/services/notification/` | In-app (Notification model) + email (SendGrid) + SMS/WhatsApp (Twilio); organized by channel and role |
| Cache | `src/services/cache/` | Redis cache for public content, OTPs, match results |
| Queue | `src/services/queue/` | Bull queues for async video transcoding |
| Storage | `src/services/storage/` | MinIO / DigitalOcean Spaces file operations |

---

## File Upload Limits

| Type | Max size | Max count | Formats | Processing |
|---|---|---|---|---|
| Image | 5 MB each | 10 | jpeg, png, webp | Compressed to WebP 85%, max 3000×3000 |
| Video | 200 MB each | 2 | mp4, mpeg, mov, avi | Transcoded to 720p H.264 via FFmpeg (async) |
| Document | 10 MB each | 10 | pdf, ppt, doc, xls | Stored as-is |
