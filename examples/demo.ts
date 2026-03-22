import * as c from "yoctocolors";
import { select } from "../src/index.ts";

async function main() {
  console.log("=== Simple string items ===");
  const fruit = await select({
    items: [
      "apple",
      "apricot",
      "banana",
      "blueberry",
      "cherry",
      "date",
      "elderberry",
      "fig",
      "grape",
    ],
  });
  console.log(`Selected: ${fruit}`);

  console.log("\n=== Rich items with ANSI colors ===");
  const model = await select({
    items: [
      {
        label: `claude-sonnet-4  ${c.green("free")}  ${c.dim("200k")}`,
        value: "anthropic/claude-sonnet-4",
        filterText: "anthropic/claude-sonnet-4 claude-sonnet-4",
      },
      {
        label: `claude-haiku-3  ${c.dim("200k")}`,
        value: "anthropic/claude-haiku-3",
        filterText: "anthropic/claude-haiku-3 claude-haiku-3",
      },
      {
        label: `gpt-4o  ${c.dim("128k")}`,
        value: "openai/gpt-4o",
        filterText: "openai/gpt-4o gpt-4o",
      },
      {
        label: `gemini-2.5-pro  ${c.dim("1M")}`,
        value: "google/gemini-2.5-pro",
        filterText: "google/gemini-2.5-pro gemini-2.5-pro",
      },
    ],
    placeholder: "search models...",
  });
  console.log(`Selected model: ${model}`);

  console.log("\n=== Scrollable list browsing ===");
  console.log(
    c.dim("  Use ↑/↓ to scroll through all 50 items, Home/End to jump\n"),
  );
  const colors = [
    "red",
    "orange",
    "yellow",
    "green",
    "blue",
    "indigo",
    "violet",
  ];
  const items = Array.from({ length: 50 }, (_, i) => {
    const color = colors[i % colors.length] as string;
    return {
      label: `${color}-${String(i + 1).padStart(2, "0")}  ${c.dim(`shade ${i + 1}`)}`,
      value: `${color}-${i + 1}`,
      filterText: `${color} ${i + 1}`,
    };
  });
  const item = await select({
    items,
    maxVisible: 8,
    placeholder: "browse or type to filter...",
  });
  console.log(`Selected: ${item}`);
}

main();
