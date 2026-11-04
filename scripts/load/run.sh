#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
base_url="${BASE_URL:-http://host.docker.internal:3000}"

printf '\nLive k6 dashboard: http://localhost:5665\n\n'

docker run --rm -t \
  --publish 127.0.0.1:5665:5665 \
  --volume "${project_root}:/work" \
  --workdir /work \
  --env "BASE_URL=${base_url}" \
  --env "K6_WEB_DASHBOARD=true" \
  --env "K6_WEB_DASHBOARD_HOST=0.0.0.0" \
  --env "K6_WEB_DASHBOARD_PORT=5665" \
  --env "K6_WEB_DASHBOARD_PERIOD=1s" \
  grafana/k6 run scripts/load/api.js
