import { loadConfig } from "./bootstrap/config.js";
import { buildApp } from "./index.js";

let app: Awaited<ReturnType<typeof buildApp>> | undefined;
let isShuttingDown = false;

async function shutdown(signal: NodeJS.Signals) {
  if (!app || isShuttingDown) return;
  isShuttingDown = true;
  app.log.info({ signal }, "Shutting down.");

  try {
    await app.close();
  } catch (error) {
    app.log.error(error, "Shutdown failed.");
    process.exitCode = 1;
  }
}

try {
  const config = loadConfig();
  app = await buildApp(config);
  await app.listen({ port: config.port, host: config.host });
  process.once("SIGINT", () => void shutdown("SIGINT"));
  process.once("SIGTERM", () => void shutdown("SIGTERM"));
} catch (error) {
  if (app) {
    app.log.error(error, "Application startup failed.");
  } else {
    console.error("Application startup failed.", error);
  }
  if (app) {
    try {
      await app.close();
    } catch (closeError) {
      app.log.error(closeError, "Cleanup after startup failure failed.");
    }
  }
  process.exitCode = 1;
}
