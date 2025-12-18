import type { NextConfig } from "next";
import CopyPlugin from "copy-webpack-plugin";

const nextConfig: NextConfig = {
  headers: async () => {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp",
          },
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
        ],
      },
    ];
  },
  webpack: (config, { isServer, dev }) => {
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      fs: false,
      child_process: false,
      net: false,
      tls: false,
      cluster: false,
      console: false,
      dgram: false,
      dns: false,
      http2: false,
      http: false,
      https: false,
      os: false,
      path: false,
      stream: false,
      zlib: false,
      crypto: false,
      vm: false,
      constants: false,
      assert: false,
      buffer: false,
      util: false,
      url: false,
      querystring: false,
      string_decoder: false,
      events: false,
      punycode: false,
      module: false,
      readline: false,
      repl: false,
      domain: false,
      sys: false,
      timers: false,
      tty: false,
      worker_threads: false,
    };

    if (!isServer) {
      config.plugins.push(
        new CopyPlugin({
          patterns: [
            {
              from: require.resolve("@utoo/web/esm/loaderWorker.js"),
              to: "loaderWorker.js",
            },
          ],
        })
      );
    }

    if (!isServer && !dev) {
      config.optimization.splitChunks = false;
      config.output.chunkFilename = (pathData) => {
        return isServer
          ? "[name].js"
          : `static/chunks/${
              dev || ["worker", "threadWorker", "serviceWorker"].includes(pathData.chunk.name)
                ? "[name]"
                : "[name].[contenthash]"
            }.js`;
      };
    }
    return config;
  },
};

export default nextConfig;
