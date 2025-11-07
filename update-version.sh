#!/usr/bin/env bash
# Usage:
#   ./update-version.sh <filename> [version]
# Example:
#   ./update-version.sh style.css 42
# If [version] is omitted, it just lists all references with ?v=

TARGET="$1"
VERSION="$2"

if [[ -z "$TARGET" ]]; then
  echo "Usage: $0 <filename> [version]"
  exit 1
fi

# Escape dots in filename for regex
ESCAPED_TARGET=$(printf '%s\n' "$TARGET" | sed 's/\./\\./g')

if [[ -z "$VERSION" ]]; then
  echo "Listing all references to $TARGET with ?v=:"
  grep -rHn -E "${ESCAPED_TARGET}\?v=[0-9]+" . || echo "No versioned references found."
  exit 0
fi

echo "Updating all references to $TARGET to version $VERSION..."
find . -type f \( -name "*.html" -o -name "*.js" -o -name "*.css" \) -exec \
  sed -i -E "s|${ESCAPED_TARGET}\?v=[0-9]+|${TARGET}?v=${VERSION}|g" {} +
echo "Done."
