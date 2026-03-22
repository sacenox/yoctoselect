export function moveDown(highlight: number, total: number): number {
  if (total === 0) return 0;
  return highlight >= total - 1 ? 0 : highlight + 1;
}

export function moveUp(highlight: number, total: number): number {
  if (total === 0) return 0;
  return highlight <= 0 ? total - 1 : highlight - 1;
}

export function clampHighlight(highlight: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(highlight, total - 1);
}

export function adjustScroll(
  highlight: number,
  scrollOffset: number,
  maxVisible: number,
): number {
  if (highlight < scrollOffset) return highlight;
  if (highlight >= scrollOffset + maxVisible) return highlight - maxVisible + 1;
  return scrollOffset;
}
