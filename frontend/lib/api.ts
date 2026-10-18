import type { ResearchResult } from "./types";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function runResearch(topic: string): Promise<ResearchResult> {
  if (USE_MOCK) {
    await sleep(6000);
    return {
      search_results: `Mock search results for: ${topic}\n\n1. Example Source A - https://example.com/a\n2. Example Source B - https://example.com/b\n3. Example Source C - https://example.com/c`,
      scraped_results: `Mock scraped content.\n\nThis is where the Reader Agent's deeper content from the best URLs will appear once the backend is connected.`,
      report: `# Research Report: ${topic}\n\n## Overview\nThis is a **mock report** so you can preview the interface.\n\n## Key Findings\n- Finding one\n- Finding two\n- Finding three\n\n## Comparison\n\n| Factor | Impact |\n|---|---|\n| Supply | High |\n| Price | Rising |\n\n## Conclusion\nReplace this with real output once the backend is connected.`,
      feedback: `## Critic Review\n\n**Score:** 8/10\n\n- **Strengths:** clear structure\n- **Weaknesses:** needs more sources\n- **Suggestion:** add specific figures`,
    };
  }

  const res = await fetch("/api/backend/research", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed (${res.status})`);
  }
  return res.json();
}