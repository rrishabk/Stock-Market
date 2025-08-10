import { Card } from "@/components/ui/card";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler, Title } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import { Line } from 'react-chartjs-2';
import type { OHLCV } from "@/utils/types";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler, Title, zoomPlugin);

interface Props {
  data: OHLCV[];
}

export default function ChartPanel({ data }: Props) {
  if (!data.length) return null;
  const labels = data.map((d) => d.date);
  const closeData = data.map((d) => d.close);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        intersect: false,
        mode: 'index' as const,
        callbacks: {
          label: (ctx: any) => {
            const i = ctx.dataIndex;
            const row = data[i];
            return ` Close: ${row.close.toFixed(2)}  O:${row.open.toFixed(2)} H:${row.high.toFixed(2)} L:${row.low.toFixed(2)} V:${row.volume.toLocaleString()}`;
          }
        }
      },
      zoom: {
        zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: 'x' as const },
        pan: { enabled: true, mode: 'x' as const }
      }
    },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: false }
    }
  } as const;

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Close',
        data: closeData,
        fill: true,
        borderColor: 'hsl(var(--primary))',
        backgroundColor: 'hsl(var(--primary) / 0.15)',
        tension: 0.25,
        pointRadius: 0,
        borderWidth: 2,
      }
    ]
  };

  return (
    <Card className="h-[360px] p-4">
      <div className="h-full" role="img" aria-label="Stock price chart">
        <Line options={options} data={chartData} />
      </div>
    </Card>
  );
}
