#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
REGION="${AWS_REGION:-us-east-2}"
PROFILE="${AWS_PROFILE:-cuenta nueva}"
TEMPLATE_NAME="confirmacionPagoComercio"

HTML="$ROOT/src/templates/${TEMPLATE_NAME}.html"
JSON="$ROOT/src/templates/${TEMPLATE_NAME}.json"

if ! command -v jq >/dev/null 2>&1; then
  echo "Se requiere jq instalado." >&2
  exit 1
fi

TMP="$(mktemp)"
trap 'rm -f "$TMP"' EXIT

SUBJECT=$(jq -r '.subject' "$JSON")
jq -n \
  --arg name "$TEMPLATE_NAME" \
  --arg subject "$SUBJECT" \
  --rawfile html "$HTML" \
  '{Template: {TemplateName: $name, SubjectPart: $subject, HtmlPart: $html}}' \
  > "$TMP"

AWS=(aws --region "$REGION" --profile "$PROFILE")

if "${AWS[@]}" ses get-template --template-name "$TEMPLATE_NAME" >/dev/null 2>&1; then
  "${AWS[@]}" ses update-template --cli-input-json "file://$TMP"
  echo "Plantilla ${TEMPLATE_NAME} actualizada en SES (región ${REGION}, perfil «${PROFILE}»)."
else
  "${AWS[@]}" ses create-template --cli-input-json "file://$TMP"
  echo "Plantilla ${TEMPLATE_NAME} creada en SES (región ${REGION}, perfil «${PROFILE}»)."
fi
