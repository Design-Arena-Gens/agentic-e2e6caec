export type BacktestParams = {
  symbol: string;
  from: string; // YYYY-MM-DD
  to: string;   // YYYY-MM-DD
  riskPerTrade: number; // 0..1
  strategy: 'sma-crossover';
};

export type Bar = {
  time: string; // ISO
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type Trade = {
  entryTime: string;
  exitTime?: string;
  side: 'long' | 'flat';
  entryPrice: number;
  exitPrice?: number;
  pnlPct: number;
};

export type Metrics = {
  totalReturnPct: number; // 0..1
  cagrPct: number; // 0..1
  winRatePct: number; // 0..1
  maxDrawdownPct: number; // 0..1
};

export type BacktestResult = {
  symbol: string;
  params: BacktestParams;
  trades: Trade[];
  metrics: Metrics;
};
