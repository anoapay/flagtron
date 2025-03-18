import { log } from "./utils";

if (!process.env.FLAGSMITH_API) {
  log("No Flagsmith API key provided. Exiting.");
  process.exit(1);
}

if (!process.env.FLAGSMITH_ENVIRONMENT_ID) {
  log("No Flagsmith environment ID provided. Exiting.");
  process.exit(1);
}

if (!process.env.FLAGSMITH_WEBHOOK_SECRET) {
  log("No Flagsmith webhook secret provided. Exiting.");
  process.exit(1);
}

if (!process.env.WEBHOOK_PORT) {
  log("No webhook port provided. Defaulting to 4567");
}

if (!process.env.WEBSOCKET_PORT) {
  log("No websocket port provided. Defaulting to 4568");
}

export const FLAGSMITH_WEBHOOK_SECRET = process.env.FLAGSMITH_WEBHOOK_SECRET;
export const FLAGSMITH_API = process.env.FLAGSMITH_API;
export const FLAGSMITH_ENVIRONMENT_ID = process.env.FLAGSMITH_ENVIRONMENT_ID;
export const WEBHOOK_PORT = Number(process.env.WEBHOOK_PORT || 4567);
export const WEBSOCKET_PORT = Number(process.env.WEBSOCKET_PORT || 4568);
