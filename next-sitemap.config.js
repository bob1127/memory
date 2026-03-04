/** @type {import('next-sitemap').IConfig} */
module.exports = {
  // 替換成你客戶的正式網址
  siteUrl: process.env.SITE_URL || 'https://www.memorycorner8.com',
  generateRobotsTxt: true, // 自動生成 robots.txt (強烈建議開啟)
  sitemapSize: 7000, // 當網址超過 7000 個會自動分割成多個 sitemap 檔案
  exclude: ['/server-sitemap.xml'], // 如果有不需要被 Google 收錄的隱藏頁面可以寫在這，例如 ['/admin/*', '/checkout']
  
  // (可選) 針對特定頁面設定不同的優先級 (Priority) 或更新頻率 (Changefreq)
  transform: async (config, path) => {
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: path === '/' ? 1.0 : config.priority, // 讓首頁優先級最高
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      alternateRefs: config.alternateRefs ?? [],
    }
  },
}