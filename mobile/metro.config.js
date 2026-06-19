const { getDefaultConfig } = require("expo/metro-config");
const fs = require("fs");
const path = require("path");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "..");
const mobileModules = path.resolve(projectRoot, "node_modules");
const debugLogPath = path.resolve(monorepoRoot, "debug-5abf2e.log");

function debugLog(hypothesisId, location, message, data) {
  const line =
    JSON.stringify({
      sessionId: "5abf2e",
      runId: "pre-fix",
      hypothesisId,
      location,
      message,
      data,
      timestamp: Date.now(),
    }) + "\n";
  // #region agent log
  try {
    fs.appendFileSync(debugLogPath, line);
  } catch {
    // ignore
  }
  // #endregion
}

const config = getDefaultConfig(projectRoot);

config.watchFolders = [
  ...(config.watchFolders ?? []),
  path.resolve(monorepoRoot, "packages/theme"),
  path.resolve(monorepoRoot, "packages/shared"),
];

config.resolver.nodeModulesPaths = [
  mobileModules,
  path.resolve(monorepoRoot, "node_modules"),
];

config.resolver.extraNodeModules = {
  "@finmora/theme": path.resolve(monorepoRoot, "packages/theme"),
  "@finmora/shared": path.resolve(monorepoRoot, "packages/shared"),
  react: path.resolve(mobileModules, "react"),
  "react/jsx-runtime": path.resolve(mobileModules, "react/jsx-runtime"),
  "react/jsx-dev-runtime": path.resolve(mobileModules, "react/jsx-dev-runtime"),
};

const mobileFirstPrefixes = [
  "react",
  "react-native",
  "react-native-screens",
  "react-native-safe-area-context",
  "expo-router",
  "@react-navigation",
];

debugLog("H1", "metro.config.js:init", "Metro resolver pinned to mobile react", {
  mobileReact: path.resolve(mobileModules, "react"),
  mobileReactVersion: (() => {
    try {
      return require(path.join(mobileModules, "react/package.json")).version;
    } catch {
      return null;
    }
  })(),
  rootReactVersion: (() => {
    try {
      return require(path.join(monorepoRoot, "node_modules/react/package.json")).version;
    } catch {
      return null;
    }
  })(),
});

const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const preferMobile = mobileFirstPrefixes.some(
    (pkg) => moduleName === pkg || moduleName.startsWith(`${pkg}/`)
  );

  if (preferMobile) {
    try {
      const forcedPath = require.resolve(moduleName, { paths: [mobileModules] });
      if (moduleName === "react" || moduleName.startsWith("react/")) {
        debugLog("H1", "metro.config.js:resolve", "Forced react resolution", {
          moduleName,
          forcedPath,
        });
      }
      return { type: "sourceFile", filePath: forcedPath };
    } catch {
      // fall through
    }
  }

  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
