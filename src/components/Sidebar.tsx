import { Company } from "@/utils/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useEffect, useMemo, useRef, useState } from "react";
import { Upload, Database, FileUp } from "lucide-react";

interface Props {
  companies: Company[];
  selected: string | undefined;
  onSelect: (ticker: string) => void;
  onUploadCsv: (file: File) => void;
  mode: 'mock' | 'csv' | 'api';
  onModeChange: (m: 'mock' | 'csv' | 'api') => void;
}

export default function Sidebar({ companies, selected, onSelect, onUploadCsv, mode, onModeChange }: Props) {
  const [query, setQuery] = useState("");
  const listRef = useRef<HTMLUListElement>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return companies.filter(c => c.ticker.toLowerCase().includes(q) || c.name.toLowerCase().includes(q));
  }, [companies, query]);

  useEffect(() => {
    // Keyboard nav: ArrowUp/Down to move selection
    const handler = (e: KeyboardEvent) => {
      if (!listRef.current) return;
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      e.preventDefault();
      const items = Array.from(listRef.current.querySelectorAll<HTMLButtonElement>('button[data-ticker]'));
      const idx = items.findIndex((el) => el.dataset.ticker === selected);
      const nextIdx = e.key === 'ArrowDown' ? Math.min(items.length - 1, idx + 1) : Math.max(0, idx - 1);
      items[nextIdx]?.focus();
      const t = items[nextIdx]?.dataset.ticker;
      if (t) onSelect(t);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selected, onSelect]);

  return (
    <aside className="space-y-4" aria-label="Company list and CSV uploader">
      <Card className="p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4" />
          <span className="text-sm font-medium">Data Mode</span>
        </div>
        <div className="flex gap-2">
          <Button variant={mode==='mock'? 'default':'secondary'} size="sm" onClick={() => onModeChange('mock')} aria-pressed={mode==='mock'}>Mock</Button>
          <Button variant={mode==='csv'? 'default':'secondary'} size="sm" onClick={() => onModeChange('csv')} aria-pressed={mode==='csv'}>CSV</Button>
          <Button variant={mode==='api'? 'default':'secondary'} size="sm" onClick={() => onModeChange('api')} aria-pressed={mode==='api'}>API</Button>
        </div>
      </Card>

      <Card className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          <span className="text-sm font-medium">Upload CSV</span>
        </div>
        <p className="text-sm text-muted-foreground">Columns: Date, Close/Last, Volume, Open, High, Low</p>
        <label className="inline-flex items-center gap-2" aria-label="Upload CSV file">
          <Input type="file" accept=".csv" onChange={(e) => { const f = e.target.files?.[0]; if (f) onUploadCsv(f); }} />
          <FileUp className="h-4 w-4" />
        </label>
      </Card>

      <div className="space-y-2">
        <Input placeholder="Search companies" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search companies" />
        <ul ref={listRef} className="max-h-[50vh] overflow-auto pr-2" role="listbox" aria-label="Companies">
          {filtered.map((c) => (
            <li key={c.ticker}>
              <Button
                variant={selected===c.ticker? 'default':'ghost'}
                className="w-full justify-start"
                data-ticker={c.ticker}
                role="option"
                aria-selected={selected===c.ticker}
                onClick={() => onSelect(c.ticker)}
              >
                <span className="font-medium mr-2">{c.ticker}</span>
                <span className="text-muted-foreground truncate">{c.name}</span>
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
