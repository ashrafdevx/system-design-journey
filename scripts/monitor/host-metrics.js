import { mkdir, rename, unlink, writeFile } from "node:fs/promises";
import { cpus, freemem, loadavg, totalmem } from "node:os";
import { dirname } from "node:path";

const metricsFile = process.env.HOST_METRICS_FILE;
if (!metricsFile) {
  throw new Error("HOST_METRICS_FILE must be set.");
}

function readCpuTimes() {
  return cpus().reduce(
    (totals, cpu) => {
      for (const [mode, time] of Object.entries(cpu.times)) {
        totals[mode] += time;
      }
      return totals;
    },
    { user: 0, nice: 0, sys: 0, idle: 0, irq: 0 },
  );
}

let previousCpuTimes = readCpuTimes();

function cpuUsagePercent() {
  const currentCpuTimes = readCpuTimes();
  const elapsed = Object.values(currentCpuTimes).reduce(
    (total, time) => total + time,
    0,
  ) - Object.values(previousCpuTimes).reduce((total, time) => total + time, 0);
  const idle = currentCpuTimes.idle - previousCpuTimes.idle;
  previousCpuTimes = currentCpuTimes;
  if (elapsed <= 0) return 0;
  return Math.max(0, Math.min(100, ((elapsed - idle) / elapsed) * 100));
}

async function writeMetrics() {
  const memoryTotal = totalmem();
  const memoryUsed = memoryTotal - freemem();
  const [load1, load5, load15] = loadavg();
  const lines = [
    "# HELP host_cpu_usage_percent Total host CPU usage percentage.",
    "# TYPE host_cpu_usage_percent gauge",
    `host_cpu_usage_percent ${cpuUsagePercent().toFixed(2)}`,
    "# HELP host_load_average_1m Host one-minute load average.",
    "# TYPE host_load_average_1m gauge",
    `host_load_average_1m ${load1}`,
    "# HELP host_load_average_5m Host five-minute load average.",
    "# TYPE host_load_average_5m gauge",
    `host_load_average_5m ${load5}`,
    "# HELP host_load_average_15m Host fifteen-minute load average.",
    "# TYPE host_load_average_15m gauge",
    `host_load_average_15m ${load15}`,
    "# HELP host_memory_usage_percent Host memory usage percentage.",
    "# TYPE host_memory_usage_percent gauge",
    `host_memory_usage_percent ${((memoryUsed / memoryTotal) * 100).toFixed(2)}`,
    "# HELP host_memory_used_bytes Host memory used in bytes.",
    "# TYPE host_memory_used_bytes gauge",
    `host_memory_used_bytes ${memoryUsed}`,
    "# HELP host_memory_total_bytes Host total memory in bytes.",
    "# TYPE host_memory_total_bytes gauge",
    `host_memory_total_bytes ${memoryTotal}`,
    "",
  ];

  await mkdir(dirname(metricsFile), { recursive: true });
  const temporaryFile = `${metricsFile}.${process.pid}.tmp`;
  await writeFile(temporaryFile, lines.join("\n"), { mode: 0o644 });
  await rename(temporaryFile, metricsFile);
}

await writeMetrics();
const interval = setInterval(() => {
  writeMetrics().catch((error) => {
    console.error("Could not write host metrics.", error);
    process.exitCode = 1;
    clearInterval(interval);
  });
}, 1000);

async function stop() {
  clearInterval(interval);
  try {
    await unlink(metricsFile);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

function handleSignal() {
  stop().catch((error) => {
    console.error("Could not clean up the host metrics file.", error);
    process.exitCode = 1;
  });
}

process.once("SIGINT", handleSignal);
process.once("SIGTERM", handleSignal);
