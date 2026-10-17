# Local Development Setup

## Prerequisites

- Node.js v18+
- Docker & Docker Compose
- MongoDB Atlas account (connection string)

## Steps

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in the values — see [Environment Variables](#environment-variables) below.

### 3. Start infrastructure

```bash
docker compose up -d
```

This starts Redis and MinIO. The app runs separately.

### 4. Start the server

```bash
npm run dev   # development (hot reload)
npm start     # production
```

Server runs on `http://localhost:5000` by default.

---

## Environment Variables

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `REDIS_URL` | Redis URL — default `redis://localhost:6379` |
| `JWT_ACCESS_SECRET` | Secret for signing access tokens |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens |
| `JWT_ACCESS_EXPIRY` | Access token expiry — default `15m` |
| `JWT_REFRESH_EXPIRY` | Refresh token expiry — default `7d` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GOOGLE_REDIRECT_URI` | OAuth callback — `http://localhost:5000/api/auth/google/callback` |
| `TWILIO_ACCOUNT_SID` | Twilio account SID (SMS/WhatsApp) |
| `TWILIO_AUTH_TOKEN` | Twilio auth token |
| `TWILIO_PHONE_NUMBER` | SMS sender number |
| `TWILIO_WHATSAPP_NUMBER` | WhatsApp sender number (Twilio WhatsApp-enabled) |
| `SENDGRID_API_KEY` | SendGrid API key (email) |
| `FROM_EMAIL` | Sender email address |
| `MINIO_ENDPOINT` | MinIO API URL — `http://localhost:9000` (local) |
| `MINIO_ACCESS_KEY` | MinIO access key — `minioadmin` (local) |
| `MINIO_SECRET_KEY` | MinIO secret key — `minioadmin123` (local) |
| `MINIO_BUCKET` | Bucket name — `innovation-guild-assets` |
| `DO_SPACES_KEY` | DigitalOcean Spaces key (production) |
| `DO_SPACES_SECRET` | DigitalOcean Spaces secret (production) |
| `DO_SPACES_ENDPOINT` | DigitalOcean Spaces endpoint (production) |
| `DO_SPACES_BUCKET` | DigitalOcean Spaces bucket name (production) |
| `NODE_ENV` | `development` or `production` |
| `PORT` | Server port — default `5000` |
| `FRONTEND_URL` | Frontend origin for CORS — e.g. `http://localhost:3000` |
| `ADMIN_EMAILS` | Comma-separated admin email addresses |
| `PERPLEXITY_API_KEY` | Perplexity API key — required for AI website import |
| `SUPER_ADMIN_EMAIL` | Email for the super-admin created by `seed:superadmin` |
| `SUPER_ADMIN_PASSWORD` | Password for the super-admin created by `seed:superadmin` |

---

## Infrastructure (Docker)

| Service | Port | Notes |
|---|---|---|
| Redis | 6379 | Cache, OTP store, job queues |
| RedisInsight UI | 8001 | http://localhost:8001 |
| MinIO API | 9000 | S3-compatible file storage |
| MinIO Console | 9001 | http://localhost:9001 — login: `minioadmin` / `minioadmin123` |

The MinIO bucket `innovation-guild-assets` is created automatically on first start.

---

## Seeding

```bash
npm run seed:superadmin    # create super-admin user (reads SUPER_ADMIN_EMAIL / SUPER_ADMIN_PASSWORD from .env)
npm run seed:operations    # seed the master farm-operations taxonomy (bed_making, drying, threshing, …)
```

Run `seed:operations` before submitting innovations/problems so the standard operations are available for selection and filtering. (States, districts, and villages are bundled as static reference data — no seeding needed.)

---

## Other Scripts

```bash
npm run migrate              # bulk-import users & content from scripts/data/migration.xlsx
npm run recompute-matches    # wipe and regenerate all problem↔innovation matches
```

- **`migrate`** reads `scripts/data/migration.xlsx` (7 sheets: NO, AO, VLE, INNOVATOR, GENERAL_USER, Innovations, Problems). Add `--dry-run` to validate without writing, or `--file <path>` for a custom file. See `scripts/data/enum-reference.md` for the required column formats.
- **`recompute-matches`** regenerates all saved matches under the current matching thresholds — run it after changing `MATCHING_CONFIG`.
