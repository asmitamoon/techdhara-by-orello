#!/usr/bin/env bash
# ==============================================================================
# Tech Dhaara (Innovation Guild) - Interactive Secret Provisioning Script
# ==============================================================================
# This script securely prompts for integration credentials in your local terminal
# (with hidden inputs for secrets) and creates/updates the Kubernetes secret
# 'backend-integrations-secret' without writing plaintext keys to Git or disk.
# ==============================================================================

set -euo pipefail

SECRET_NAME="backend-integrations-secret"
NAMESPACE="${1:-default}"

echo "==================================================================="
echo "  Tech Dhaara - Kubernetes Integrations Secret Provisioner"
echo "==================================================================="
echo "Target Secret Name : ${SECRET_NAME}"
echo "Target Namespace   : ${NAMESPACE}"
echo "-------------------------------------------------------------------"
echo "Note: Secret inputs will be masked (hidden) as you type."
echo ""

# 1. Google OAuth Credentials
echo "--- 1. Google OAuth Configuration ---"
read -rp "Google OAuth Client ID (e.g. xxxxx.apps.googleusercontent.com): " GOOGLE_CLIENT_ID
read -rsp "Google OAuth Client Secret: " GOOGLE_CLIENT_SECRET
echo ""
echo ""

# 2. Twilio SMS / WhatsApp Credentials
echo "--- 2. Twilio SMS Configuration ---"
read -rp "Twilio Account SID (e.g. ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx): " TWILIO_ACCOUNT_SID
read -rsp "Twilio Auth Token: " TWILIO_AUTH_TOKEN
echo ""
read -rp "Twilio Phone Number (E.164 format, e.g. +1234567890): " TWILIO_PHONE_NUMBER
read -rp "Twilio WhatsApp Number (Optional, e.g. +14155238886, press Enter to skip): " TWILIO_WHATSAPP_NUMBER
echo ""

# 3. SendGrid Email Configuration
echo "--- 3. SendGrid Email Configuration ---"
read -rsp "SendGrid API Key (e.g. SG.xxxxxxxxxxxxxxxxxxxx): " SENDGRID_API_KEY
echo ""
read -rp "Verified From Email Address (e.g. no-reply@techdhara.org): " FROM_EMAIL
echo ""

# 4. Optional Perplexity AI Key
echo "--- 4. Optional Integrations ---"
read -rsp "Perplexity AI API Key (Optional, press Enter to skip): " PERPLEXITY_API_KEY
echo ""
echo ""

# Build kubectl secret creation args array
LITERAL_ARGS=()

if [[ -n "${GOOGLE_CLIENT_ID}" ]]; then
  LITERAL_ARGS+=(--from-literal="GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}")
fi

if [[ -n "${GOOGLE_CLIENT_SECRET}" ]]; then
  LITERAL_ARGS+=(--from-literal="GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}")
fi

if [[ -n "${TWILIO_ACCOUNT_SID}" ]]; then
  LITERAL_ARGS+=(--from-literal="TWILIO_ACCOUNT_SID=${TWILIO_ACCOUNT_SID}")
fi

if [[ -n "${TWILIO_AUTH_TOKEN}" ]]; then
  LITERAL_ARGS+=(--from-literal="TWILIO_AUTH_TOKEN=${TWILIO_AUTH_TOKEN}")
fi

if [[ -n "${TWILIO_PHONE_NUMBER}" ]]; then
  LITERAL_ARGS+=(--from-literal="TWILIO_PHONE_NUMBER=${TWILIO_PHONE_NUMBER}")
fi

if [[ -n "${TWILIO_WHATSAPP_NUMBER}" ]]; then
  LITERAL_ARGS+=(--from-literal="TWILIO_WHATSAPP_NUMBER=${TWILIO_WHATSAPP_NUMBER}")
fi

if [[ -n "${SENDGRID_API_KEY}" ]]; then
  LITERAL_ARGS+=(--from-literal="SENDGRID_API_KEY=${SENDGRID_API_KEY}")
fi

if [[ -n "${FROM_EMAIL}" ]]; then
  LITERAL_ARGS+=(--from-literal="FROM_EMAIL=${FROM_EMAIL}")
fi

if [[ -n "${PERPLEXITY_API_KEY}" ]]; then
  LITERAL_ARGS+=(--from-literal="PERPLEXITY_API_KEY=${PERPLEXITY_API_KEY}")
fi

if [[ ${#LITERAL_ARGS[@]} -eq 0 ]]; then
  echo "Error: No credentials were entered. Aborting."
  exit 1
fi

echo "-------------------------------------------------------------------"
echo "Applying secret '${SECRET_NAME}' to namespace '${NAMESPACE}'..."

kubectl create secret generic "${SECRET_NAME}" \
  --namespace "${NAMESPACE}" \
  "${LITERAL_ARGS[@]}" \
  --dry-run=client -o yaml | kubectl apply -f -

echo "-------------------------------------------------------------------"
echo "✅ Secret '${SECRET_NAME}' successfully applied in namespace '${NAMESPACE}'."
echo ""
echo "Next steps:"
echo "1. Verify secret keys in cluster (non-sensitive inspection):"
echo "   kubectl get secret ${SECRET_NAME} -n ${NAMESPACE} -o jsonpath='{.data}' | jq 'keys'"
echo ""
echo "2. Deploy or upgrade the Helm chart with:"
echo "   helm upgrade --install innovation-guild ./helm/innovation-guild \\"
echo "     -f ./helm/innovation-guild/values.yaml \\"
echo "     -f ./helm/innovation-guild/values-staging.yaml \\"
echo "     --set backend.integrationsSecretName=${SECRET_NAME} \\"
echo "     -n ${NAMESPACE}"
echo ""
echo "3. Restart backend pods to pick up environment variables:"
echo "   kubectl rollout restart deployment/innovation-guild-backend -n ${NAMESPACE}"
echo "==================================================================="
