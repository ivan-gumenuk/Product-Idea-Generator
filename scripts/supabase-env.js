/**
 * Updates .env with local Supabase URL and keys from `supabase status -o env`.
 * Run after `yarn supabase:start` (requires Docker).
 * Usage: node scripts/supabase-env.js
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "..", ".env");
const envExamplePath = path.join(__dirname, "..", ".env.example");

function main() {
  let envContent;
  try {
    envContent = execSync("npx supabase status -o env", {
      encoding: "utf-8",
      cwd: path.join(__dirname, ".."),
    });
  } catch (e) {
    console.error("Failed to run supabase status. Is local Supabase running? Run: yarn supabase:start");
    process.exit(1);
  }

  const vars = {};
  for (const line of envContent.split("\n")) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m) vars[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
  }

  const apiUrl = vars.API_URL || vars.SUPABASE_URL;
  const anonKey = vars.ANON_KEY;
  const serviceRoleKey = vars.SERVICE_ROLE_KEY;

  if (!apiUrl || !anonKey || !serviceRoleKey) {
    console.error("Missing API_URL, ANON_KEY, or SERVICE_ROLE_KEY in supabase status output.");
    process.exit(1);
  }

  let env = "";
  if (fs.existsSync(envPath)) {
    env = fs.readFileSync(envPath, "utf-8");
  } else if (fs.existsSync(envExamplePath)) {
    env = fs.readFileSync(envExamplePath, "utf-8");
  }

  const updates = {
    NEXT_PUBLIC_SUPABASE_URL: apiUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: anonKey,
    SUPABASE_SERVICE_ROLE_KEY: serviceRoleKey,
  };

  for (const [key, value] of Object.entries(updates)) {
    const regex = new RegExp(`^(${key}=).*`, "m");
    if (regex.test(env)) {
      env = env.replace(regex, `$1${value}`);
    } else {
      env = env.trimEnd() + (env.endsWith("\n") ? "" : "\n") + `${key}=${value}\n`;
    }
  }

  fs.writeFileSync(envPath, env);
  console.log("Updated .env with local Supabase URL and keys.");
  console.log("NEXT_PUBLIC_SUPABASE_URL=" + apiUrl);
}

main();
