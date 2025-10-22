#!/usr/bin/env python3
import sys
import argparse
from datetime import datetime, timedelta

try:
    import yfinance as yf
    import pandas as pd
except Exception as e:
    print("Missing dependencies. Please install with: pip install yfinance pandas", file=sys.stderr)
    sys.exit(1)


def compute_sma(series: pd.Series, period: int) -> pd.Series:
    return series.rolling(window=period, min_periods=period).mean()


def backtest(symbol: str, start: str, end: str):
    df15 = yf.download(symbol, start=start, end=(datetime.fromisoformat(end) + timedelta(days=1)).date().isoformat(), interval='15m', auto_adjust=True, progress=False)
    df1d = yf.download(symbol, start=start, end=(datetime.fromisoformat(end) + timedelta(days=1)).date().isoformat(), interval='1d', auto_adjust=True, progress=False)

    if df15.empty or df1d.empty:
        print('No data returned')
        return 1

    df15 = df15.tz_localize(None)
    df1d = df1d.tz_localize(None)

    df1d['sma20'] = compute_sma(df1d['Close'], 20)
    df1d['sma50'] = compute_sma(df1d['Close'], 50)

    df15['fast'] = compute_sma(df15['Close'], 10)
    df15['slow'] = compute_sma(df15['Close'], 30)

    equity = 1.0
    in_pos = False
    entry_price = 0.0
    trades = []

    def in_uptrend(ts: pd.Timestamp) -> bool:
        daily = df1d[df1d.index <= ts.floor('D')]
        if daily.empty:
            return False
        row = daily.iloc[-1]
        return (row['sma20'] or float('nan')) > (row['sma50'] or float('nan'))

    for ts, row in df15.iterrows():
        if pd.isna(row['fast']) or pd.isna(row['slow']):
            continue
        uptrend = in_uptrend(ts)
        bullish = row['fast'] > row['slow']
        price = row['Close']
        if not in_pos and uptrend and bullish:
            in_pos = True
            entry_price = price
            trades.append({'entry': ts.isoformat(), 'side': 'long'})
        elif in_pos and (not uptrend or not bullish):
            pnl = (price - entry_price) / entry_price
            equity *= (1 + pnl)
            trades[-1].update({'exit': ts.isoformat(), 'pnlPct': pnl})
            in_pos = False

    total_return = equity - 1
    print({
        'symbol': symbol,
        'from': start,
        'to': end,
        'numTrades': len([t for t in trades if 'exit' in t]),
        'totalReturnPct': total_return,
    })
    return 0


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--symbol', default='AAPL')
    ap.add_argument('--from', dest='start', default='2024-01-01')
    ap.add_argument('--to', dest='end', default='2024-12-31')
    args = ap.parse_args()
    sys.exit(backtest(args.symbol, args.start, args.end))
