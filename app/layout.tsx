import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Data Testing Platform',
  description: 'Backtest strategy using 15m and daily Yahoo Finance data',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          <header className="mb-6">
            <h1 className="font-semibold" style={{ fontSize: '1.5rem' }}>Data Testing Platform</h1>
            <p className="text-muted">15m + Daily timeframe trading decisions</p>
          </header>
          {children}
          <footer className="mb-6 text-sm text-muted">Built for Yahoo Finance data backtesting</footer>
        </div>
      </body>
    </html>
  );
}
