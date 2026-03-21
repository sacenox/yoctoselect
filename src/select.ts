import * as c from "yoctocolors";
import { clearDown, cursorUp, hideCursor, showCursor, write } from "./ansi.ts";
import { type NormalizedItem, normalizeItems, prefixFilter } from "./filter.ts";
import type { SelectOptions } from "./types.ts";

const DEFAULT_MAX_VISIBLE = 20;
const DEFAULT_PLACEHOLDER = "type to filter...";

export async function select(opts: SelectOptions): Promise<string | null> {
  const allItems = normalizeItems(opts.items);
  const maxVisible = opts.maxVisible ?? DEFAULT_MAX_VISIBLE;
  const placeholder = opts.placeholder ?? DEFAULT_PLACEHOLDER;

  let query = "";
  let highlightIndex = 0;
  let renderedLines = 0;

  function getFiltered(): NormalizedItem[] {
    return prefixFilter(allItems, query);
  }

  function render(): void {
    // Move up and clear previous render
    if (renderedLines > 0) {
      write(cursorUp(renderedLines) + clearDown());
    }

    const filtered = getFiltered();
    const visible = filtered.slice(0, maxVisible);
    const overflow = filtered.length - visible.length;

    // Search line
    const searchText = query || c.dim(placeholder);
    write(`  ${c.dim("search:")} ${searchText}\n`);

    // Items
    if (filtered.length === 0) {
      write(`  ${c.dim("no matches")}\n`);
      renderedLines = 2;
      return;
    }

    for (let i = 0; i < visible.length; i++) {
      const item = visible[i];
      if (!item) continue;
      if (i === highlightIndex) {
        write(`  ${c.cyan("›")} ${c.cyan(item.label)}\n`);
      } else {
        write(`    ${item.label}\n`);
      }
    }

    if (overflow > 0) {
      write(`  ${c.dim(`${overflow} more`)}\n`);
    }

    renderedLines = 1 + visible.length + (overflow > 0 ? 1 : 0);
  }

  function clear(): void {
    if (renderedLines > 0) {
      write(cursorUp(renderedLines) + clearDown());
      renderedLines = 0;
    }
  }

  function clampHighlight(filtered: NormalizedItem[]): void {
    const max = Math.min(filtered.length, maxVisible) - 1;
    if (highlightIndex > max) highlightIndex = Math.max(0, max);
  }

  return new Promise<string | null>((resolve) => {
    const stdin = process.stdin;
    const wasRaw = stdin.isRaw;

    stdin.setRawMode(true);
    stdin.resume();
    write(hideCursor());
    render();

    function cleanup(result: string | null): void {
      stdin.removeListener("data", onData);
      stdin.setRawMode(wasRaw);
      stdin.pause();
      clear();
      write(showCursor());
      resolve(result);
    }

    function onData(buf: Buffer): void {
      const key = buf.toString();

      // ESC (but not escape sequence)
      if (key === "\x1b") {
        cleanup(null);
        return;
      }

      // Enter
      if (key === "\r" || key === "\n") {
        const filtered = getFiltered();
        const visible = filtered.slice(0, maxVisible);
        const selected = visible[highlightIndex];
        cleanup(selected?.value ?? null);
        return;
      }

      // Backspace
      if (key === "\x7f" || key === "\x08") {
        if (query.length > 0) {
          query = query.slice(0, -1);
          highlightIndex = 0;
        }
        render();
        return;
      }

      // Arrow up
      if (key === "\x1b[A") {
        const filtered = getFiltered();
        const max = Math.min(filtered.length, maxVisible);
        if (max > 0) {
          highlightIndex = highlightIndex <= 0 ? max - 1 : highlightIndex - 1;
        }
        render();
        return;
      }

      // Arrow down
      if (key === "\x1b[B") {
        const filtered = getFiltered();
        const max = Math.min(filtered.length, maxVisible);
        if (max > 0) {
          highlightIndex = highlightIndex >= max - 1 ? 0 : highlightIndex + 1;
        }
        render();
        return;
      }

      // Home
      if (key === "\x1b[H" || key === "\x1b[1~") {
        highlightIndex = 0;
        render();
        return;
      }

      // End
      if (key === "\x1b[F" || key === "\x1b[4~") {
        const filtered = getFiltered();
        const max = Math.min(filtered.length, maxVisible);
        highlightIndex = Math.max(0, max - 1);
        render();
        return;
      }

      // Printable characters
      if (key.length === 1 && key >= " ") {
        query += key;
        highlightIndex = 0;
        clampHighlight(getFiltered());
        render();
        return;
      }
    }

    stdin.on("data", onData);
  });
}
