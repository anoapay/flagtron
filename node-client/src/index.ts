import axios from "axios";
import {
  ApiResponse,
  IFlag,
  IFeatureFlagEvent,
  IFlags,
  IFlagsCache,
  IFlagtronConfig,
} from "./types";
import { WebSocket } from "ws";
import { log } from "./utils";

const getAllFlags = async (
  flagsmithApi: string,
  flagsmithEnvironmentId: string
): Promise<ApiResponse<IFlags>> => {
  const response = await axios.get<IFlags>(`${flagsmithApi}/api/v1/flags`, {
    headers: { "x-environment-key": flagsmithEnvironmentId },
  });

  if (response.status !== 200) {
    return { status: false };
  }

  if (!Array.isArray(response.data)) {
    return { status: false };
  }

  return { status: true, data: response.data };
};

export class Flagtron {
  public flags: IFlagsCache;
  private dependencies: Set<string>;
  private flagsmithApi: string;
  private flagsmithEnvironmentId: string;
  private flagtronWebsocketServer: string;
  private reconnectInterval: number;
  private reconnectAttempts: number;
  private maxReconnectAttempts: number; // To prevent infinite loops
  private isInitialized: boolean;
  private initializingPromise: Promise<boolean> | null = null;
  private websocket: WebSocket | null;
  public onFlagUpdate?: (flag: IFlag & { name: string }) => void;

  constructor(config: IFlagtronConfig) {
    this.flags = {};
    this.dependencies = new Set(config.dependencies);
    this.flagsmithApi = config.flagsmithApi;
    this.reconnectAttempts = 0;
    this.flagsmithEnvironmentId = config.flagsmithEnvironmentId;
    this.flagtronWebsocketServer = config.flagtronWebsocketServer;
    this.reconnectInterval = config.reconnectInterval ?? 5000;
    this.maxReconnectAttempts = config.maxReconnectAttempts ?? 10;
    this.websocket = null;
    this.isInitialized = false;
    this.onFlagUpdate = config.onFlagUpdate;
  }

  private listenForChanges(): Promise<void> {
    const _this = this;
    return new Promise(function (resolve, reject) {
      if (_this.websocket) {
        _this.websocket?.removeAllListeners(); // Properly remove previous listeners
        _this.websocket?.close(); // Close existing WebSocket if open
        log("Existing WebSocket found. Closing and removing listeners.");
      }

      _this.websocket = new WebSocket(_this.flagtronWebsocketServer);

      _this.websocket.on("open", () => {
        log("Connected to Flagtron WebSocket.");
        _this.isInitialized = true;
        _this.reconnectAttempts = 0; // Reset on successful connection
        resolve();
      });

      _this.websocket.on("message", (data: Buffer) => {
        try {
          const flagEvent: IFeatureFlagEvent = JSON.parse(data.toString());

          if (!flagEvent?.data?.new_state) {
            return;
          }

          const featureState = flagEvent.data.new_state;

          if (_this.dependencies.has(featureState.feature.name)) {
            _this.flags[featureState.feature.name] = {
              enabled: featureState.enabled,
              value:
                featureState.feature_state_value ??
                featureState.feature.initial_value,
            };

            _this?.onFlagUpdate?.({
              ..._this.flags[featureState.feature.name],
              name: featureState.feature.name,
            });

            log(`Updated flag: ${featureState.feature.name}`);
          }
        } catch (error: unknown) {
          if (error instanceof Error) {
            log(
              "(Flagtron ERR) Error parsing WebSocket message:",
              error.message
            );
          }
        }
      });

      _this.websocket.on("close", (code, reason) => {
        log(
          `(Flagtron ERR) WebSocket closed. Code: ${code}, Reason: ${reason.toString()}`
        );
        _this.reconnectWebSocket();
      });
    });
  }

  private reconnectWebSocket() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      log(
        "(Flagtron ERR) Max reconnect attempts reached. Stopping WebSocket reconnection."
      );
      return;
    }

    this.reconnectAttempts++;

    setTimeout(() => this.listenForChanges(), this.reconnectInterval);
  }
  public async initialize() {
    if (this.initializingPromise) {
      return this.initializingPromise;
    }

    this.initializingPromise = (async () => {
      if (!this.flagsmithApi || !this.flagsmithEnvironmentId) {
        throw new Error(
          "No Flagsmith API key or environment ID provided. Exiting."
        );
      }

      const flags = await getAllFlags(
        this.flagsmithApi,
        this.flagsmithEnvironmentId
      );

      if (!flags.status || !flags.data) {
        throw new Error("Error fetching initial flags from Flagsmith");
      }

      flags.data.forEach((flag) => {
        if (!this.dependencies.has(flag.feature.name)) {
          return;
        }
        this.flags[flag.feature.name] = {
          enabled: flag.enabled,
          value: flag.feature_state_value ?? flag.feature.initial_value,
        };
      });

      await this.listenForChanges();
      return true;
    })();

    return this.initializingPromise;
  }

  public getFlag(flagName: string): IFlag | undefined {
    if (!this.isInitialized) {
      throw new Error("Flagtron not initialized. Call initialize() first.");
    }

    return this.flags[flagName];
  }
}

export default Flagtron;
