#!/bin/bash
set -euo pipefail

CONTAINER_NAME="qeditor-host"

require_container_cli() {
  if ! command -v container >/dev/null 2>&1; then
    echo "Error: Apple's 'container' CLI is required for these scripts." >&2
    exit 1
  fi
}

require_container_cli

container stop "$CONTAINER_NAME" 2>/dev/null || true
container rm "$CONTAINER_NAME" 2>/dev/null || true

echo "Container stopped: $CONTAINER_NAME"
