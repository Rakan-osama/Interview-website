#!/usr/bin/env sh
set -eu

: "${ACTIONS_ID_TOKEN_REQUEST_URL:?GitHub OIDC request URL is unavailable}"
: "${ACTIONS_ID_TOKEN_REQUEST_TOKEN:?GitHub OIDC request token is unavailable}"
: "${OIDC_AUDIENCE:?Set the protected OIDC_AUDIENCE environment variable}"

response="$(curl --fail --silent --show-error \
  -H "Authorization: Bearer ${ACTIONS_ID_TOKEN_REQUEST_TOKEN}" \
  "${ACTIONS_ID_TOKEN_REQUEST_URL}&audience=${OIDC_AUDIENCE}")"

OIDC_RESPONSE="$response" php -r '
$payload = json_decode(getenv("OIDC_RESPONSE"), true, 512, JSON_THROW_ON_ERROR);
if (!isset($payload["value"]) || !is_string($payload["value"])) {
    fwrite(STDERR, "GitHub did not return an OIDC token.\n");
    exit(1);
}
file_put_contents("/tmp/backend-lab-oidc-token", $payload["value"], LOCK_EX);
chmod("/tmp/backend-lab-oidc-token", 0600);
'
