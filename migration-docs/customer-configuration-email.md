# Customer configuration request

Status: draft only; not sent.

**Subject: Details required to enable Google Sign-In, SMS, and email**

Hi [Name],

To configure Google Sign-In, SMS verification, and outgoing emails for TechDhara,
please share the following details with us.

**1. Production domain**

Please confirm the final production domain. The current `techdhara-staging.t4gc.in`
address is for staging only. If the API will use a separate domain, please share
that as well.

**2. Google Sign-In**

- Google OAuth Client ID
- Google OAuth Client Secret

To obtain these, open the [Google Cloud Console](https://console.cloud.google.com/),
configure the Google Auth Platform consent screen, and create an OAuth client of
type **Web application**. For a same-domain frontend and API, add this authorized
redirect URI using the confirmed production domain:

`https://YOUR-PRODUCTION-DOMAIN/api/auth/google/callback`

If the API is on a separate domain, we will confirm the exact callback URL before
you register it.

**3. Twilio SMS**

- Twilio Account SID
- Twilio Auth Token
- SMS sender number
- Destination countries for SMS delivery

These details are available in the [Twilio Console](https://console.twilio.com/).
Please ensure the account is enabled for production messaging and the destination
countries are permitted. For Indian recipients, confirm the delivery route and
applicable DLT sender/template registration with Twilio.

**4. SendGrid email**

- SendGrid API key with permission to send emails
- Verified sender email address to use as the “From” address
- Preferred sender display name
- Confirmation that sender/domain verification is complete

These can be configured in the [SendGrid dashboard](https://app.sendgrid.com/)
under **Settings → API Keys** and **Settings → Sender Authentication**.
The application uses SendGrid for verification emails, password resets, and
notifications; Google Sign-In does not provide outgoing email delivery.

Please share secret keys and tokens through a secure credential-sharing channel
rather than a regular email reply.

Once we receive these details, we can configure the application and test Google
Sign-In, SMS verification, and email delivery. If any accounts have not been created
yet, please let us know so we can guide you through the setup.

Regards,  
[Your Name]
