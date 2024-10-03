import GameDbGeneratorPlugin from './game-db-generator.plugin.mjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: process.env.NEXT_PUBLIC_BASE_PATH,

  webpack: (
    config,
    { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }
  ) => {
    if (!isServer || !dev) config.plugins.push(new GameDbGeneratorPlugin());
    // Important: return the modified config
    return config
  }
};

export default nextConfig;
