import type { Company, OHLCV } from "@/utils/types";

interface Props {
  company?: Company;
  data: OHLCV[];
}

export default function HeaderBar({ company, data }: Props) {
  const last = data[data.length - 1];
  const prev = data[data.length - 2];
  const change = last && prev ? last.close - prev.close : 0;
  const changePct = last && prev ? (change / prev.close) * 100 : 0;

  return (
    <header className="px-2 py-4">
      <h1 className="text-2xl font-bold tracking-tight">Stock Market Dashboard</h1>
      {company && last && (
        <div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
          <div className="font-semibold">{company.name} <span className="text-muted-foreground">({company.ticker} · {company.exchange})</span></div>
          <div className="font-semibold">${last.close.toFixed(2)}</div>
          <div className={change >= 0 ? "text-success" : "text-destructive"}>
            {change >= 0 ? "+" : ""}{change.toFixed(2)} ({changePct.toFixed(2)}%)
          </div>
        </div>
      )}
    </header>
  );
}
