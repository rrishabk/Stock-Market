import { Button } from "@/components/ui/button";
import { RANGE_OPTIONS } from "@/config";
import type { RangeOption } from "@/config";

interface Props {
  active: RangeOption;
  onChange: (range: RangeOption) => void;
}

export default function RangeButtons({ active, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Select time range">
      {RANGE_OPTIONS.map((r) => (
        <Button
          key={r}
          variant={r === active ? "default" : "secondary"}
          size="sm"
          aria-pressed={r === active}
          aria-label={`Show ${r} range`}
          onClick={() => onChange(r)}
        >
          {r}
        </Button>
      ))}
    </div>
  );
}
