import { IFlag, IFlagsCache, IFlagtronConfig } from "./types";
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
    onFlagUpdate?: (flag: IFlag & {
        name: string;
    }) => void;
    constructor(config: IFlagtronConfig);
    private listenForChanges;
    private reconnectWebSocket;
    initialize(): Promise<boolean>;
    getFlag(flagName: string): IFlag | undefined;
}
export default Flagtron;
