// Copie les modules ESM de MapLibre dans public/ avant `dev` et `build`.
//
// Depuis la v6, MapLibre lance son Web Worker à partir de fichiers voisins
// (`maplibre-gl-worker.mjs` importe `./maplibre-gl-shared.mjs`). Une fois
// passés dans Turbopack, ces fichiers sont renommés avec un hash et le
// worker ne retrouve plus ses dépendances : la carte reste vide, sans
// erreur. Servis tels quels depuis public/, les chemins relatifs tiennent.
import { cp, mkdir, readdir, readFile, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const packageDir = join(root, "node_modules", "maplibre-gl");
const { version } = JSON.parse(await readFile(join(packageDir, "package.json"), "utf8"));

const vendorDir = join(root, "public", "vendor", "maplibre-gl");
const targetDir = join(vendorDir, version);
const files = ["maplibre-gl.mjs", "maplibre-gl-shared.mjs", "maplibre-gl-worker.mjs"];

await mkdir(targetDir, { recursive: true });

// Retire les versions précédentes pour ne pas accumuler de fichiers.
for (const entry of await readdir(vendorDir)) {
  if (entry !== version) await rm(join(vendorDir, entry), { recursive: true, force: true });
}

for (const file of files) {
  await cp(join(packageDir, "dist", file), join(targetDir, file));
}

console.log(`maplibre-gl ${version} copié dans public/vendor/maplibre-gl/${version}/`);
