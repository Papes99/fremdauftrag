const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
const upstream = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const name = moduleName.endsWith('.ts') ? moduleName.slice(0, -3) : moduleName;
  if (upstream) return upstream(context, name, platform);
  return context.resolveRequest(context, name, platform);
};

module.exports = config;
