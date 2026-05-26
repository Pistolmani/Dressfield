import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(projectRoot, "out");
const desktopDir = path.resolve(projectRoot, "..", "..");
const deployDir = process.env.HOSTINGER_DEPLOY_DIR
  ? path.resolve(process.env.HOSTINGER_DEPLOY_DIR)
  : path.join(desktopDir, "dressfield-deploy-latest");

const skippedTopLevelDirs = new Set([
  "product",
]);

const skippedRelativePaths = new Set([
  path.join("products", "catalog-preview"),
]);

function assertSafePaths() {
  if (!fs.existsSync(path.join(outDir, "index.html"))) {
    throw new Error(`Static export is missing index.html: ${outDir}`);
  }

  if (!fs.existsSync(path.join(outDir, "sitemap.xml"))) {
    throw new Error(`Static export is missing sitemap.xml: ${outDir}`);
  }

  const deployBaseName = path.basename(deployDir);
  if (deployBaseName !== "dressfield-deploy-latest") {
    throw new Error(`Refusing to clear unexpected deploy directory: ${deployDir}`);
  }

  const normalizedDesktop = desktopDir.toLowerCase();
  const normalizedDeploy = deployDir.toLowerCase();
  if (!normalizedDeploy.startsWith(normalizedDesktop)) {
    throw new Error(`Refusing to write outside Desktop: ${deployDir}`);
  }
}

function shouldSkip(relativePath, entry) {
  if (!relativePath) return false;

  const parts = relativePath.split(path.sep);
  if (parts.length === 1 && entry.isDirectory() && skippedTopLevelDirs.has(parts[0])) {
    return true;
  }

  if (entry.isDirectory() && skippedRelativePaths.has(relativePath)) {
    return true;
  }

  // Do not skip __next*.txt or index.txt files. In Next App Router static export,
  // those are RSC/static payload files used for client-side navigation.
  return false;
}

function emptyDirectory(directory) {
  fs.mkdirSync(directory, { recursive: true });

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    fs.rmSync(target, { recursive: true, force: true });
  }
}

function copyExportContents(sourceDir, targetDir, baseDir = sourceDir) {
  fs.mkdirSync(targetDir, { recursive: true });

  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    const sourcePath = path.join(sourceDir, entry.name);
    const relativePath = path.relative(baseDir, sourcePath);
    if (shouldSkip(relativePath, entry)) continue;

    const targetPath = path.join(targetDir, entry.name);
    if (entry.isDirectory()) {
      copyExportContents(sourcePath, targetPath, baseDir);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
}

function countFiles(directory) {
  let count = 0;

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      count += countFiles(fullPath);
    } else {
      count += 1;
    }
  }

  return count;
}

assertSafePaths();
emptyDirectory(deployDir);
copyExportContents(outDir, deployDir);

console.log(`Prepared Hostinger deploy folder: ${deployDir}`);
console.log(`Source files: ${countFiles(outDir)}`);
console.log(`Deploy files: ${countFiles(deployDir)}`);
