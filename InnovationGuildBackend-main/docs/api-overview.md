# API Overview

**Base URL:** `http://localhost:5000/api`

---

## /api/auth — Public + Authenticated

**Email auth**
- `POST /register`
- `POST /verify-email`
- `POST /login`
- `POST /forgot-password`
- `POST /verify-reset-otp`
- `POST /reset-password`
- `POST /resend-otp`

**Mobile auth**
- `POST /mobile-login`
- `POST /mobile-verify`
- `POST /resend-mobile-otp`

**Google OAuth**
- `GET /google`
- `GET /google/callback`

**Session**
- `GET /me`
- `POST /refresh`
- `POST /logout`
- `POST /logout-all`

**Profile completion** _(authenticated, called after first login)_
- `POST /vle/complete-registration`
- `POST /ao/complete-registration`
- `POST /innovator/complete-registration`
- `POST /nodal-org/complete-registration`
- `POST /general-user/complete-registration`

**Profile retrieval**
- `GET /vle/profile`
- `GET /ao/profile`
- `GET /innovator/profile`
- `GET /nodal-org/profile`
- `GET /general-user/profile`

**Profile image**
- `POST /profile-image`
- `DELETE /profile-image`
- `GET /profile-image`

---

## /api/public — Unauthenticated

**Innovations**
- `GET /innovations` — list with filters
- `GET /innovations/facets`
- `GET /innovations/category-preview`
- `GET /innovations/:innovationId`
- `GET /innovations/:innovationId/comments`
- `GET /innovations/:innovationId/matches`
- `GET /innovations/:innovationId/similar`

**Problems**
- `GET /problems`
- `GET /problems/:problemId`
- `GET /problems/:problemId/comments`
- `GET /problems/:problemId/matches`

**Discovery**
- `GET /operations`
- `GET /villages`
- `GET /nodal-orgs`
- `GET /approved-aos`
- `GET /vles`
- `GET /vles/stats`

**Other**
- `POST /newsletter/subscribe`
- `POST /contact`
- `GET /videos/stream/:innovationId/:videoIndex`
- `GET /impact-stats`

---

## /api/common — All authenticated roles

**Profiles**
- `GET /profiles/:userId`
- `GET /profiles/:userId/innovations`
- `GET /profiles/:userId/problems`

**My profile**
- `GET /my-profile`
- `PATCH /my-profile`
- `PATCH /my-profile/submit`

**Notifications**
- `GET /notifications`
- `PATCH /notifications/read-all`
- `DELETE /notifications`
- `DELETE /notifications/:notificationId`

**Problems** _(GENERAL_USER: read only)_
- `POST /problems`
- `GET /problems`
- `GET /problems/:problemId`
- `PATCH /problems/:problemId`
- `DELETE /problems/:problemId`
- `PATCH /problems/:problemId/submit`
- `POST /problems/:problemId/upload`
- `DELETE /problems/:problemId/files/:fileId`

**Service requests** _(GENERAL_USER: read only)_
- `POST /service-requests`
- `GET /service-requests`
- `GET /service-requests/:serviceRequestId`
- `PATCH /service-requests/:serviceRequestId`
- `DELETE /service-requests/:serviceRequestId`
- `PATCH /service-requests/:serviceRequestId/submit`

**Comments**
- `POST /innovations/:innovationId/comments`
- `POST /problems/:problemId/comments`
- `DELETE /comments/:commentId`
- `GET /my-comments`

**Saved items**
- `POST/DELETE /innovations/:innovationId/save` · `GET /saved/innovations`
- `POST/DELETE /profiles/:userId/save` · `GET /saved/profiles`
- `POST/DELETE /problems/:problemId/save` · `GET /saved/problems`

**Other**
- `POST /contacts/view`
- `GET /videos/stream/:innovationId/:videoIndex`

---

## /api/innovator — INNOVATOR only

- `POST /ai/import-from-website` — import products from the innovator's website (AI)
- `POST /innovations`
- `GET /innovations`
- `GET /innovations/:innovationId`
- `PATCH /innovations/:innovationId`
- `DELETE /innovations/:innovationId`
- `PATCH /innovations/:innovationId/submit`
- `POST /innovations/:innovationId/upload`
- `POST /innovations/:innovationId/cover`
- `DELETE /innovations/:innovationId/files/:fileId`

