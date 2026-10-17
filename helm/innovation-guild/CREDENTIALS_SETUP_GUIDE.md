# Tech Dhaara (Innovation Guild) — Manual Credentials & Secret Setup Guide

This guide details how to configure and deploy all third-party integration credentials (**Google OAuth**, **Twilio SMS/WhatsApp**, **SendGrid Email**, and **JWT Secrets**) safely into your Kubernetes cluster and Helm release without leaking credentials in chat or Git history.

---

## 1. Credentials Overview

| Service | Environment Variable Key | Description |
| :--- | :--- | :--- |
| **Google OAuth** | `GOOGLE_CLIENT_ID` | OAuth 2.0 Web Client ID from Google Cloud Console |
| | `GOOGLE_CLIENT_SECRET` | OAuth 2.0 Client Secret from Google Cloud Console |
| **Twilio SMS** | `TWILIO_ACCOUNT_SID` | Twilio Account SID |
| | `TWILIO_AUTH_TOKEN` | Twilio Auth Token |
| | `TWILIO_PHONE_NUMBER` | Sender phone number in E.164 format (e.g., `+1234567890`) |
| **Twilio WhatsApp** *(Optional)* | `TWILIO_WHATSAPP_NUMBER` | WhatsApp enabled number (e.g., `+14155238886`) |
| **SendGrid Email** | `SENDGRID_API_KEY` | SendGrid API Key (Mail Send permissions) |
| | `FROM_EMAIL` | Verified sender email address (e.g., `no-reply@techdhara.org`) |
| **Perplexity AI** *(Optional)* | `PERPLEXITY_API_KEY` | API Key for AI service integration |
| **Core Platform** | `JWT_ACCESS_SECRET` | Base64 / string secret for JWT access tokens |
| | `JWT_REFRESH_SECRET` | Base64 / string secret for JWT refresh tokens |

---

## 2. Google Cloud Console Redirect URI Setup

Before testing login/signup, configure your Google OAuth Client in [Google Cloud Console](https://console.cloud.google.com/apis/credentials):

1. Open your OAuth 2.0 Client ID (Application type: **Web application**).
2. In **Authorized JavaScript origins**, add your domain:
   ```
   https://techdhara-staging.t4gc.in
   ```
   *(or your local/production domain)*
3. In **Authorized redirect URIs**, add the exact backend callback path:
   ```
   https://techdhara-staging.t4gc.in/api/auth/google/callback
   ```
4. Click **Save**.

---

## 3. Safe Ways to Apply Your Credentials

Choose whichever method best fits your preferred workflow:

### Method A: Direct One-Line `kubectl` Command (Recommended & Safest)

Run this directly in your terminal. This creates an Opaque Secret named `backend-integrations-secret` directly in your Kubernetes cluster:

```bash
kubectl create secret generic backend-integrations-secret \
  --namespace default \
  --from-literal=GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID" \
  --from-literal=GOOGLE_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET" \
  --from-literal=TWILIO_ACCOUNT_SID="YOUR_TWILIO_ACCOUNT_SID" \
  --from-literal=TWILIO_AUTH_TOKEN="YOUR_TWILIO_AUTH_TOKEN" \
  --from-literal=TWILIO_PHONE_NUMBER="YOUR_TWILIO_PHONE_NUMBER" \
  --from-literal=SENDGRID_API_KEY="YOUR_SENDGRID_API_KEY" \
  --from-literal=FROM_EMAIL="YOUR_VERIFIED_FROM_EMAIL" \
  --dry-run=client -o yaml | kubectl apply -f -
```

*(If you have optional WhatsApp or Perplexity AI keys, add `--from-literal=TWILIO_WHATSAPP_NUMBER="..."` or `--from-literal=PERPLEXITY_API_KEY="..."`)*

---

### Method B: Using an uncommitted `.secrets.env` file

If you prefer to maintain a local `.env` file that is never committed:

1. Create a local file named `.integrations.env` in your local directory (ensure `.integrations.env` is in `.gitignore`):
   ```env
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   TWILIO_ACCOUNT_SID=your-twilio-sid
   TWILIO_AUTH_TOKEN=your-twilio-token
   TWILIO_PHONE_NUMBER=+1234567890
   SENDGRID_API_KEY=SG.your-sendgrid-api-key
   FROM_EMAIL=no-reply@yourdomain.com
   ```

2. Create/update the Kubernetes Secret directly from the file:
   ```bash
   kubectl create secret generic backend-integrations-secret \
     --namespace default \
     --from-env-file=.integrations.env \
     --dry-run=client -o yaml | kubectl apply -f -
   ```

3. Delete or securely store `.integrations.env` afterwards.

---

### Method C: Interactive Shell Script

Run the provided interactive script:
```bash
bash ./helm/innovation-guild/scripts/setup-k8s-secrets.sh default
```
This script prompts for each credential with hidden terminal inputs (`read -s`) and executes `kubectl apply`.

---

## 4. Deploying & Upgrading with Helm

Once the secret `backend-integrations-secret` is created in your Kubernetes namespace:

### 1. Update `values-staging.yaml` (or pass via CLI)
Ensure `backend.integrationsSecretName` is set to `backend-integrations-secret`:

```yaml
backend:
  integrationsSecretName: "backend-integrations-secret"
```

### 2. Run the Helm Upgrade
```bash
helm upgrade --install innovation-guild ./helm/innovation-guild \
  -f ./helm/innovation-guild/values.yaml \
  -f ./helm/innovation-guild/values-staging.yaml \
  --set backend.integrationsSecretName="backend-integrations-secret" \
  --namespace default
```

### 3. Restart the Backend Pods
Because environment variables are read on container startup, trigger a rolling restart:
```bash
kubectl rollout restart deployment/innovation-guild-backend --namespace default
```

---

## 5. Verification & Testing Steps

### 1. Verify Secret Keys in Kubernetes (Non-sensitive)
Check that all expected keys are present in the secret without revealing their values:
```bash
kubectl get secret backend-integrations-secret -n default -o jsonpath='{.data}' | jq 'keys'
```
*Expected Output:*
```json
[
  "FROM_EMAIL",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "SENDGRID_API_KEY",
  "TWILIO_ACCOUNT_SID",
  "TWILIO_AUTH_TOKEN",
  "TWILIO_PHONE_NUMBER"
]
```

### 2. Verify Backend Pod Environment Loading
Run a one-line Node.js check inside the running backend container to confirm the variables are loaded:
```bash
kubectl exec -n default deploy/innovation-guild-backend -- node -e "
  console.log('✅ GOOGLE_CLIENT_ID loaded:', !!process.env.GOOGLE_CLIENT_ID);
  console.log('✅ GOOGLE_CLIENT_SECRET loaded:', !!process.env.GOOGLE_CLIENT_SECRET);
  console.log('✅ TWILIO_ACCOUNT_SID loaded:', !!process.env.TWILIO_ACCOUNT_SID);
  console.log('✅ SENDGRID_API_KEY loaded:', !!process.env.SENDGRID_API_KEY);
  console.log('🔗 GOOGLE_REDIRECT_URI:', process.env.GOOGLE_REDIRECT_URI);
  console.log('🌐 FRONTEND_URL:', process.env.FRONTEND_URL);
"
```

### 3. End-to-End Authentication Test
1. Open your frontend in browser: `https://techdhara-staging.t4gc.in/register`
2. Click **Sign up with Google** or **Sign in with Google**.
3. Confirm Google redirects to `https://accounts.google.com/o/oauth2/v2/auth...` and allows you to select an account.
4. After authorization, verify redirect back to `https://techdhara-staging.t4gc.in/google-callback` with valid authentication state.
