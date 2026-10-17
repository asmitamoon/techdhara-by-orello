# Authentication and messaging setup

Google sign-in/sign-up, Twilio SMS, and SendGrid email are implemented. Provider
credentials are deployment settings; no provider settings screen currently exists.
These instructions describe the local chart, not verified live cluster configuration.

## Google

Create or reuse a Google OAuth client of type Web application. Configure the consent
screen branding, audience, and contact details. Register the exact backend callback
URI in the client's authorized redirect URIs. The staging chart generates:

```
https://techdhara-staging.t4gc.in/api/auth/google/callback
```

Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in the integration Secret below.
The chart sets FRONTEND_URL and GOOGLE_REDIRECT_URI using the domain and ingress
TLS setting. Override backend.frontendUrl and backend.googleRedirectUri if the
frontend and API use different public origins. The frontend VITE_API_BASE_URL
must point to the API, normally /api for this same-origin deployment.

Existing local .env Google values have not been validated and use a localhost
callback. Chart defaults contain dummy credentials. Neither proves live readiness.
New users must register first; the login flow intentionally rejects unknown accounts.
Verified password accounts currently cannot sign in through Google.

## Provider credentials

Create a Kubernetes Secret in the backend's namespace with environment-variable
names as keys. Manage its real values through your secret-management workflow.
Do not commit credentials. Set backend.integrationsSecretName to its name.
When this setting is used, both Google keys must be present: the chart's fallback
Google values are intentionally omitted so they cannot override the Secret.

| Feature | Secret keys |
| --- | --- |
| Google | GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET |
| SMS | TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER |
| Email | SENDGRID_API_KEY, FROM_EMAIL |
| Optional WhatsApp | TWILIO_WHATSAPP_NUMBER, plus the Twilio account keys |

SMS uses Twilio Programmable Messaging, not Twilio Verify. Configure a sender
permitted for the destination and enable the destination in Twilio's geographic
permissions. For Indian recipients, confirm the international/domestic route and
applicable DLT sender/template registration with Twilio. A different SMS provider
requires an adapter change; adding that provider's keys alone will not work.

Email uses SendGrid over HTTPS, not SMTP. Verify the sender and authenticate the
sending domain before production use. Redis must be reachable with CACHE_ENABLED=true
for email and phone OTP storage, verification, and rate limits.

WhatsApp currently sends free-form bodies. Business-initiated messages outside the
24-hour customer service window require approved templates and code changes to
send ContentSid/ContentVariables. The existing WHATSAPP_APPROVAL_TEMPLATE_SID and
WHATSAPP_REJECTION_TEMPLATE_SID config fields are not used by the sender.

## Activation and checks

After provisioning the credentials, upgrade the release using the intended values
file and backend.integrationsSecretName. Restart the backend after changing Secret
values because environment variables are loaded at container startup.

Verify Google registration, existing Google login, refresh/logout, SMS OTP receipt
and verification, resend limits, email verification, and password reset. Check the
provider delivery logs as well as the app response. No real login or message delivery
has been tested by merely rendering this chart.

An optional admin integrations screen could show configured/missing status, channel
switches, template mappings, and delivery failures. It is not required to supply
credentials today. Keep secret values server-side.

Before production Google rollout, also address the existing OAuth flow's unbound
state parameter (currently just role/source) and access token in the frontend
callback URL; use browser-bound state and a short-lived code/session handoff.

References:
- https://developers.google.com/identity/protocols/oauth2/web-server
- https://www.twilio.com/en-us/guidelines/in/sms
- https://www.twilio.com/docs/sendgrid/for-developers/sending-email/sender-identity
- https://www.twilio.com/docs/whatsapp/tutorial/send-whatsapp-notification-messages-templates
