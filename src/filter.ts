import type { SelectItem } from "./types.ts";

export interface NormalizedItem {
  label: string;
  value: string;
  filterText: string;
}

export function normalizeItems(items: SelectItem[]): NormalizedItem[] {
  return items.map((item) => {
    if (typeof item === "string") {
      return { label: item, value: item, filterText: item };
    }
    return {
      label: item.label,
      value: item.value,
      filterText: item.filterText ?? item.label,
    };
  });
}

export function prefixFilter(
  items: NormalizedItem[],
  query: string,
): NormalizedItem[] {
  if (!query) return items;
  const q = query.toLowerCase();
  return items.filter((item) => item.filterText.toLowerCase().startsWith(q));
}
