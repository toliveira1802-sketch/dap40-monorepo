import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

type SelectOption = { value: string; label: string };

/** Barra de filtros client-side — LOCAL ao módulo Comercial. */
export function FilterBar({
  search,
  onSearchChange,
  searchPlaceholder = "Buscar…",
  selectValue,
  onSelectChange,
  selectOptions,
  selectPlaceholder = "Filtrar",
  selectAllLabel = "Todos",
}: {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  selectValue?: string;
  onSelectChange?: (value: string) => void;
  selectOptions?: SelectOption[];
  selectPlaceholder?: string;
  selectAllLabel?: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="pl-8"
          aria-label={searchPlaceholder}
        />
      </div>
      {selectOptions && onSelectChange ? (
        <Select value={selectValue ?? "all"} onValueChange={onSelectChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={selectPlaceholder} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{selectAllLabel}</SelectItem>
            {selectOptions.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}
    </div>
  );
}
