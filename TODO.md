# yoctoselect — Implementation Plan

## Step 1: Project scaffolding

- [ ] Create package.json (name: yoctoselect, deps: yoctocolors, devDeps: biome, prettier, lefthook, knip, jscpd, @types/bun, typescript)
- [ ] Create tsconfig.json, biome.json, knip.json, .prettierrc, .gitignore, lefthook.yml
- [ ] `bun install`
- [ ] `lefthook install`
- [ ] Verify: `bun run check` passes (format, lint, typecheck, knip, jscpd)
- [ ] Initial commit

## Step 2: Core filter logic + tests

- [ ] Create `src/filter.ts` — `prefixFilter(items, query)` returns matched items, case-insensitive
  - Normalizes SelectItem to `{label, value, filterText}` internally
  - filterText defaults to label for plain strings / {label,value} items
  - Matches filterText with `startsWith` against lowercased query
- [ ] Create `src/filter.test.ts` — tests:
  - string items: prefix match, case insensitive, empty query returns all, no match returns empty
  - {label, value} items: matches against label
  - {label, value, filterText} items: matches against filterText, not label
- [ ] Verify: `bun test` passes
- [ ] Commit

## Step 3: ANSI helpers

- [ ] Create `src/ansi.ts` — cursor movement + line clearing helpers
  - `cursorUp(n)` — move cursor up n lines
  - `clearDown()` — clear from cursor to end of screen
  - `hideCursor()` / `showCursor()`
  - `write(s)` — write to stdout
- [ ] Commit

## Step 4: select() implementation

- [ ] Create `src/select.ts` — the main `select()` function
  - Takes `{items, placeholder?, maxVisible?}`
  - Sets stdin to raw mode, handles keystrokes
  - Render loop: search line + filtered items + overflow indicator
  - Keyboard: typing filters, ↑/↓ navigate, Enter selects, ESC cancels
  - On exit: clear rendered lines, restore stdin, return value or null
  - Home/End jump to first/last
  - Wrapping navigation (↑ from first → last, ↓ from last → first)
- [ ] Create `src/index.ts` — re-export `select` and `SelectItem` type
- [ ] Commit

## Step 5: Manual testing + polish

- [ ] Create `examples/demo.ts` for manual testing
- [ ] Test in terminal: filtering, navigation, selection, cancel, overflow, no matches
- [ ] Verify: `bun run check` passes
- [ ] Commit

## Step 6: README + initial push

- [ ] Write README.md with install, usage, API docs
- [ ] Final `bun run check` + `bun test`
- [ ] Push to origin
