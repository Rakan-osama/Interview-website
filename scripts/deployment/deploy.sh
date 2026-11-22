#!/usr/bin/env sh
set -eu

digest="${1:?Pass an immutable sha256 digest}"
mode="${2:-deploy}"
: "${DEPLOY_TARGET:?Set DEPLOY_TARGET to the OIDC-aware deployment gateway URL}"
token_file="/tmp/backend-lab-oidc-token"
test -r "$token_file"
token="$(cat "$token_file")"

case "$mode" in
  --rollback) action="rollback" ;;
  deploy) action="expand-and-deploy" ;;
  *) echo "Unsupported deployment mode: $mode" >&2; exit 2 ;;
esac

curl --fail --silent --show-error \
  -X POST "${DEPLOY_TARGET%/}/deployments" \
  -H "Authorization: Bearer ${token}" \
  -H "Content-Type: application/json" \
  --data "{\"action\":\"${action}\",\"digest\":\"${digest}\"}"
