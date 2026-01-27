// pages/api/bypass.ts
import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    // 檢查網址參數是否正確 (例如: /api/bypass?secret=1234)
    if (req.query.secret === '1234') {
        // 設定 Cookie
        res.setHeader('Set-Cookie', 'bypass_mode=true; Path=/; HttpOnly');
        res.redirect('/'); // 導回首頁
    } else {
        res.status(401).json({ message: 'Invalid secret' });
    }
}