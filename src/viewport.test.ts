import { describe, expect, test } from "bun:test";
import { adjustScroll, clampHighlight, moveDown, moveUp } from "./viewport.ts";

describe("moveDown", () => {
  test("advances by one", () => {
    expect(moveDown(0, 5)).toBe(1);
  });

  test("wraps from last to first", () => {
    expect(moveDown(4, 5)).toBe(0);
  });

  test("returns 0 when total is 0", () => {
    expect(moveDown(0, 0)).toBe(0);
  });
});

describe("moveUp", () => {
  test("goes back by one", () => {
    expect(moveUp(2, 5)).toBe(1);
  });

  test("wraps from first to last", () => {
    expect(moveUp(0, 5)).toBe(4);
  });

  test("returns 0 when total is 0", () => {
    expect(moveUp(0, 0)).toBe(0);
  });
});

describe("clampHighlight", () => {
  test("returns same index when in range", () => {
    expect(clampHighlight(3, 10)).toBe(3);
  });

  test("clamps to last item when past end", () => {
    expect(clampHighlight(15, 10)).toBe(9);
  });

  test("returns 0 when total is 0", () => {
    expect(clampHighlight(5, 0)).toBe(0);
  });
});

describe("adjustScroll", () => {
  test("no scroll needed when highlight is within viewport", () => {
    expect(adjustScroll(3, 0, 5)).toBe(0);
  });

  test("scrolls down when highlight passes bottom of viewport", () => {
    // highlight=5, scrollOffset=0, maxVisible=5 → need scrollOffset=1
    expect(adjustScroll(5, 0, 5)).toBe(1);
  });

  test("scrolls up when highlight is above viewport", () => {
    // highlight=2, scrollOffset=5, maxVisible=5 → need scrollOffset=2
    expect(adjustScroll(2, 5, 5)).toBe(2);
  });

  test("keeps scrollOffset when highlight is at top edge of viewport", () => {
    expect(adjustScroll(3, 3, 5)).toBe(3);
  });

  test("keeps scrollOffset when highlight is at bottom edge of viewport", () => {
    // highlight=7, scrollOffset=3, maxVisible=5 → visible 3..7, highlight=7 is last visible
    expect(adjustScroll(7, 3, 5)).toBe(3);
  });

  test("wrapping to 0 resets scroll to 0", () => {
    expect(adjustScroll(0, 10, 5)).toBe(0);
  });

  test("wrapping to last item scrolls to show it", () => {
    // 25 items, maxVisible=5, highlight wraps to 24
    expect(adjustScroll(24, 0, 5)).toBe(20);
  });
});