---

## /api/vle — VLE only

**Pilot requests**
- `POST /innovations/:innovationId/pilot-request`
- `GET /pilot-requests`
- `DELETE /pilot-requests/:requestId`
- `GET /pilot-request-context`
- `GET /pilot-request-problems`

**Problems**
- `POST /problems/:problemId/facing-similar`
- `GET /problems/facing-similar`

**Bookkeeping**
- `POST /bookkeeping`
- `GET /bookkeeping`
- `GET /bookkeeping/context/:pilotId`
- `GET /bookkeeping/:entryId`
- `PATCH /bookkeeping/:entryId`
- `DELETE /bookkeeping/:entryId`

**Business models**
- `POST /business-models`
- `GET /business-models`
- `GET /business-models/:businessModelId`

---

## /api/ao — AO only

**VLE registration**
- `POST /initiate-vle-registration`
- `POST /resend-vle-otp`
- `POST /register-vle`

**Field reports**
- `POST /pilots/:pilotId/field-reports`
- `DELETE /field-reports/:reportId`

---

## /api/nodal-org — NO only

**AO registration**
- `POST /initiate-ao-registration`
- `POST /resend-ao-otp`
- `POST /register-ao`

**AO management**
- `GET /aos/approved`
- `GET /aos/pending`
- `GET /aos/:aoId`
- `GET /aos/:aoId/vles`
- `GET /aos/:aoId/problems`
- `GET /aos/:aoId/service-requests`
- `PATCH /aos/:aoId/approve`
- `PATCH /aos/:aoId/reject`
- `PATCH /aos/:aoId/request-edit`
- `PATCH /aos/:aoId`

---

## /api/org — AO + NO shared

**Overview**
- `GET /overview`

**VLE management**
- `GET /vles/approved`
- `GET /vles/pending`
- `GET /vles/:vleId`
- `PATCH /vles/:vleId`
- `PATCH /vles/:vleId/approve`
- `PATCH /vles/:vleId/reject`
- `PATCH /vles/:vleId/request-edit`
- `GET /vles/:vleId/similar-problems`
- `GET /vles/:vleId/field-reports`
- `GET /vles/:vleId/bookkeepings`
- `GET /vles/:vleId/bookkeepings/:bookkeepingId`
- `POST /vles/:vleId/pilot-request`
- `GET /vles/:vleId/pilot-requests`
- `GET /vles/:vleId/pilot-request-context`

**Problems**
- `GET /problems-list`
- `POST /problems/create-for-vle`
- `GET /problems/:problemId`
- `GET /problems/:problemId/view`
- `PATCH /problems/:problemId`
- `PATCH /problems/:problemId/approve`
- `PATCH /problems/:problemId/reject`
- `PATCH /problems/:problemId/request-edit`

**Service requests**
- `GET /service-requests`
- `GET /service-requests/:serviceRequestId`
- `POST /service-requests/create-for-vle`
- `PATCH /service-requests/:serviceRequestId`

**Innovations**
- `GET /innovations/:innovationId`

**Pilots**
- `GET /pilots`
- `GET /pilots/:pilotId`
- `PATCH /pilots/:pilotId/start`
- `PATCH /pilots/:pilotId/start-trial`
- `PATCH /pilots/:pilotId/implement`
- `DELETE /pilots/:pilotId`
- `GET /pilots/:pilotId/field-reports`
- `GET /pilots/:pilotId/business-model`
- `POST /pilots/:pilotId/business-model`
- `PATCH /pilots/:pilotId/business-model`

**Field reports**
- `GET /field-reports/:reportId`

---

## /api/admin — ADMIN + SUPER_ADMIN

**Overview & analytics**
- `GET /overview`
- `GET /analytics/all`
- `GET /analytics/ecosystem`
- `GET /analytics/problems`
- `GET /analytics/innovation-trend`
- `GET /analytics/innovator-trend`
- `GET /analytics/vle-contact-trend`
- `GET /analytics/categories`
- `GET /analytics/pipeline`
- `GET /analytics/state-breakdown`
- `GET /analytics/export/problems` · `/export/innovations` · `/export/vles` · `/export/aos` · `/export/nos`

