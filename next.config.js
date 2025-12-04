// next.config.js
const path = require("path");

/** @type {import('next').NextConfig} */
module.exports = {
  // ✅ 新增：多語系設定 (Pages Router 專用)
  i18n: {
    // 支援的語言：英文、繁體中文
    locales: ["en", "zh-TW"],
    // 預設語言：繁體中文
    defaultLocale: "zh-TW",
    // 建議關閉自動偵測，避免 SEO 混淆或使用者體驗不一致
    localeDetection: false,
  },

  images: {
    // 暫時關閉 Next/Image 最佳化，避免外網域設定不齊造成阻擋
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "inf.fjg.mybluehost.me", pathname: "/**" },
      { protocol: "https", hostname: "i0.wp.com", pathname: "/**" },
      {
        protocol: "https",
        hostname: "image.memorycorner8.com",
        pathname: "/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },

  // ✅ 關閉尾斜線，避免 /api/.../ 404
  trailingSlash: false,

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