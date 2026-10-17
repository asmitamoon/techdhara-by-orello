# TechDhara migration documentation

Recorded: 18 September 2026.

This folder records the account and integration findings from the local source-code
and Helm review, along with the information needed from the customer for production.
It is not a full database migration plan or a verification of the live environment.

## Documents

- [Account types](account-types.md): seven roles defined in the application.
- [VLE registration requirements](vle-registration-requirements.md): required,
  conditional, and optional account/profile data, plus validation differences.
- [Integration configuration and readiness](integrations.md): Google, Twilio,
  SendGrid, Redis, deployment changes, and outstanding work.
- [Customer email](customer-configuration-email.md): ready-to-send request for
  the production domain and provider details, including setup instructions.

## Current status

- The customer confirmed that `techdhara-staging.t4gc.in` is staging only.
- The production domain is different and has not yet been supplied.
- Google Sign-In, Twilio SMS, and SendGrid email integrations exist in code.
- Production provider account readiness and credential validity are unconfirmed.
- Local Helm changes support an existing integration Secret and TLS-aware URLs.
  Helm lint and the staging backend template render passed.
- No deployment, live Google login, SMS delivery, or email delivery was performed
  as part of this review. The customer email is a draft and has not been sent.

Store actual credentials in the deployment secret-management system, not in this
folder. These documents contain configuration names and placeholders only.
