export type SelectItem =
  | string
  | {
      label: string;
      value: string;
      filterText?: string;
    };

export interface SelectOptions {
  items: SelectItem[];
  placeholder?: string;
  maxVisible?: number;
}
