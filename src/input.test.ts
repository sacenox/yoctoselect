import { describe, expect, test } from "bun:test";
import { parseInput } from "./input.ts";

describe("parseInput", () => {
  test("single printable character", () => {
    expect(parseInput("a")).toEqual([{ type: "char", char: "a" }]);
  });

  test("multiple printable characters", () => {
    expect(parseInput("abc")).toEqual([
      { type: "char", char: "a" },
      { type: "char", char: "b" },
      { type: "char", char: "c" },
    ]);
  });

  test("space character", () => {
    expect(parseInput(" ")).toEqual([{ type: "char", char: " " }]);
  });

  test("enter (CR)", () => {
    expect(parseInput("\r")).toEqual([{ type: "enter" }]);
  });

  test("enter (LF)", () => {
    expect(parseInput("\n")).toEqual([{ type: "enter" }]);
  });

  test("backspace (DEL 0x7f)", () => {
    expect(parseInput("\x7f")).toEqual([{ type: "backspace" }]);
  });

  test("backspace (BS 0x08)", () => {
    expect(parseInput("\x08")).toEqual([{ type: "backspace" }]);
  });

  test("bare ESC", () => {
    expect(parseInput("\x1b")).toEqual([{ type: "escape" }]);
  });

  test("arrow up", () => {
    expect(parseInput("\x1b[A")).toEqual([{ type: "up" }]);
  });

  test("arrow down", () => {
    expect(parseInput("\x1b[B")).toEqual([{ type: "down" }]);
  });

  test("home key", () => {
    expect(parseInput("\x1b[H")).toEqual([{ type: "home" }]);
  });

  test("home key (alternate)", () => {
    expect(parseInput("\x1b[1~")).toEqual([{ type: "home" }]);
  });

  test("end key", () => {
    expect(parseInput("\x1b[F")).toEqual([{ type: "end" }]);
  });

  test("end key (alternate)", () => {
    expect(parseInput("\x1b[4~")).toEqual([{ type: "end" }]);
  });

  // THE BUG: mixed sequences in a single data event
  test("arrow down followed by printable char", () => {
    expect(parseInput("\x1b[Bv")).toEqual([
      { type: "down" },
      { type: "char", char: "v" },
    ]);
  });

  test("arrow up followed by multiple chars", () => {
    expect(parseInput("\x1b[Aabc")).toEqual([
      { type: "up" },
      { type: "char", char: "a" },
      { type: "char", char: "b" },
      { type: "char", char: "c" },
    ]);
  });

  test("two arrow keys in sequence", () => {
    expect(parseInput("\x1b[B\x1b[B")).toEqual([
      { type: "down" },
      { type: "down" },
    ]);
  });

  test("char then arrow then char", () => {
    expect(parseInput("x\x1b[Ay")).toEqual([
      { type: "char", char: "x" },
      { type: "up" },
      { type: "char", char: "y" },
    ]);
  });

  test("arrow followed by enter", () => {
    expect(parseInput("\x1b[B\r")).toEqual([
      { type: "down" },
      { type: "enter" },
    ]);
  });

  test("ESC followed by non-bracket is ESC + char", () => {
    expect(parseInput("\x1ba")).toEqual([
      { type: "escape" },
      { type: "char", char: "a" },
    ]);
  });

  test("unknown escape sequence is skipped", () => {
    // \x1b[C is arrow right — not handled, should be skipped
    expect(parseInput("\x1b[Ca")).toEqual([{ type: "char", char: "a" }]);
  });

  test("empty string returns empty array", () => {
    expect(parseInput("")).toEqual([]);
  });
});
