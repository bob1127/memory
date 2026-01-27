// pages/maintenance.tsx
import Head from 'next/head';

export default function Maintenance() {
  return (
    <>
      <Head>
        <title>網站建置中</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5',
        color: '#333',
        fontFamily: 'sans-serif'
      }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🚧 網站建置中 🚧</h1>
        <p style={{ fontSize: '1.2rem' }}>我們正在進行網站優化，請稍後再回來。</p>
      </div>
    </>
  );
}