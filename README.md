# yoctoselect

Minimal interactive select prompt for the terminal. Prefix-match filtering, keyboard navigation, inline rendering. Zero bloat.

## Install

```sh
bun add yoctoselect
```

## Usage

```ts
import { select } from "yoctoselect";

const picked = await select({
  items: ["apple", "banana", "cherry"],
});
console.log(picked); // "banana" or null if cancelled
```

### Rich items

```ts
import * as c from "yoctocolors";

const model = await select({
  items: [
    {
      label: `claude-sonnet-4  ${c.green("free")}  ${c.dim("200k")}`,
      value: "anthropic/claude-sonnet-4",
      filterText: "claude-sonnet-4",
    },
    {
      label: `gpt-4o  ${c.dim("128k")}`,
      value: "openai/gpt-4o",
      filterText: "gpt-4o",
    },
  ],
  placeholder: "search models...",
});
```

## API

### `select(options): Promise<string | null>`

| Option        | Type           | Default               | Description                |
| ------------- | -------------- | --------------------- | -------------------------- |
| `items`       | `SelectItem[]` | required              | Items to select from       |
| `placeholder` | `string`       | `"type to filter..."` | Shown when search is empty |
| `maxVisible`  | `number`       | `20`                  | Max items shown at once    |

### `SelectItem`

```ts
type SelectItem =
  | string
  | {
      label: string; // displayed text (can include ANSI colors)
      value: string; // returned on selection
      filterText?: string; // matched against search (defaults to label)
    };
```

### Keyboard

| Key            | Action                        |
| -------------- | ----------------------------- |
| Type           | Filter items by prefix        |
| `↑` / `↓`      | Move highlight (wraps around) |
| `Enter`        | Select highlighted item       |
| `Escape`       | Cancel, return `null`         |
| `Home` / `End` | Jump to first/last            |
| `Backspace`    | Delete last character         |

## License

MIT
