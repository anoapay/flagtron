# Flagtron

Flagtron is a lightweight feature flag client that integrates with Flagsmith. It fetches all feature flags on initialization and listens for real-time changes via WebSockets.

## Features

- Fetches initial feature flags from Flagsmith
- Caches feature flags for quick lookups
- Listens for real-time flag updates via WebSockets
- Implements a reconnection strategy for WebSocket failures
- Provides a simple API to retrieve feature flags

## Installation

```sh
npm install flagtron
```

or

```sh
yarn add flagtron
```

## Usage

### Basic Example

Please view https://github.com/anoapay/flagtron/tree/main/server for instructions on how to setup flagtron server

```ts
import { Flagtron } from "flagtron";

const config = {
  flagsmithApi: "https://api.flagsmith.com",
  flagsmithEnvironmentId: "your-environment-id",
  flagtronWebsocketServer: "wss://your-websocket-server",
  dependencies: ["feature-flag-1", "feature-flag-2"],
  reconnectInterval: 5000,
  maxReconnectAttempts: 10,
};

const flagtron = new Flagtron(config);

async function main() {
  await flagtron.initialize();

  const featureFlag = flagtron.getFlag("feature-flag-1");
  console.log("Feature flag status:", featureFlag);
}

main();
```

## Configuration Options

| Option                    | Type       | Default  | Description                                         |
| ------------------------- | ---------- | -------- | --------------------------------------------------- |
| `flagsmithApi`            | `string`   | Required | Flagsmith API endpoint                              |
| `flagsmithEnvironmentId`  | `string`   | Required | Your Flagsmith environment ID                       |
| `flagtronWebsocketServer` | `string`   | Required | WebSocket server for real-time updates              |
| `dependencies`            | `string[]` | `[]`     | List of feature flags to track                      |
| `reconnectInterval`       | `number`   | `5000`   | Time in ms before attempting to reconnect WebSocket |
| `maxReconnectAttempts`    | `number`   | `10`     | Maximum WebSocket reconnection attempts             |

## API

### `initialize(): Promise<void>`

Initializes the flag cache by fetching flags from Flagsmith and connecting to the WebSocket server.

### `getFlag(flagName: string): IFlag | undefined`

Retrieves the cached value of a feature flag.

#### Example:

```ts
const featureFlag = flagtron.getFlag("feature-flag-1");
if (featureFlag?.enabled) {
  console.log("Feature is enabled");
} else {
  console.log("Feature is disabled");
}
```

## Error Handling

- If the Flagsmith API is unreachable, `initialize()` will throw an error.
- If the WebSocket connection fails, Flagtron will attempt to reconnect up to `maxReconnectAttempts`.

## Logging

Flagtron uses a `log()` utility to output status messages and errors. You can modify it in `utils.ts` to use a structured logger like `winston`.

## License

MIT
