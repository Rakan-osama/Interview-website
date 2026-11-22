#!/usr/bin/env sh
set -eu

digest="${1:?Pass the deployed sha256 digest}"
: "${HEALTH_URL:?Set HEALTH_URL to the production health endpoint}"
: "${DEPLOY_TARGET:?Set DEPLOY_TARGET to the OIDC-aware deployment gateway URL}"
token="$(cat /tmp/backend-lab-oidc-token)"

attempt=1
while [ "$attempt" -le 30 ]; do
  if response="$(curl --fail --silent --show-error "${HEALTH_URL}")" && printf '%s' "$response" | grep -q "$digest"; then
    curl --fail --silent --show-error \
      -X POST "${DEPLOY_TARGET%/}/deployments/finalize" \
      -H "Authorization: Bearer ${token}" \
      -H "Content-Type: application/json" \
      --data "{\"digest\":\"${digest}\",\"reloadWorkers\":true,\"contractMigration\":true}"
    exit 0
  fi
  attempt=$((attempt + 1))
  sleep 5
done

echo "The deployed digest did not become healthy before the rollout deadline." >&2
exit 1
