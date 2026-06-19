import { execSync } from "node:child_process";

if (process.env.EAS_BUILD === "true") {
  console.log("Skipping prisma generate during EAS mobile build");
  process.exit(0);
}

execSync("prisma generate", { stdio: "inherit" });
