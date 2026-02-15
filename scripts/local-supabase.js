/**
 * Start local Supabase, update .env, apply migrations.
 * Requires Docker Desktop to be running.
 * Usage: yarn local
 */

const { execSync, spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const root = path.join(__dirname, "..");

function run(cmd, opts = {}) {
  return execSync(cmd, { encoding: "utf-8", cwd: root, ...opts });
}

function runNode(script) {
  const r = spawnSync("node", [path.join(__dirname, script)], {
    cwd: root,
    stdio: "inherit",
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

console.log("1/4 Starting local Supabase (Docker must be running)...");
try {
  run("npx supabase start");
} catch (e) {
  console.error("\nSupabase start failed. Is Docker Desktop running?");
  console.error("If you just installed Docker, try rebooting once, then run: yarn local");
  process.exit(1);
}

console.log("\n2/4 Writing local URL and keys to .env...");
runNode("supabase-env.js");

console.log("\n3/4 Applying database migrations...");
try {
  run("npx supabase db reset");
} catch (e) {
  console.error("db reset failed:", e.message);
  process.exit(1);
}

console.log("\n4/4 Done. Start the app and test:");
console.log("   yarn dev");
console.log("   Open http://localhost:3000 → Sign up → Dashboard");
console.log("\nStop Supabase when done: yarn supabase:stop");
