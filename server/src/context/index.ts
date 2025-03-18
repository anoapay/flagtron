import { WebSocketServer } from "ws";

export const global = {
  appName: "FlagtronBackend",
  version: "1.0.0",
  wsServer: null as WebSocketServer | null,
};
export default global;
