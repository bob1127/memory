// next.config.js
const path = require("path");

module.exports = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**", pathname: "/**" },
      { protocol: "http",  hostname: "**", pathname: "/**" },
    ],
  },
  trailingSlash: true,
  webpackDevMiddleware: (config) => {
    config.watchOptions = { poll: 1000, aggregateTimeout: 300 };
    return config;
  },
  sassOptions: { includePaths: [path.join(__dirname, "styles")] },
  webpack(config) {
    config.module.rules.push({
      test: /\.(glsl|vs|fs)$/,
      use: ["babel-loader", "babel-plugin-glsl"],
    });
    return config;
  },
};
