import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: "Service-Worker-Allowed",
            value: "/"
          }
        ],
      },
    ]
  },
  webpack: (config, { isServer, dev }) => {
    if (!isServer && !dev) {
      config.optimization.splitChunks = false;
      config.output.chunkFilename = (pathData) => {
        return isServer
          ? '[name].js'
          : `static/chunks/${dev || ([
            "worker",
            "threadWorker",
            "serviceWorker"
          ].includes(pathData.chunk.name)) ? '[name]' : '[name].[contenthash]'
          }.js`
      };
    }
    return config;
  },
};

export default nextConfig;
