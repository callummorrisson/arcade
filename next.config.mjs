import GameDbGeneratorPlugin from "./.build/game-db-generator.plugin.mjs";
import GameManifestTypescriptGeneratorPlugin from "./.build/game-manifest-typescript-generator.plugin.mjs";
import * as path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  /**
   * Enable static exports for the App Router.
   *
   * @see https://nextjs.org/docs/app/building-your-application/deploying/static-exports
   */
  output: "export",
  /**
   * Set base path. environment variable is set in .github/workflows/nextjs.yml
   *
   * @see https://nextjs.org/docs/app/api-reference/next-config-js/basePath
   */
  basePath: process.env.NEXT_PUBLIC_BASE_PATH,
  /**
   * Disable server-based image optimization. Next.js does not support
   * dynamic features with static exports.
   *
   * @see https://nextjs.org/docs/app/api-reference/components/image#unoptimized
   */
  images: {
    unoptimized: true,
  },

  webpack: (
    config,
    { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }
  ) => {
    // nextjs has 3 compilers, we only want to attach to the first one
    if (nextRuntime === "nodejs") {
      config.plugins.push(new GameDbGeneratorPlugin());
      config.plugins.push(new GameManifestTypescriptGeneratorPlugin());
    }

    // Important: return the modified config
    return config;
  },

sassOptions: {
    includePaths: [path.join(process.cwd(), "src", "styles")],
    additionalData: `
      @use "variables.scss" as *;
    `,
  },
};

export default nextConfig;