**Nodal orgs**
- `GET /nodal-orgs/pending` · `GET /nodal-orgs/approved`
- `GET /nodal-orgs/:nodalOrgId`
- `PATCH /nodal-orgs/:nodalOrgId/approve` · `/reject` · `/request-edit`
- `PATCH /nodal-orgs/:nodalOrgId`
- `GET /nodal-orgs/:nodalOrgId/affiliated-orgs`
- `GET /nodal-orgs/:nodalOrgId/problems`
- `GET /nodal-orgs/:nodalOrgId/service-requests`

**Affiliated orgs (AOs)**
- `GET /affiliated-orgs/approved`
- `GET /affiliated-orgs/:aoId`
- `PATCH /affiliated-orgs/:aoId/approve` · `/reject` · `/request-edit`
- `PATCH /affiliated-orgs/:aoId`
- `GET /affiliated-orgs/:aoId/vles`
- `GET /affiliated-orgs/:aoId/problems`
- `GET /affiliated-orgs/:aoId/service-requests`

**VLEs**
- `GET /vles/pending` · `GET /vles/approved`
- `GET /vles/:vleId`
- `PATCH /vles/:vleId/approve` · `/reject` · `/request-edit`
- `PATCH /vles/:vleId`
- `GET /vles/:vleId/field-reports`
- `GET /vles/:vleId/similar-problems`
- `GET /vles/:vleId/pilot-requests`

**Innovators**
- `GET /innovators/pending` · `GET /innovators/approved`
- `GET /innovators/:innovatorId`
- `GET /innovators/:innovatorId/innovations`
- `PATCH /innovators/:innovatorId/approve` · `/reject` · `/request-edit`
- `PATCH /innovators/:innovatorId`

**Pipeline innovators**
- `GET /pipeline-innovators`
- `POST /pipeline-innovators`
- `GET /pipeline-innovators/:innovatorId`
- `PATCH /pipeline-innovators/:innovatorId`
- `DELETE /pipeline-innovators/:innovatorId`

**Innovations**
- `GET /innovations/pending` · `GET /innovations/approved`
- `GET /innovations/:innovationId`
- `PATCH /innovations/:innovationId/approve` · `/reject` · `/request-edit`
- `PATCH /innovations/:innovationId`
- `DELETE /innovations/:innovationId`
- `GET /innovations/:innovationId/pilots`
- `GET /innovations/:innovationId/field-reports`

**Problems**
- `GET /problems`
- `GET /problems/:problemId`
- `PATCH /problems/:problemId/approve` · `/reject` · `/request-edit`
- `PATCH /problems/:problemId`

**Service requests**
- `GET /service-requests`
- `GET /service-requests/:serviceRequestId`
- `PATCH /service-requests/:serviceRequestId/request-edit`
- `PATCH /service-requests/:serviceRequestId`

**Pilots**
- `GET /pilots` · `GET /pilots/stats`
- `GET /pilots/:pilotId`
- `PATCH /pilots/:pilotId/start` · `/start-trial` · `/implement`
- `DELETE /pilots/:pilotId`

**Field reports**
- `GET /field-reports` · `GET /field-reports/stats`
- `GET /field-reports/:reportId`
- `GET /pilots/:pilotId/field-reports`
- `POST /pilots/:pilotId/field-reports`

**Business models**
- `GET /business-models/:businessModelId`
- `PATCH /business-models/:businessModelId`
- `GET /pilots/:pilotId/business-model`

**Bookkeeping**
- `GET /bookkeeping`
- `GET /bookkeeping/:entryId`
- `PATCH /bookkeeping/:entryId`

**Admins** _(SUPER_ADMIN only)_
- `POST /admins/create`
- `GET /admins`
- `GET /admins/:adminId`
- `DELETE /admins/:adminId`

**Newsletter**
- `GET /newsletter/subscriptions`
- `GET /newsletter/export`
- `DELETE /newsletter/subscriptions/:subscriptionId`

**Contact views**
- `GET /contact-views`

**Notifications**
- `GET /notifications`
- `PATCH /notifications/read-all`
- `DELETE /notifications`
- `DELETE /notifications/:notificationId`
