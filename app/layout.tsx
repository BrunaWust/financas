import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wust Finanças',
  description: 'Controle financeiro pessoal',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
        <style>{`
          * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
          body { margin: 0; padding: 0; }
          button { font-family: inherit; }
          input, select { font-family: inherit; }
          ::-webkit-scrollbar { width: 4px; height: 4px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 99px; }
        `}</style>
      </head>
      <body style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif", background: '#FAFAFA', color: '#0F172A' }}>
        {children}
      </body>
    </html>
  );
}
