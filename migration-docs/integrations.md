# Integration configuration and readiness

## Environment boundary

`techdhara-staging.t4gc.in` is staging only, as confirmed by the customer. The final
production domain is pending. Do not treat the staging callback as the production
callback. Local file findings do not prove the deployed server's configuration.

## Required settings

| Integration | Backend settings | Current finding |
| --- | --- | --- |
| Google Sign-In | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `FRONTEND_URL` | Implemented; local Google values are unvalidated and the local callback targets localhost. Chart fallback credentials are dummy values. |
| Twilio SMS | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` | Implemented; credentials absent from the local `.env` reviewed and were not wired through the original Helm template. |
| SendGrid email | `SENDGRID_API_KEY`, `FROM_EMAIL` | Implemented with `@sendgrid/mail`; settings absent from the local `.env` reviewed and were not wired through the original Helm template. |
| Redis for OTP | `REDIS_URL`, `CACHE_ENABLED=true`; authentication settings if required | Required for OTP storage, verification, and request limits; live connectivity unverified. |
| Optional WhatsApp | Twilio account settings plus `TWILIO_WHATSAPP_NUMBER` | Sender exists, but production notification templates require code changes. |

The frontend uses `VITE_API_BASE_URL`, normally `/api` when served with the backend
under the same origin. Provider secrets belong on the backend.

## Google setup

1. Confirm the production frontend and API domains.
2. Create or select a Google Cloud project and configure Google Auth Platform branding,
   support contact, audience, and any testing/publishing settings for the intended users.
3. Create an OAuth client of type **Web application**.
4. Register the exact backend callback in authorized redirect URIs. For a same-origin
   production deployment, use `https://YOUR-PRODUCTION-DOMAIN/api/auth/google/callback`.
   If the API has its own domain, use that domain for the backend callback.
5. Supply Client ID and Client Secret securely. Set `FRONTEND_URL` to the frontend
   origin and `GOOGLE_REDIRECT_URI` to the registered backend callback.
6. Test new Google registration and existing Google login, including frontend redirect,
   session refresh, and logout. Existing verified password-only accounts cannot
   automatically use Google under the current strategy.

Before production rollout, fix the current OAuth state parameter, which contains
role/source without browser-bound validation, and the access token passed in the
frontend callback URL. Use browser-bound state and a short-lived code/session handoff.
These application changes remain outstanding.

## SMS setup

The implementation uses **Twilio Programmable Messaging**, not Twilio Verify.
The application creates and verifies OTPs itself using Redis.

Request the Account SID, Auth Token, approved sender number, destination countries,
and confirmation that the account is ready for production messaging. Configure the
appropriate sender and geographic permissions. For India, confirm the international
or domestic route and applicable DLT sender/template registration with Twilio.
Changing SMS providers requires a code adapter change, not just different credentials.

## Email setup

The code uses **SendGrid over HTTPS**, not Gmail SMTP. Google Sign-In credentials
do not enable email delivery. Request a SendGrid API key with Mail Send permission,
a verified `FROM_EMAIL` address, and confirmation of sender/domain authentication.
A preferred sender display name can also be requested, but there is no separate
display-name environment setting identified in the current configuration.

## WhatsApp gap

The current sender sends free-form message bodies. Notifications outside the 24-hour
customer service window require approved templates and `ContentSid`/`ContentVariables`
in the send operation. `WHATSAPP_APPROVAL_TEMPLATE_SID` and
`WHATSAPP_REJECTION_TEMPLATE_SID` exist in configuration but are not used by the sender.
Credentials alone do not complete this integration for those notifications.

## Deployment changes prepared locally

The [Helm backend template](../helm/innovation-guild/templates/backend-deployment.yaml)
now supports `backend.integrationsSecretName` to load provider environment settings
from an existing Kubernetes Secret in the backend namespace.

- The Secret must contain both Google keys when selected, because the explicit dummy
  Google fallback values are then omitted.
- `FRONTEND_URL` and `GOOGLE_REDIRECT_URI` are generated from the domain and TLS setting.
- `backend.frontendUrl` and `backend.googleRedirectUri` allow explicit overrides.
- The Secret reference remains unset by default; no credentials were created.
- Helm lint and a staging backend render with an example Secret name passed.
- Nothing was deployed. Restart the backend after Secret value changes so the process
  receives updated environment variables.

See [Helm integration instructions](../helm/innovation-guild/INTEGRATIONS.md).

## Software settings and completion checklist

No provider configuration screen was found. Environment settings are sufficient to
provide the current integrations' credentials. An optional admin page could show
configured/missing status, channel switches, template mappings, and delivery errors.
Such a page has not been implemented.

- [ ] Receive production domain and confirm frontend/API URL layout.
- [ ] Receive provider credentials securely and confirm provider account readiness.
- [ ] Resolve the Google OAuth state and token-handoff findings.
- [ ] Configure production HTTPS, integration Secret, and intended Helm values.
- [ ] Verify Redis connectivity with OTP caching enabled.
- [ ] Deploy and test Google registration/login, refresh, and logout.
- [ ] Test SMS OTP receipt, verification, expiry, resend limits, and password reset.
- [ ] Test email verification/password reset and check provider delivery logs.
- [ ] If WhatsApp is required, implement approved templates and test delivery.
- [ ] Check representative accounts for all seven roles after migration.

## Evidence and provider references

Local code:
- [Google strategy](../InnovationGuildBackend-main/src/config/passport.js)
- [Google controller](../InnovationGuildBackend-main/src/api/controllers/auth/googleController.js)
- [SMS sender](../InnovationGuildBackend-main/src/services/notification/channels/sms.js)
- [Email sender](../InnovationGuildBackend-main/src/services/notification/channels/email.js)
- [WhatsApp sender](../InnovationGuildBackend-main/src/services/notification/channels/whatsapp.js)
- [Backend configuration](../InnovationGuildBackend-main/src/config/index.js)
- [OTP manager](../InnovationGuildBackend-main/src/services/auth/otpManager.js)

Provider documentation consulted during the review:
- [Google web-server OAuth setup](https://developers.google.com/identity/protocols/oauth2/web-server)
- [Twilio India SMS requirements](https://www.twilio.com/en-us/guidelines/in/sms)
- [SendGrid sender identity](https://www.twilio.com/docs/sendgrid/for-developers/sending-email/sender-identity)
- [WhatsApp notification templates](https://www.twilio.com/docs/whatsapp/tutorial/send-whatsapp-notification-messages-templates)
