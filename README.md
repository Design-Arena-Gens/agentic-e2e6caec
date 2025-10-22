# Data Testing Platform

- Next.js app with API to backtest a simple 15m intraday SMA crossover filtered by daily trend using Yahoo Finance data.
- Python script `scripts/backtest.py` provides a CLI equivalent using `yfinance`.

## Dev

```bash
pnpm i # or npm i / yarn
yarn dev
```

## Run Python backtest

```bash
python3 scripts/backtest.py --symbol AAPL --from 2024-01-01 --to 2024-12-31
```
