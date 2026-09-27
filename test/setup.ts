import { fileURLToPath } from "node:url";
import { FontRegistry, configureFontRegistry } from "aiditor";

configureFontRegistry(new FontRegistry([fileURLToPath(new URL("../fonts", import.meta.url))]));
