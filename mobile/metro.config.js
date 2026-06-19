const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");
const fs = require("fs");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "..");
const mobileModules = path.resolve(projectRoot, "node_modules");
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
};

let reactNativeResolveCount = 0;
const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    (moduleName === "react-native" || moduleName.startsWith("react-native/")) &&
    reactNativeResolveCount < 5
  ) {
    reactNativeResolveCount += 1;
    let forcedPath = null;
    try {
      forcedPath = require.resolve(moduleName, { paths: [mobileModules] });
    } catch {
      forcedPath = null;
    }
    // #region agent log
    debugLog("H1", "metro.config.js:resolveRequest", "react-native resolve attempt", {
      moduleName,
      platform,
      origin: context.originModulePath,
      forcedPath,
      forcedVersion: forcedPath
        ? require(path.join(path.dirname(forcedPath), "package.json")).version
        : null,
      count: reactNativeResolveCount,
    });
    // #endregion
    if (forcedPath) {
      return { type: "sourceFile", filePath: forcedPath };
    }
  }

  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

try {
  const rnPath = require.resolve("react-native/package.json", { paths: [projectRoot] });
  const metroPath = require.resolve("metro/package.json", { paths: [projectRoot] });
  // #region agent log
  debugLog("H4", "metro.config.js:init", "Metro config initialized", {
    projectRoot,
    reactNativePath: path.dirname(rnPath),
    reactNativeVersion: require(rnPath).version,
    metroVersion: require(metroPath).version,
    nodeModulesPaths: config.resolver.nodeModulesPaths,
    watchFolders: config.watchFolders,
  });
  // #endregion
} catch (e) {
  // #region agent log
  debugLog("H4", "metro.config.js:init", "Metro config init resolution failed", {
    error: e.message,
  });
  // #endregion
}

module.exports = config;
