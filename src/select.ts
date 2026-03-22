import * as c from "yoctocolors";
import { clearDown, cursorUp, hideCursor, showCursor, write } from "./ansi.ts";
import { type NormalizedItem, normalizeItems, prefixFilter } from "./filter.ts";
import type { SelectOptions } from "./types.ts";
import { type InputEvent, parseInput } from "./input.ts";
import { adjustScroll, moveDown, moveUp } from "./viewport.ts";

const DEFAULT_MAX_VISIBLE = 20;
const DEFAULT_PLACEHOLDER = "type to filter...";

export async function select(opts: SelectOptions): Promise<string | null> {
  const allItems = normalizeItems(opts.items);
  const maxVisible = opts.maxVisible ?? DEFAULT_MAX_VISIBLE;
  const placeholder = opts.placeholder ?? DEFAULT_PLACEHOLDER;

  let query = "";
  let highlightIndex = 0;
  let scrollOffset = 0;
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
    const visible = filtered.slice(scrollOffset, scrollOffset + maxVisible);
    const overflow = filtered.length - scrollOffset - visible.length;

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
      const globalIndex = scrollOffset + i;
      if (globalIndex === highlightIndex) {
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

  function updateScroll(): void {
    scrollOffset = adjustScroll(highlightIndex, scrollOffset, maxVisible);
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

    function handleEvent(event: InputEvent): boolean {
      switch (event.type) {
        case "escape":
          cleanup(null);
          return true;

        case "enter": {
          const filtered = getFiltered();
          const selected = filtered[highlightIndex];
          cleanup(selected?.value ?? null);
          return true;
        }

        case "backspace":
          if (query.length > 0) {
            query = query.slice(0, -1);
            highlightIndex = 0;
            scrollOffset = 0;
          }
          return false;

        case "up": {
          const filtered = getFiltered();
          highlightIndex = moveUp(highlightIndex, filtered.length);
          updateScroll();
          return false;
        }

        case "down": {
          const filtered = getFiltered();
          highlightIndex = moveDown(highlightIndex, filtered.length);
          updateScroll();
          return false;
        }

        case "home":
          highlightIndex = 0;
          scrollOffset = 0;
          return false;

        case "end": {
          const filtered = getFiltered();
          highlightIndex = Math.max(0, filtered.length - 1);
          updateScroll();
          return false;
        }

        case "char":
          query += event.char;
          highlightIndex = 0;
          scrollOffset = 0;
          return false;
      }
    }

    function onData(buf: Buffer): void {
      const events = parseInput(buf.toString());
      for (const event of events) {
        if (handleEvent(event)) return;
      }
      render();
    }

    stdin.on("data", onData);
  });
}
