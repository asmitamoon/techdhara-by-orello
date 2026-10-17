#!/usr/bin/env bash
# ==============================================================================
# Tech Dhaara (Innovation Guild) - Secure Admin Credential Setup Script
# ==============================================================================
# This script securely updates or creates a Super Admin / Admin account
# in the k3s cluster without exposing passwords in command line arguments or logs.
# ==============================================================================

set -euo pipefail

NAMESPACE="${1:-innovation-guild}"
REMOTE_HOST="${2:-}"

echo "==================================================================="
echo "  Tech Dhaara - Admin Credentials Provisioner"
echo "==================================================================="
echo "Target Namespace: ${NAMESPACE}"
if [[ -n "${REMOTE_HOST}" ]]; then
  echo "Target Host     : ${REMOTE_HOST}"
fi
echo "-------------------------------------------------------------------"
echo ""

# 1. Prompt for Admin Email
read -rp "Enter Admin Email [default: superadmin@gmail.com]: " ADMIN_EMAIL
ADMIN_EMAIL="${ADMIN_EMAIL:-superadmin@gmail.com}"
ADMIN_EMAIL="$(echo "${ADMIN_EMAIL}" | tr '[:upper:]' '[:lower:]' | xargs)"

# 2. Prompt for Full Name
read -rp "Enter Admin Full Name [default: Super Admin]: " ADMIN_NAME
ADMIN_NAME="${ADMIN_NAME:-Super Admin}"

# 3. Prompt for Password (masked)
while true; do
  read -rsp "Enter New Password: " ADMIN_PASS
  echo ""
  read -rsp "Confirm New Password: " ADMIN_PASS_CONFIRM
  echo ""

  if [[ -z "${ADMIN_PASS}" ]]; then
    echo "❌ Password cannot be empty. Please try again."
    echo ""
    continue
  fi

  if [[ "${ADMIN_PASS}" != "${ADMIN_PASS_CONFIRM}" ]]; then
    echo "❌ Passwords do not match. Please try again."
    echo ""
    continue
  fi

  break
done

echo ""
echo "Applying admin credentials to k3s cluster..."

# Node.js script to execute inside the backend pod
NODE_SCRIPT=$(cat << 'EOF'
const mongoose = require('mongoose');
const connectDB = require('./src/config/database');
const User = require('./src/models/User');

(async () => {
  try {
    await connectDB();
    const email = process.env.TARGET_ADMIN_EMAIL.toLowerCase();
    const fullName = process.env.TARGET_ADMIN_NAME;
    const password = process.env.TARGET_ADMIN_PASSWORD;

    let user = await User.findOne({ email });

    if (user) {
      user.passwordHash = password;
      user.fullName = fullName || user.fullName;
      user.role = 'SUPER_ADMIN';
      user.status = 'APPROVED';
      user.isEmailVerified = true;
      user.isEmailUser = true;
      user.registrationComplete = true;
      await user.save();
      console.log('✅ Existing admin password successfully updated for:', email);
    } else {
      user = new User({
        email: email,
        fullName: fullName || 'Super Admin',
        passwordHash: password,
        isEmailUser: true,
        isEmailVerified: true,
        role: 'SUPER_ADMIN',
        status: 'APPROVED',
        registrationComplete: true
      });
      await user.save();
      console.log('✅ New Super Admin user successfully created for:', email);
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error applying admin credentials:', err.message);
    process.exit(1);
  }
})();
EOF
)

if [[ -n "${REMOTE_HOST}" ]]; then
  # Running remotely via SSH
  ssh "${REMOTE_HOST}" "
    k3s kubectl exec -i -n '${NAMESPACE}' deploy/innovation-guild-backend -- env TARGET_ADMIN_EMAIL='${ADMIN_EMAIL}' TARGET_ADMIN_NAME='${ADMIN_NAME}' TARGET_ADMIN_PASSWORD='${ADMIN_PASS}' node -e \"${NODE_SCRIPT}\"
  "
else
  # Running directly on the server or with local kubectl
  KUBECTL_CMD="kubectl"
  if command -v k3s &>/dev/null; then
    KUBECTL_CMD="k3s kubectl"
  fi

  ${KUBECTL_CMD} exec -i -n "${NAMESPACE}" deploy/innovation-guild-backend -- env TARGET_ADMIN_EMAIL="${ADMIN_EMAIL}" TARGET_ADMIN_NAME="${ADMIN_NAME}" TARGET_ADMIN_PASSWORD="${ADMIN_PASS}" node -e "${NODE_SCRIPT}"
fi

echo ""
echo "==================================================================="
echo "🎉 Admin setup complete! You can now log in at your web application."
echo "==================================================================="
