import fs from "fs";
import { execSync } from "child_process";

function getDynamicVersion() {
  let pkgVersion = "3.4.0";
  try {
    const pkg = JSON.parse(fs.readFileSync("./package.json", "utf8"));
    pkgVersion = pkg.version || "3.4.0";
  } catch (_) {}

  const parts = pkgVersion.split(".").map((n) => parseInt(n, 10) || 0);
  let baseMajor = parts[0] || 3;
  let baseMinor = parts[1] || 4;

  let commitCount = 0;
  let majorBumps = 0;

  // 1. Try to unshallow if building inside a shallow CI environment
  try {
    const isShallow = execSync("git rev-parse --is-shallow-repository", { encoding: "utf8" }).trim() === "true";
    if (isShallow) {
      execSync("git fetch --unshallow https://github.com/mrcastrotms/math-mayan-app.git develop", { stdio: "ignore" });
    }
  } catch (_) {}

  // 2. Count commits from local git history
  try {
    const countStr = execSync("git rev-list --count HEAD", { encoding: "utf8" }).trim();
    commitCount = parseInt(countStr, 10) || 0;
  } catch (_) {}

  // 3. Fallback for Vercel shallow clones (<= 15): Query GitHub's API Link header for the real total
  if (commitCount <= 15) {
    try {
      const headers = execSync(
        'curl -sI -H "User-Agent: node-build" "https://api.github.com/repos/mrcastrotms/math-mayan-app/commits?per_page=1"',
        { encoding: "utf8" }
      );
      const match = headers.match(/[?&]page=(\d+)[^>]*>;\s*rel="last"/);
      if (match && match[1]) {
        commitCount = parseInt(match[1], 10);
      }
    } catch (_) {}
  }

  // 4. Calculate major version shifts from 3000+ LOC commits
  try {
    const logStats = execSync('git log -n 100 --shortstat --oneline', { encoding: "utf8" });
    const lines = logStats.split("\n");
    for (const line of lines) {
      const ins = parseInt((line.match(/(\d+)\s+insertion/) || [])[1] || "0", 10);
      const del = parseInt((line.match(/(\d+)\s+deletion/) || [])[1] || "0", 10);
      if (ins + del >= 3000) {
        majorBumps++;
      }
    }
  } catch (_) {}

  const major = baseMajor + majorBumps;
  const minor = baseMinor;
  const patch = commitCount > 0 ? commitCount : (parts[2] || 0);

  return `v${major}.${minor}.${patch}`;
}

const appVersion = getDynamicVersion();

// Explicitly bind to process.env for Turbopack & Webpack replacement
process.env.NEXT_PUBLIC_APP_VERSION = appVersion;

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_VERCEL_ENV: process.env.VERCEL_ENV || "development",
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
    NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA || "",
    NEXT_PUBLIC_APP_VERSION: appVersion,
  },
};

export default nextConfig;
