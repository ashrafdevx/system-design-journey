#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
base_url="${BASE_URL:-http://host.docker.internal:3000}"
monitoring_compose="${project_root}/docker/monitoring-compose.yaml"
host_metrics_dir="${project_root}/.monitoring/host-metrics"

mkdir -p "${host_metrics_dir}"
HOST_METRICS_FILE="${host_metrics_dir}/host.prom" \
  node "${project_root}/scripts/monitor/host-metrics.js" &
host_metrics_pid=$!

cleanup() {
  kill "${host_metrics_pid}" 2>/dev/null || true
  wait "${host_metrics_pid}" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

docker compose -f "${monitoring_compose}" up -d

printf '\nSystem metrics dashboard: http://localhost:3001/d/system-load/system-load\n'
printf 'k6 request dashboard: http://localhost:5665\n\n'

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
