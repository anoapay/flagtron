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
  type: "STANDARD" | string; // Extendable if other types exist
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
  //Which flags to preload and listen for changes. These will be cached in memory on redis
  dependencies: string[];

  //On flag update callback
  onFlagUpdate?: (flag: IFlag) => void;

  //The flagsmith api URL
  flagsmithApi: string;

  //The flagsmith environment ID
  flagsmithEnvironmentId: string;

  //The flagtron websocket server
  flagtronWebsocketServer: string;

  //Reconnect interval in ms (default 5000)
  reconnectInterval?: number;

  //Max reconnect attempts (default 10)
  maxReconnectAttempts?: number;
};

/*

Feature flag events
*/

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
    changed_by: string; // Email or API Key name
    new_state: FeatureState;
    previous_state: FeatureState;
    timestamp: string; // ISO timestamp
  };
  event_type: "FLAG_UPDATED";
};
