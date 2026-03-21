const ESC = "\x1b[";

export function cursorUp(n: number): string {
  return n > 0 ? `${ESC}${n}A` : "";
}

export function clearDown(): string {
  return `${ESC}J`;
}

export function hideCursor(): string {
  return `${ESC}?25l`;
}

export function showCursor(): string {
  return `${ESC}?25h`;
}

export function write(s: string): void {
  process.stdout.write(s);
}
