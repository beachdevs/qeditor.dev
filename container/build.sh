#!/bin/bash
set -euo pipefail

IMAGE_NAME="qeditor-terminal"
CONTAINER_NAME="qeditor-terminal"
MEMORY_LIMIT="4g"
CPU_LIMIT="4"

require_container_cli() {
  if ! command -v container >/dev/null 2>&1; then
    echo "Error: Apple's 'container' CLI is required for these scripts." >&2
    exit 1
  fi
}

require_container_cli

# Build image
echo "Building image: $IMAGE_NAME..."
container build --no-cache -t "$IMAGE_NAME" .

# Stop and remove existing container if it exists
echo "Stopping and removing existing container if it exists..."
container stop "$CONTAINER_NAME" 2>/dev/null || true
container rm "$CONTAINER_NAME" 2>/dev/null || true

# Run the container
echo "Running container $CONTAINER_NAME..."
container run -d \
    --name "$CONTAINER_NAME" \
    -p 7681:7681 \
    --memory "$MEMORY_LIMIT" \
    --cpus "$CPU_LIMIT" \
    "$IMAGE_NAME"

echo "Container is running at http://localhost:7681"
echo "You can use this terminal from qeditor.dev now."
