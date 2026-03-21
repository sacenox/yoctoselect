import { describe, expect, test } from "bun:test";
import { normalizeItems, prefixFilter } from "./filter.ts";

describe("normalizeItems", () => {
  test("normalizes string items", () => {
    const result = normalizeItems(["foo", "bar"]);
    expect(result).toEqual([
      { label: "foo", value: "foo", filterText: "foo" },
      { label: "bar", value: "bar", filterText: "bar" },
    ]);
  });

  test("normalizes {label, value} items, filterText defaults to label", () => {
    const result = normalizeItems([{ label: "Foo Label", value: "foo" }]);
    expect(result).toEqual([
      { label: "Foo Label", value: "foo", filterText: "Foo Label" },
    ]);
  });

  test("preserves explicit filterText", () => {
    const result = normalizeItems([
      { label: "colored", value: "v", filterText: "plain" },
    ]);
    expect(result[0]!.filterText).toBe("plain");
  });
});

describe("prefixFilter", () => {
  const items = normalizeItems(["apple", "apricot", "banana", "Avocado"]);

  test("empty query returns all items", () => {
    expect(prefixFilter(items, "")).toEqual(items);
  });

  test("prefix match", () => {
    const result = prefixFilter(items, "ap");
    expect(result.map((i) => i.value)).toEqual(["apple", "apricot"]);
  });

  test("case insensitive", () => {
    const result = prefixFilter(items, "AV");
    expect(result.map((i) => i.value)).toEqual(["Avocado"]);
  });

  test("no match returns empty", () => {
    expect(prefixFilter(items, "xyz")).toEqual([]);
  });

  test("matches against filterText, not label", () => {
    const rich = normalizeItems([
      {
        label: "\x1b[31mClaude\x1b[0m",
        value: "claude",
        filterText: "claude-sonnet-4",
      },
    ]);
    expect(prefixFilter(rich, "claude-s").map((i) => i.value)).toEqual([
      "claude",
    ]);
    expect(prefixFilter(rich, "\x1b[31m")).toEqual([]);
  });
});
