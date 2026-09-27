import { fileURLToPath } from "node:url";
import { FontRegistry, configureFontRegistry, resetProjectTheme } from "aiditor";

configureFontRegistry(new FontRegistry([fileURLToPath(new URL("../fonts", import.meta.url))]));
resetProjectTheme();
