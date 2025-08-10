import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Company, OHLCV } from "@/utils/types";

interface Props {
  company?: Company;
  data: OHLCV[];
}

export default function StatsPanel({ company, data }: Props) {
  if (!data.length) return null;
  const last = data[data.length - 1];
  const prev = data[data.length - 2] ?? last;
  const change = last.close - prev.close;
  const changePct = (change / prev.close) * 100;

  const lookback = data.slice(-252);
  const high52 = Math.max(...lookback.map((d) => d.high));
  const low52 = Math.min(...lookback.map((d) => d.low));

  return (
    <div className="grid md:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Last Price</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold">${last.close.toFixed(2)}</div>
          <div className={change >= 0 ? "text-success" : "text-destructive"}>
            {change >= 0 ? "+" : ""}{change.toFixed(2)} ({changePct.toFixed(2)}%)
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Volume</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold">{last.volume.toLocaleString()}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>52W High/Low</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold">${high52.toFixed(2)} / ${low52.toFixed(2)}</div>
        </CardContent>
      </Card>
    </div>
  );
}
