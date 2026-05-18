#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

PORT="${PORT:-8080}"
URL="http://127.0.0.1:${PORT}/"

cleanup() {
  if [[ -n "${SERVER_PID:-}" ]] && kill -0 "$SERVER_PID" 2>/dev/null; then
    kill "$SERVER_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

python3 -m http.server "$PORT" --bind 127.0.0.1 >/dev/null &
SERVER_PID=$!

# Brief pause so the server accepts connections before the browser opens.
sleep 0.35

if command -v open >/dev/null 2>&1; then
  open "$URL"
else
  echo "Apri nel browser: $URL"
fi

echo "Landing in ascolto su $URL"
echo "Premi Ctrl+C per fermare il server."
wait "$SERVER_PID"
