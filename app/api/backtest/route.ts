import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { fetchBars } from '../../../lib/yahoo';
import { backtestSma15mDaily } from '../../../lib/strategy';
import { computeMetrics } from '../../../lib/metrics';
import { BacktestParams } from '../../../types/backtest';

const ParamsSchema = z.object({
  symbol: z.string().min(1),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  riskPerTrade: z.number().min(0).max(1),
  strategy: z.literal('sma-crossover'),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const params = ParamsSchema.parse(json) as BacktestParams;

    const [bars15m, bars1d] = await Promise.all([
      fetchBars(params.symbol, params.from, params.to, '15m'),
      fetchBars(params.symbol, params.from, params.to, '1d'),
    ]);

    if (bars15m.length < 100 || bars1d.length < 60) {
      return NextResponse.json({ error: 'Not enough data' }, { status: 400 });
    }

    const { trades } = backtestSma15mDaily(bars15m, bars1d);
    const metrics = computeMetrics(trades, bars15m[0].time, bars15m[bars15m.length - 1].time);

    return NextResponse.json({ symbol: params.symbol, params, trades, metrics });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'Unknown error' }, { status: 400 });
  }
}
