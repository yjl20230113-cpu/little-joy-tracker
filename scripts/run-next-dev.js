const { spawn } = require("node:child_process");
const path = require("node:path");
const {
  normalizeWindowsWorkingDirectory,
} = require("../src/lib/dev-server-path.js");

function runNextDev() {
  const normalizedCwd = normalizeWindowsWorkingDirectory(process.cwd());

  if (normalizedCwd && normalizedCwd !== process.cwd()) {
    process.chdir(normalizedCwd);
  }

  const nextBin = path.join(process.cwd(), "node_modules", "next", "dist", "bin", "next");
  const args = [nextBin, "dev", ...process.argv.slice(2)];
  const child = spawn(process.execPath, args, {
    stdio: "inherit",
    cwd: process.cwd(),
    env: process.env,
  });

  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }

    process.exit(code ?? 0);
  });

  child.on("error", (error) => {
    console.error(error);
    process.exit(1);
  });
}

if (require.main === module) {
  runNextDev();
}

module.exports = {
  runNextDev,
};
