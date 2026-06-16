import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "basic-ftp";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const desktopDir = path.resolve(projectRoot, "..", "..");

// Minimal .env.deploy loader so credentials never live in the repo or in
// package.json. The file is gitignored (matched by .env*). Real environment
// variables take precedence over the file.
function loadDeployEnv() {
  const envPath = path.join(projectRoot, ".env.deploy");
  if (!fs.existsSync(envPath)) return;

  for (const rawLine of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

function fail(message) {
  console.error(`❌ ${message}`);
  process.exit(1);
}

function required(name) {
  const value = process.env[name];
  if (!value || !value.trim()) {
    fail(
      `Missing ${name}. Copy .env.deploy.example to .env.deploy and fill in your Hostinger FTP details.`
    );
  }
  return value.trim();
}

loadDeployEnv();

const localDir = process.env.HOSTINGER_DEPLOY_DIR
  ? path.resolve(process.env.HOSTINGER_DEPLOY_DIR)
  : path.join(desktopDir, "dressfield-deploy-latest");

const remoteDir = (process.env.HOSTINGER_FTP_REMOTE_DIR || "/public_html").trim();
const host = required("HOSTINGER_FTP_HOST");
const user = required("HOSTINGER_FTP_USER");
const password = required("HOSTINGER_FTP_PASSWORD");
const port = Number(process.env.HOSTINGER_FTP_PORT || 21);
const secure = (process.env.HOSTINGER_FTP_SECURE || "true").toLowerCase() !== "false";
// Shared hosts often present certs that don't validate against the FTP hostname;
// default to not rejecting so the deploy doesn't fail on that. Set to "true" to enforce.
const rejectUnauthorized =
  (process.env.HOSTINGER_FTP_REJECT_UNAUTHORIZED || "false").toLowerCase() === "true";
// Opt-in: wipe the remote directory before uploading. Off by default so we never
// destroy anything unexpectedly on the live server.
const clean = (process.env.HOSTINGER_FTP_CLEAN || "false").toLowerCase() === "true";

if (!fs.existsSync(path.join(localDir, "index.html"))) {
  fail(
    `No deploy folder found at ${localDir} (missing index.html). ` +
      `Run "npm run prepare:hostinger" first (or build with "npm run deploy:hostinger").`
  );
}

// Shared hosting frequently drops the FTPS control socket during a long
// transfer (ECONNRESET). uploadFromDir overwrites existing files, so re-running
// after a drop is safe and idempotent — we just reconnect and resume the pass.
const MAX_ATTEMPTS = Number(process.env.HOSTINGER_FTP_ATTEMPTS || 5);
let uploaded = 0;

async function runUpload(attempt) {
  const client = new Client(0);
  client.ftp.verbose = false;
  // Keep the control socket alive so it isn't reaped while data is flowing.
  client.trackProgress((info) => {
    if (info.type === "upload" && info.name) {
      uploaded += 1;
      process.stdout.write(`\r  uploaded ${uploaded} files...`);
    }
  });

  try {
    console.log(
      `\nConnecting to ${host}:${port} (secure=${secure}) — attempt ${attempt}/${MAX_ATTEMPTS}...`
    );
    await client.access({
      host,
      user,
      password,
      port,
      secure,
      secureOptions: { rejectUnauthorized },
    });
    try {
      client.ftp.socket.setKeepAlive(true, 10000);
    } catch {
      // Best-effort; not all socket types support it.
    }

    await client.ensureDir(remoteDir);

    if (clean && attempt === 1) {
      console.log("Clearing remote directory (HOSTINGER_FTP_CLEAN=true)...");
      await client.clearWorkingDir();
    }

    console.log(`Uploading ${localDir} -> ${remoteDir} ...`);
    await client.uploadFromDir(localDir);
  } finally {
    client.close();
  }
}

let lastError;
for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
  try {
    await runUpload(attempt);
    process.stdout.write("\n");
    console.log(`✅ Deploy complete — ${uploaded} file transfers to ${remoteDir}`);
    lastError = undefined;
    break;
  } catch (error) {
    lastError = error;
    process.stdout.write("\n");
    console.warn(`⚠️  Attempt ${attempt} interrupted: ${error.message}`);
    if (attempt < MAX_ATTEMPTS) {
      console.log("   Reconnecting and resuming (already-uploaded files are skipped/overwritten)...");
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}

if (lastError) {
  console.error(`❌ Deploy failed after ${MAX_ATTEMPTS} attempts:`, lastError.message);
  process.exitCode = 1;
}
