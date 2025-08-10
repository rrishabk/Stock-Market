import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/Sidebar";
import HeaderBar from "@/components/HeaderBar";
import ChartPanel from "@/components/ChartPanel";
import RangeButtons from "@/components/RangeButtons";
import StatsPanel from "@/components/StatsPanel";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { PanelLeftOpen } from "lucide-react";
import { DATA_MODE, DEFAULT_TICKER } from "@/config";
import type { RangeOption } from "@/config";
import type { Company, OHLCV } from "@/utils/types";
import mockData from "@/data/mockData.json";
import csvAssetUrl from "@/data/stock_data.csv?url";
import { parseCsvFile, parseCsvText } from "@/utils/csv";
import { ApiService } from "@/services/ApiService";

const rangesDays: Record<RangeOption, number | null> = {
  "1D": 1,
  "1W": 7,
  "1M": 30,
  "6M": 182,
  "1Y": 365,
  "Max": null,
};

export default function Index() {
  const [mode, setMode] = useState<typeof DATA_MODE>(DATA_MODE);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selected, setSelected] = useState<string>();
  const [series, setSeries] = useState<Record<string, OHLCV[]>>({});
  const [range, setRange] = useState<RangeOption>('6M');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Load initial data by mode
  useEffect(() => {
    const run = async () => {
      setLoading(true); setError(null);
      try {
        if (mode === 'mock') {
          const comps: Company[] = mockData.companies;
          setCompanies(comps);
          setSeries(mockData.prices as Record<string, OHLCV[]>);
          setSelected((s) => s ?? DEFAULT_TICKER);
        } else if (mode === 'csv') {
          // Parse bundled CSV
          const res = await fetch(csvAssetUrl);
          const txt = await res.text();
          const rows = parseCsvText(txt);
          const csvCompany: Company = { ticker: 'CSV', name: 'Custom CSV Dataset', exchange: 'Local' };
          setCompanies([csvCompany]);
          setSeries({ CSV: rows });
          setSelected('CSV');
        } else if (mode === 'api') {
          const comps: Company[] = await ApiService.getCompanies();
          setCompanies(comps);
          const first = comps[0]?.ticker;
          if (first) {
            const payload = await ApiService.getStock(first, range);
            setSeries({ [first]: payload.data });
            setSelected(first);
          }
        }
      } catch (e: any) {
        setError(e.message ?? 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [mode]);

  const currentData = useMemo(() => {
    if (!selected) return [] as OHLCV[];
    const all = series[selected] ?? [];
    const days = rangesDays[range];
    if (!days) return all;
    return all.slice(-days);
  }, [series, selected, range]);

  const selectedCompany = useMemo(() => companies.find(c => c.ticker === selected), [companies, selected]);

  const handleUploadCsv = async (file: File) => {
    try {
      setMode('csv');
      setLoading(true);
      const rows = await parseCsvFile(file);
      setCompanies([{ ticker: 'CSV', name: file.name, exchange: 'Local' }]);
      setSeries({ CSV: rows });
      setSelected('CSV');
      setError(null);
    } catch (e: any) {
      setError(e.message ?? 'Failed to parse CSV');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen container py-6">
      {/* Mobile sidebar toggle */}
      <div className="md:hidden mb-4">
        <Button
          variant="secondary"
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-sidebar"
        >
          <PanelLeftOpen className="h-4 w-4 mr-2" /> Companies
        </Button>
      </div>

      {mobileOpen && (
        <div id="mobile-sidebar" className="md:hidden mb-4">
          <Sidebar
            companies={companies}
            selected={selected}
            onSelect={setSelected}
            onUploadCsv={handleUploadCsv}
            mode={mode}
            onModeChange={setMode}
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-[280px,1fr] gap-6">
        {/* Sidebar (desktop) */}
        <div className="hidden md:block">
          <Sidebar
            companies={companies}
            selected={selected}
            onSelect={setSelected}
            onUploadCsv={handleUploadCsv}
            mode={mode}
            onModeChange={setMode}
          />
        </div>

        {/* Main */}
        <div>
          <HeaderBar company={selectedCompany} data={currentData} />
          <Separator className="my-4" />

          {loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState title="Data error" message={error} />
          ) : (
            <div className="space-y-6">
              <Card className="p-4 flex items-center justify-between flex-wrap gap-2">
                <RangeButtons active={range} onChange={setRange} />
              </Card>

              <ChartPanel data={currentData} />

              <StatsPanel company={selectedCompany} data={currentData} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
