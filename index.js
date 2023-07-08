import { config as badConfig } from "./bad/config.js";
import { config as niceConfig } from "./nice/config.js";

import {robot} from "./robot.js";

const main = async () => {
    await robot(badConfig);
    await robot(niceConfig);
}

main();