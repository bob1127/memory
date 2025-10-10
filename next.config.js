// next.config.js
const path = require("path");

/** @type {import('next').NextConfig} */
module.exports = {
  images: {
    // ✅ 暫時關閉 Next/Image 最佳化 → 允許任何外部圖片網域
    unoptimized: true,

    // （保留你原本的 allowlist；unoptimized=true 時不會用到，但留著以後好恢復）
    remotePatterns: [
      { protocol: "https", hostname: "inf.fjg.mybluehost.me", pathname: "/**" },
      { protocol: "https", hostname: "i0.wp.com", pathname: "/**" },
      { protocol: "https", hostname: "image.memorycorner8.com", pathname: "/**" },
      // 之後要恢復最佳化時，遇到新網域再加這裡即可
    ],

    formats: ["image/avif", "image/webp"], // unoptimized=true 時可有可無
  },

  trailingSlash: true,

  webpackDevMiddleware: (config) => {
    config.watchOptions = { poll: 1000, aggregateTimeout: 300 };
    return config;
  },

  sassOptions: {
    includePaths: [path.join(__dirname, "styles")],
  },

  webpack(config) {
    config.module.rules.push({
      test: /\.(glsl|vs|fs)$/,
      use: ["babel-loader", "babel-plugin-glsl"],
    });
    return config;
  },
};
