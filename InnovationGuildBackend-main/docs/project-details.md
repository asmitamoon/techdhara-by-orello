# Tech Dhaara — Platform Features

Tech Dhaara is an agricultural-innovation marketplace connecting innovators with village-level entrepreneurs (VLEs / Tech Dhaaraks) and the organizations that support them (Affiliated Organizations and Nodal Organizations). Innovators publish rural-livelihood innovations; VLEs and organizations post problem statements and service requests; the platform automatically matches problems to relevant innovations and manages the full pilot-to-implementation lifecycle.

The sections below summarize the completed features.

---

## Completed Features

### 1. Authentication & User Management

- Hybrid auth engine: Email/Password, SMS-based OTP (Twilio), and Google OAuth with JWT refresh token rotation and multi-device logout.
- Role-based multi-step registration for 5 distinct roles: General User, VLE (Tech Dhaakar), Innovator, AO, and NO — with OTP-based verification.
- Assisted registration flows: AOs register VLEs and NOs register AOs, each as a 3-step OTP-verified process.
- Comprehensive profile completion with role-specific fields; profile image upload and management.
- Personalized dashboards for "My Innovations", "My Problems", and "Saved Items" for all authenticated users.
- Robust profile viewing and editing with built-in data validation.

---

### 2. Public Discovery Portal

- Searchable, filterable listings for Innovations, Problem Statements, and VLEs (Tech Dhaaraks).
- Faceted search with live filter option counts for categories, stages, and operations.
- Innovation detail page with media gallery, full specifications, similar innovations, matches, and comments.
- Problem detail page with details, comments, and matching innovations.
- Approved organizations directory (AOs and NOs).
- Impact statistics and VLE stats displayed on the public home page.
- Contact form and newsletter subscription.

---

### 3. Innovation Management

- Multi-step innovation submission workflow for Innovators with a rich field set: category, stage, power source, suitable crops, terrains, specifications, selling price, and media.
- Operations are chosen from a shared, extensible taxonomy — a seeded set of standard operations plus custom operations users can add inline during submission. Custom operations are auto-registered and immediately reusable across innovations, problems, the matching engine, and faceted filters.
- Cover image upload and downloadable resource attachments per innovation.
- Full content lifecycle: Draft → Pending → Published / Rejected / Edit Requested, with full audit trails.
- Admin and organization-level approval, rejection, and edit-request flows.
- "My Innovations" dashboard with status tracking.
- Innovation video streaming with HTTP range support for progressive playback.

---

### 4. Problem & Service Request Management

- Multi-step submission workflows for Problem Statements and Service Requests by any authenticated user.
- Full content lifecycle: Draft → Pending → Published / Rejected / Edit Requested.
- Problem file attachments (images and documents).
- Structured matching engine that automatically links Problem Statements to relevant Innovations by comparing shared operations (a problem's operations vs. an innovation's covered operations) and raw materials / crops. Location is computed for display but does not affect the score.
- Admin and organization-level approval, rejection, and edit-request flows.
- "My Problems" dashboard with status tracking.

---

### 5. Pilot System

- VLEs can request pilots on innovations with problem-statement linkage for context.
- Full pilot lifecycle management: Requested → Trial → Active → Implemented / Cancelled.
- AOs and NOs can create pilot requests on behalf of their VLEs.
- Admin and organization dashboards for tracking all pilots across the network.
- Units installed and success metrics tracked per pilot.
- VLEs can mark problems as "facing similar" to signal demand for specific innovations.

---

### 6. Field Reporting

- AOs submit field reports for active pilots, capturing progress and metrics.
- Field reports viewable at VLE level, pilot level, and innovation level.
- Admin and organization-level field report dashboards with stats and detailed views.

---

### 7. Bookkeeping & Business Models

- Persona-based financial tracking for VLEs across 4 business types: Sales, Servicing, Rental, and Fabrication — with automated revenue and profit normalization.
- Business model creation and management linked to individual pilots.
- Organization and admin visibility into VLE bookkeeping and business models across the network.

---

### 8. Organization & Admin Management

- **AO Portal:** Manage associated VLEs (approve, reject, update), oversee problems, service requests, pilots, field reports, and bookkeeping across their VLE network.
- **NO Portal:** Manage associated AOs (approve, reject, update), with full visibility into all AO-level activity.
- **Admin Dashboard:** Complete management of all platform entities — NOs, AOs, VLEs, Innovators, Innovations, Problems, Service Requests, Pilots, Bookkeeping, and Field Reports — with approve, reject, request-edit, and update controls.
- **Analytics:** Ecosystem analytics, problem and innovation trends, innovator trends, VLE contact trends, category breakdowns, pipeline stats, and state-level breakdowns.
- **Exports:** CSV/report exports for Problems, Innovations, VLEs, AOs, and NOs.
- **Pipeline Innovator Management:** Full CRUD for tracking and managing innovators outside the standard registration flow.
- **Newsletter Management:** Subscription management with filtered listing, individual deletion, and CSV export.
- **Admin Account Management:** Create, list, and delete admin accounts (Super Admin only).

---

### 9. Notifications

- **Three-channel delivery:** WhatsApp (Twilio), SMS (Twilio), and transactional Email (SendGrid) — channel automatically selected based on the user's registration method (phone vs. email/Google).
- **Full lifecycle event coverage:** 40+ named notification functions covering every platform event — registrations, approvals, rejections, edit requests, pilot status transitions, field report activity, and comments.
- **In-app notification store:** Persistent notifications with read/unread state; mark all read, delete individual, delete all — available for every role.

---

### 10. Social & Engagement

- Comment system on Innovations and Problems (create, retrieve, delete).
- Bookmark (save/unsave) for Innovations, Problems, and user Profiles with paginated retrieval per user.
- Contact view tracking: recorded contact reveals with admin-level monitoring dashboards to audit engagement.
- Google Translate integrated in the navbar (desktop and mobile).

---

### 11. AI-Powered Innovation Import

- Innovators can import all their products from their registered website URL in one click — no manual input required.
- Puppeteer renders JavaScript-heavy pages (60s timeout) with a plain-fetch fallback; JSON-LD structured data is extracted first for richer results.
- Perplexity `sonar-pro` with high search context extracts structured product data: name, description, category, stage, specs, pricing, power source, suitable crops, terrains, dimensions, weight, and more.
- All extracted fields validated and sanitized against Innovation model constraints.
- Per-user daily rate limit of 5 imports (Redis, 24h TTL) — fails open if Redis is unavailable.
- Name-based case-insensitive deduplication prevents duplicate innovations when the import is run more than once.
- Products saved as DRAFT innovations in bulk, ready for the innovator to review and submit.
- Full-screen loading overlay with rotating status messages; toast feedback shows saved and skipped counts.

---

### 12. Infrastructure & Technical Foundation

- **Frontend:** React 19, Vite, Tailwind CSS 4, TanStack Query (React Query), Redux Toolkit, React Router v7, Axios with automatic token refresh and cross-tab synchronization.
- **Backend:** Node.js/Express, MongoDB/Mongoose, Redis (caching + rate limiting), JWT with refresh token rotation, Passport (Google OAuth), Multer.
- **Media pipeline:** DigitalOcean Spaces (S3) for storage; automated background video compression via Bull Queue and FFmpeg with HTTP range streaming for progressive playback.
- **Full API integration:** 300+ endpoints across 9 route modules, all wired to the frontend via React Query hooks with a centralized Axios instance.
- **Security & reliability:** Helmet, CORS, bcrypt, centralized error handling, Zod-based schema validation on all endpoints, and rate limiting on OTP and login flows.
