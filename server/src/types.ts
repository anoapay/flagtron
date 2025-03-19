type FeatureState = {
  enabled: boolean;
  environment: Environment;
  feature: Feature;
  feature_segment: null;
  feature_state_value: string | null;
  identity: null;
  identity_identifier: string | null;
};

type Environment = {
  id: number;
  name: string;
};

type Feature = {
  created_date: string; // ISO timestamp
  default_enabled: boolean;
  description: string;
  id: number;
  initial_value: string | null;
  name: string;
  project: Project;
  type: string;
};

type Project = {
  id: number;
  name: string;
};
export type ApiResponse<T> = {
  data?: T;
  error?: string;
};
export type FeatureFlagEvent = {
  data: {
    changed_by: string; // Email or API Key name
    new_state: FeatureState;
    previous_state: FeatureState;
    timestamp: string; // ISO timestamp
  };
  event_type: "FLAG_UPDATED";
};


