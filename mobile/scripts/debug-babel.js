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

const result = babel.transformSync(source, {
  filename: ctxFile,
  presets: ["babel-preset-expo"],
  caller: {
    name: "metro",
    bundler: "metro",
    platform: "android",
    isDev: false,
    isNodeModule: true,
    projectRoot,
    routerRoot: "app",
  },
});

const code = result?.code ?? "";
debugLog("H2", "debug-babel.js:transform", "babel-preset-expo transform of _ctx.android.js", {
  hasEnvVarAfter: code.includes("process.env.EXPO_ROUTER_APP_ROOT"),
  hasRequireContext: code.includes("require.context"),
  snippet: code.slice(0, 220),
  babelPresetVersion: require(
    path.join(monorepoRoot, "node_modules/babel-preset-expo/package.json")
  ).version,
});

console.log("babel debug written");
