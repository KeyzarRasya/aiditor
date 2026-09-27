import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { renderCatalogMarkdown } from "../src/components/catalog.js";

const target = fileURLToPath(new URL("../docs/COMPONENTS.md", import.meta.url));
writeFileSync(target, renderCatalogMarkdown());
process.stdout.write(`Wrote docs/COMPONENTS.md\n`);
