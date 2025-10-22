"use client";
import { useMemo, useState } from 'react';
import { BacktestParams, BacktestResult } from '@/types/backtest';

export default function HomePage() {
  const [symbol, setSymbol] = useState('AAPL');
  const [fromDate, setFromDate] = useState<string>('2024-01-01');
  const [toDate, setToDate] = useState<string>('2024-12-31');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const payload: BacktestParams = useMemo(() => ({
    symbol,
    from: fromDate,
    to: toDate,
    riskPerTrade: 0.01,
    strategy: 'sma-crossover',
  }), [symbol, fromDate, toDate]);

  async function runBacktest() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/backtest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setResult(data as BacktestResult);
    } catch (e: any) {
      setError(e.message || 'Failed to run backtest');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="space-y-6">
      <section className="card">
        <h2 className="mb-4" style={{ fontWeight: 600 }}>Run Backtest</h2>
        <div className="grid grid-5">
          <label className="flex flex-col">
            <span className="text-sm text-muted">Symbol</span>
            <input value={symbol} onChange={e => setSymbol(e.target.value.toUpperCase())} className="input" placeholder="AAPL" />
          </label>
          <label className="flex flex-col">
            <span className="text-sm text-muted">From</span>
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="input" />
          </label>
          <label className="flex flex-col">
            <span className="text-sm text-muted">To</span>
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="input" />
          </label>
          <div className="flex items-end">
            <button onClick={runBacktest} disabled={loading} className="btn" style={{ width: '100%' }}>{loading ? 'Running...' : 'Run'}</button>
          </div>
        </div>
      </section>

      {error && <div className="p-3 rounded" style={{ background: '#fef2f2', color: '#b91c1c' }}>{error}</div>}

      {result && (
        <section className="card" style={{ display: 'grid', gap: '1rem' }}>
          <h3 className="font-semibold">Results</h3>
          <div className="grid grid-4 text-sm">
            <div className="p-3 rounded bg-muted"><div className="text-muted">Total Return</div><div className="font-semibold">{(result.metrics.totalReturnPct*100).toFixed(2)}%</div></div>
            <div className="p-3 rounded bg-muted"><div className="text-muted">CAGR</div><div className="font-semibold">{(result.metrics.cagrPct*100).toFixed(2)}%</div></div>
            <div className="p-3 rounded bg-muted"><div className="text-muted">Win Rate</div><div className="font-semibold">{(result.metrics.winRatePct*100).toFixed(1)}%</div></div>
            <div className="p-3 rounded bg-muted"><div className="text-muted">Max Drawdown</div><div className="font-semibold">{(result.metrics.maxDrawdownPct*100).toFixed(1)}%</div></div>
          </div>
          <div>
            <h4 className="font-medium mb-2">Trades</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-muted">
                    <th className="p-2">Entry</th>
                    <th className="p-2">Exit</th>
                    <th className="p-2">Side</th>
                    <th className="p-2">PnL %</th>
                  </tr>
                </thead>
                <tbody>
                  {result.trades.map((t, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="p-2">{t.entryTime}</td>
                      <td className="p-2">{t.exitTime || '-'}</td>
                      <td className="p-2">{t.side}</td>
                      <td className="p-2">{(t.pnlPct*100).toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
