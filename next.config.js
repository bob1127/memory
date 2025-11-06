// next.config.js
const path = require("path");

/** @type {import('next').NextConfig} */
module.exports = {
  images: {
    // 暫時關閉 Next/Image 最佳化，避免外網域設定不齊造成阻擋
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "inf.fjg.mybluehost.me", pathname: "/**" },
      { protocol: "https", hostname: "i0.wp.com", pathname: "/**" },
      { protocol: "https", hostname: "image.memorycorner8.com", pathname: "/**" },
    ],
    formats: ["image/avif", "image/webp"],
  },

  // ✅ 關閉尾斜線，避免 /api/.../ 404
  trailingSlash: false,

  // ❌ 移除新版不支援的 webpackDevMiddleware
  // webpackDevMiddleware: (config) => {
  //   config.watchOptions = { poll: 1000, aggregateTimeout: 300 };
  //   return config;
  // },

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
