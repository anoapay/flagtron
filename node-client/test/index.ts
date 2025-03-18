import { Flagtron } from "../src";

const start = async () => {
  const FlagtronProvider = new Flagtron({
    dependencies: ["rail_provider"],
    flagsmithApi: "https://api.flags.anoa.io",
    flagsmithEnvironmentId: "ser.Tn93Uq5ah8vUDVkvnxYDMB",
    flagtronWebsocketServer: "wss://flagtron.anoa.io",
  });

  await FlagtronProvider.initialize();

  console.log("Flagtron initialized");

  setInterval(() => {
    console.log(FlagtronProvider.getFlag("rail_provider"));
  }, 5000);
};

start();
