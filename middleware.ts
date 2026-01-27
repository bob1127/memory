// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl

    // 1. 設定「白名單」：這些路徑不需要密碼也能看
    // 包含：維護頁面本身、API、靜態資源(圖片、字型等)
    if (
        pathname.startsWith('/maintenance') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/_next') ||
        pathname.startsWith('/static') ||
        pathname.includes('.') // 讓有副檔名的檔案(如 .png, .jpg)通過
    ) {
        return NextResponse.next()
    }

    // 2. 檢查是否有「通關密語」Cookie
    // 假設你設定只有 cookie 裡有 bypass=true 的人可以看
    const bypassCookie = req.cookies.get('bypass_mode')

    if (bypassCookie?.value === 'true') {
        return NextResponse.next() // 放行
    }

    // 3. 沒有通關證，強制「重寫 (Rewrite)」到維護頁面
    // 使用 rewrite 而不是 redirect，這樣網址列不會變，SEO 爬蟲也會被擋在門外
    const url = req.nextUrl.clone()
    url.pathname = '/maintenance'
    return NextResponse.rewrite(url)
}

// 設定 Middleware 作用範圍 (全站)
export const config = {
    matcher: '/:path*',
}