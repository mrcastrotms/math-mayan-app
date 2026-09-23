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

  try {
    // 1. Total commits count for decimal increments
    const countStr = execSync("git rev-list --count HEAD", { encoding: "utf8" }).trim();
    commitCount = parseInt(countStr, 10) || 0;
  } catch (_) {}

  try {
    // 2. Inspect git log shortstats for massive shifts (>= 3000 LOC insertions + deletions)
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

  // Whole number bumps on 3000+ LOC changes, decimals increment with commits
  const major = baseMajor + majorBumps;
  const minor = baseMinor;
  const patch = commitCount > 0 ? commitCount : parts[2] || 0;

  return `v${major}.${minor}.${patch}`;
}

const appVersion = getDynamicVersion();

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
