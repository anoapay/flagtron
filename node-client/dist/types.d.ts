type Project = {
    id: number;
    name: string;
};
type FlagsmithFeature = {
    id: number;
    name: string;
    created_date: string;
    description: string;
    initial_value: string | null;
    default_enabled: boolean;
    project?: Project;
    type: "STANDARD" | string;
};
type FlagsmithFlag = {
    id: number;
    feature: FlagsmithFeature;
    feature_state_value: string | null;
    environment: number;
    identity: number | null;
    feature_segment: number | null;
    enabled: boolean;
};
export type ApiResponse<T> = {
    status: boolean;
    data?: T;
};
export type IFlags = FlagsmithFlag[];
export type IFlag = {
    enabled: boolean;
    value: string | null;
};
export type IFlagsCache = {
    [key: string]: IFlag;
};
export type IFlagtronConfig = {
    dependencies: string[];
    flagsmithApi: string;
    flagsmithEnvironmentId: string;
    flagtronWebsocketServer: string;
    reconnectInterval?: number;
    maxReconnectAttempts?: number;
};
type FlagsmithEnvironment = {
    id: number;
    name: string;
};
type FeatureState = {
    enabled: boolean;
    environment: FlagsmithEnvironment;
    feature: FlagsmithFeature;
    feature_segment: null;
    feature_state_value: string | null;
    identity: null;
    identity_identifier: string | null;
};
export type IFeatureFlagEvent = {
    data: {
        changed_by: string;
        new_state: FeatureState;
        previous_state: FeatureState;
        timestamp: string;
    };
    event_type: "FLAG_UPDATED";
};
export {};
