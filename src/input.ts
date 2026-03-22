export type InputEvent =
  | { type: "char"; char: string }
  | { type: "escape" }
  | { type: "enter" }
  | { type: "backspace" }
  | { type: "up" }
  | { type: "down" }
  | { type: "home" }
  | { type: "end" };

const CSI_SEQUENCES: Record<string, InputEvent> = {
  A: { type: "up" },
  B: { type: "down" },
  H: { type: "home" },
  F: { type: "end" },
  "1~": { type: "home" },
  "4~": { type: "end" },
};

export function parseInput(data: string): InputEvent[] {
  const events: InputEvent[] = [];
  let i = 0;

  while (i < data.length) {
    const ch = data[i] as string;

    if (ch === "\r" || ch === "\n") {
      events.push({ type: "enter" });
      i++;
      continue;
    }

    if (ch === "\x7f" || ch === "\x08") {
      events.push({ type: "backspace" });
      i++;
      continue;
    }

    if (ch === "\x1b") {
      // Check for CSI sequence: ESC [
      if (data[i + 1] === "[") {
        // Try 4-char sequences first (e.g. \x1b[1~ or \x1b[4~)
        const fourChar = data.slice(i + 2, i + 4);
        const event4 = CSI_SEQUENCES[fourChar];
        if (event4) {
          events.push({ ...event4 });
          i += 4;
          continue;
        }

        // Try 3-char sequences (e.g. \x1b[A)
        const oneChar = data[i + 2];
        const event3 = oneChar ? CSI_SEQUENCES[oneChar] : undefined;
        if (event3) {
          events.push({ ...event3 });
          i += 3;
          continue;
        }

        // Unknown CSI sequence — skip ESC [ and the next char
        i += 3;
        continue;
      }

      // Bare ESC (not followed by '[')
      events.push({ type: "escape" });
      i++;
      continue;
    }

    // Printable characters
    if (ch >= " ") {
      events.push({ type: "char", char: ch });
    }
    // Control chars we don't handle are silently skipped
    i++;
  }

  return events;
}
