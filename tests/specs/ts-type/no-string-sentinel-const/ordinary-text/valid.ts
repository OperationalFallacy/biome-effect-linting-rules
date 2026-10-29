const yarnVersion = "4.6.0";
const packageManifestPath = "package.json";
const upgradeSchedule = "0 0 * * 1,4";
const label = "Ready";
const statusPage = "/status";
const estate = "Seaside";
const stateDirectory = ".state";

const defaults = { status: "ready" };
let status = "loading";
