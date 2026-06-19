const fs = require("fs");
const path = require("path");

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

function safeResolve(name, paths) {
  try {
    return { ok: true, path: require.resolve(name, { paths }) };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

function pkgVersion(resolvedPath) {
  try {
    const pkgJson = path.join(path.dirname(resolvedPath), "package.json");
    return require(pkgJson).version;
  } catch {
    return null;
  }
}

const mobileModules = path.resolve(projectRoot, "node_modules");
const rootModules = path.resolve(monorepoRoot, "node_modules");

const checks = {
  reactNativeFromMobile: safeResolve("react-native/package.json", [mobileModules]),
  reactNativeFromRoot: safeResolve("react-native/package.json", [rootModules]),
  reactNativeDefault: safeResolve("react-native/package.json", [projectRoot]),
  metroFromMobile: safeResolve("metro/package.json", [mobileModules]),
  metroFromRoot: safeResolve("metro/package.json", [rootModules]),
  expoRouterCtx: safeResolve("expo-router/_ctx.android.js", [mobileModules, rootModules]),
  babelPresetExpo: safeResolve("babel-preset-expo/package.json", [rootModules, mobileModules]),
  expoMetroConfig: safeResolve("@expo/metro-config/package.json", [rootModules, mobileModules]),
};

debugLog("H1", "debug-deps.js:resolve", "react-native resolution paths", {
  mobile: checks.reactNativeFromMobile,
  root: checks.reactNativeFromRoot,
  default: checks.reactNativeDefault,
  mobileVersion: checks.reactNativeFromMobile.ok
    ? pkgVersion(checks.reactNativeFromMobile.path)
    : null,
  rootVersion: checks.reactNativeFromRoot.ok ? pkgVersion(checks.reactNativeFromRoot.path) : null,
  defaultVersion: checks.reactNativeDefault.ok ? pkgVersion(checks.reactNativeDefault.path) : null,
});

debugLog("H3", "debug-deps.js:resolve", "metro resolution paths", {
  mobile: checks.metroFromMobile,
  root: checks.metroFromRoot,
  mobileVersion: checks.metroFromMobile.ok ? pkgVersion(checks.metroFromMobile.path) : null,
  rootVersion: checks.metroFromRoot.ok ? pkgVersion(checks.metroFromRoot.path) : null,
});

debugLog("H2", "debug-deps.js:resolve", "expo-router ctx + babel toolchain", {
  expoRouterCtx: checks.expoRouterCtx,
  babelPresetExpo: checks.babelPresetExpo,
  expoMetroConfig: checks.expoMetroConfig,
  appDirExists: fs.existsSync(path.join(projectRoot, "app")),
  projectRoot,
  monorepoRoot,
});

debugLog("H4", "debug-deps.js:expo-config", "getDefaultConfig reactNativePath simulation", {
  simulatedPath: safeResolve("react-native/package.json", [projectRoot]),
  simulatedVersion: (() => {
    const r = safeResolve("react-native/package.json", [projectRoot]);
    return r.ok ? pkgVersion(r.path) : null;
  })(),
});

console.log("Debug dependency snapshot written to debug-591c3c.log");
