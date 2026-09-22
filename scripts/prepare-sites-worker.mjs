import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const openNextDir = resolve(root, ".open-next");
const distDir = resolve(root, "dist");
const serverDir = resolve(distDir, "server");
const clientDir = resolve(distDir, "client");

rmSync(distDir, { force: true, recursive: true });
mkdirSync(serverDir, { recursive: true });

cpSync(openNextDir, serverDir, { recursive: true });
cpSync(resolve(openNextDir, "assets"), clientDir, { recursive: true });

writeFileSync(
  resolve(serverDir, "index.js"),
  'export { default } from "./worker.js";\n',
);
