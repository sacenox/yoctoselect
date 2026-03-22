# yoctoselect

A minimal TypeScript library providing a single `select()` function for interactive list selection in the terminal. Prefix-match filtering, keyboard navigation, inline rendering (append-only), 16 ANSI colors via yoctocolors.

## API

```ts
import { select } from "yoctoselect";

type SelectItem = string | {
  label: string;       // displayed text (can include ANSI colors)
  value: string;       // returned on selection
  filterText?: string; // prefix-matched against search query (defaults to label, must be plain text if label has ANSI)
};

const picked = await select({
  items: SelectItem[],
  placeholder?: string,    // shown in search input when empty, default "type to filter..."
  maxVisible?: number,     // default 20
});
// Returns: string (the value) or null (ESC/no selection)
```

## Visual Behavior

```
  search: son
  › claude-sonnet-4              ← highlighted (cyan), moved with ↑/↓
    claude-sonnet-4-6
    2 more
```

- **Search line**: `search: ` prompt + typed text + cursor
- **Items**: prefix-matched against typed text, listed below search. Highlighted item has `›` prefix and cyan coloring. Others are indented with spaces.
- **Overflow**: when filtered results exceed `maxVisible`, show dim `N more` at the bottom
- **No matches**: dim `no matches` line
- **Cancel**: ESC clears all rendered lines (search + items) and returns `null`
- **Select**: Enter on highlighted item clears all rendered lines and returns the value
- **Navigation**: ↑/↓ move highlight, wraps around. Home/End jump to first/last.
- **Typing**: filters the list, resets highlight to first match

## Rendering Strategy

On each keystroke: move cursor up to the search line, clear from there down, re-render search + filtered items. On exit (select or cancel), clear all lines and leave no artifacts. This is a localized redraw of just the widget area — not a full-screen alternate buffer.

## Tech Stack

- Bun.js runtime + bundler
- TypeScript
- yoctocolors for terminal colors
- Zero other dependencies
- biome, prettier, lefthook, knip, jscpd

## Package Structure

```
src/
  index.ts          — public API (re-exports select)
  select.ts         — select() implementation: event handling, render, filter
  input.ts          — stdin buffer parsing: tokenizes raw bytes into InputEvents
  filter.ts         — prefix match logic
  viewport.ts       — scroll offset and highlight movement (pure functions)
  ansi.ts           — ANSI escape helpers (cursor movement, clear lines)
tests/
  filter.test.ts    — test prefix matching
package.json
tsconfig.json
biome.json
README.md
AGENTS.md
```

## Testing

- `filter.ts`: prefix matching with string items, `{label, value}` items, and `{label, value, filterText}` items. Case insensitivity. Empty query returns all. filterText takes precedence over label for matching.
- Do NOT test rendering or stdin — that's integration with the terminal
- Tests live next to code they test (`foo.test.ts` beside `foo.ts`)

## Conventions

- Conventional Commits for commit messages
- DRY, KISS, YAGNI — no unnecessary complexity
- No mocks or stubs in tests
- Use 16 ANSI colors only (inherited from terminal theme)
- Performance first
- Use `bun` for everything: runtime, test runner, package manager, and `bunx` instead of `npx`
