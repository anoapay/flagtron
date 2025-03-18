import { IFlag, IFeatureFlagEvent, IFlagsCache, IFlagtronConfig } from "./types";
export declare class Flagtron {
    flags: IFlagsCache;
    private dependencies;
    private flagsmithApi;
    private flagsmithEnvironmentId;
    private flagtronWebsocketServer;
    private reconnectInterval;
    private reconnectAttempts;
    private maxReconnectAttempts;
    private isInitialized;
    private websocket;
    onFlagUpdate?: (flag: IFeatureFlagEvent) => void;
    constructor(config: IFlagtronConfig);
    private listenForChanges;
    private reconnectWebSocket;
    initialize(): Promise<void>;
    getFlag(flagName: string): IFlag | undefined;
}
export default Flagtron;
