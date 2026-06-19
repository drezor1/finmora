const fs = require("fs");
const path = require("path");
const babel = require("@babel/core");

const projectRoot = path.resolve(__dirname, "..");
const monorepoRoot = path.resolve(projectRoot, "..");
const logPath = path.resolve(monorepoRoot, "debug-591c3c.log");

function debugLog(hypothesisId, location, message, data) {
  const line =
    JSON.stringify({
      sessionId: "591c3c",
      runId: "pre-fix",
      hypothesisId,
      location,
      message,
      data,
      timestamp: Date.now(),
    }) + "\n";
  // #region agent log
  fs.appendFileSync(logPath, line);
  // #endregion
}

const ctxFile = path.join(projectRoot, "node_modules/expo-router/_ctx.android.js");
const source = fs.readFileSync(ctxFile, "utf8");

function run(label, options) {
  const result = babel.transformSync(source, options);
  const code = result?.code ?? "";
  debugLog("H2", "debug-babel-plugins.js:transform", label, {
    hasEnvVarAfter: code.includes("process.env.EXPO_ROUTER_APP_ROOT"),
    snippet: code.slice(0, 260),
  });
}

run("preset-only", {
  filename: ctxFile,
  presets: ["babel-preset-expo"],
  caller: { name: "metro", bundler: "metro", platform: "android", projectRoot, routerRoot: "app" },
});

run("explicit-router-plugin", {
  filename: ctxFile,
  plugins: [require("babel-preset-expo/build/expo-router-plugin").expoRouterBabelPlugin],
  caller: { name: "metro", bundler: "metro", platform: "android", projectRoot, routerRoot: "app" },
});

run("preset-with-router-plugin", {
  filename: ctxFile,
  presets: ["babel-preset-expo"],
  plugins: [require("babel-preset-expo/build/expo-router-plugin").expoRouterBabelPlugin],
  caller: { name: "metro", bundler: "metro", platform: "android", projectRoot, routerRoot: "app", isNodeModule: true },
});

debugLog("H2", "debug-babel-plugins.js:hasModule", "expo-router module resolution", {
  hasModuleFromMobile: (() => {
    try {
      require.resolve("expo-router", { paths: [path.join(projectRoot, "node_modules")] });
      return true;
    } catch {
      return false;
    }
  })(),
  nodeEnv: process.env.NODE_ENV,
});

console.log("babel plugin debug written");
