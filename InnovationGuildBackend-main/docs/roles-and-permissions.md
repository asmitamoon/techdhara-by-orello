# Roles and Permissions

## Roles

### SUPER_ADMIN
- Created via `npm run seed:superadmin`
- Full platform access; the only role that can create and delete admins

### ADMIN
- Created by SUPER_ADMIN via `POST /api/admin/admins/create`
- Manages all users (approve/reject/suspend), innovations, problems, pilots, bookkeeping, and analytics

### NO — Nodal Organization
- Self-registers (email / mobile / Google) → `POST /api/auth/nodal-org/complete-registration`
- Pending admin approval before access
- Registers and approves AOs; manages VLEs and pilots under them via `/api/org`

### AO — Affiliated Organization
- Registered by NO: `POST /api/nodal-org/initiate-ao-registration` → OTP → `POST /api/nodal-org/register-ao`
- Pending NO approval (`PATCH /api/nodal-org/aos/:aoId/approve`)
- Registers and approves VLEs; manages pilots and field reports under them via `/api/org`

### VLE — Village Level Entrepreneur
- Registered by AO: `POST /api/ao/initiate-vle-registration` → OTP → `POST /api/ao/register-vle`
- Pending AO/NO approval (`PATCH /api/org/vles/:vleId/approve`)
- Submits problems and service requests; requests pilots; manages bookkeeping and business models

### INNOVATOR
- Self-registers (email / mobile / Google) → `POST /api/auth/innovator/complete-registration`
- Pending admin approval before access
- Creates and manages innovations; submits them for admin approval

### GENERAL_USER
- Self-registers (email / mobile / Google) → `POST /api/auth/general-user/complete-registration`
- **Auto-approved** on profile completion — no admin action needed
- Read access only: browse, comment, like, save innovations/problems/profiles; cannot create problems or service requests

---

## Registration Summary

| Role | How they register | Approved by |
|---|---|---|
| SUPER_ADMIN | `seed:superadmin` script | — |
| ADMIN | SUPER_ADMIN creates | — |
| NO | Self-registers | Admin |
| AO | NO initiates | NO |
| VLE | AO initiates | AO / NO |
| INNOVATOR | Self-registers | Admin |
| GENERAL_USER | Self-registers | Auto |

---

## User Status Lifecycle

```
PENDING  (default on account creation)
  ├── APPROVED   — granted by admin/org, or automatic (GENERAL_USER)
  ├── REJECTED   — denied by admin/org
  ├── SUSPENDED  — temporarily blocked
  └── BANNED     — permanently blocked
```

**Middleware behaviour** (`src/api/middlewares/auth.js`):
- `ADMIN` and `SUPER_ADMIN` bypass status checks entirely
- All other roles must be `APPROVED` to access protected routes
- `PENDING` users receive 403 **unless** the route opts in with `{ allowPending: true }` (used on notifications, my-profile, and profile-view routes so users can see their pending state)
- `REJECTED`, `SUSPENDED`, and `BANNED` users always receive 403

---

## Capabilities Summary

| Capability | GU | VLE | AO | NO | INNOVATOR | ADMIN |
|---|---|---|---|---|---|---|
| Browse public content | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Comment / save | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| Create problems | — | ✓ | ✓ | ✓ | ✓ | — |
| Create service requests | — | ✓ | ✓ | ✓ | ✓ | — |
| Create innovations | — | — | — | — | ✓ | — |
| Create pilot requests | — | ✓ | — | — | — | — |
| Manage bookkeeping | — | ✓ | — | — | — | ✓ |
| Register VLEs | — | — | ✓ | — | — | — |
| Register AOs | — | — | — | ✓ | — | — |
| Approve VLEs | — | — | ✓ | ✓ | — | — |
| Approve AOs | — | — | — | ✓ | — | — |
| Approve innovations / users | — | — | — | — | — | ✓ |
| Analytics | — | — | — | — | — | ✓ |
