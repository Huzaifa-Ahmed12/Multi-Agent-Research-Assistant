"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ResearchResult } from "@/lib/types";

type TabKey = "report" | "feedback" | "search" | "scraped";

const TABS: { key: TabKey; label: string }[] = [
  { key: "report", label: "Report" },
  { key: "feedback", label: "Critic Feedback" },
  { key: "search", label: "Search Results" },
  { key: "scraped", label: "Scraped Content" },
];

export default function ResultView({ result }: { result: ResearchResult }) {
  const [tab, setTab] = useState<TabKey>("report");
  const [copied, setCopied] = useState(false);

  const content: Record<TabKey, string> = {
    report: result.report,
    feedback: result.feedback,
    search: result.search_results,
    scraped: result.scraped_results,
  };

  const isMarkdown = tab === "report" || tab === "feedback";

  async function copy() {
    try {
      await navigator.clipboard.writeText(content[tab]);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked */
    }
  }

  return (
    <section className="card">
      <div className="tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            className={`tab ${tab === t.key ? "active" : ""}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
        <button type="button" className="copy" onClick={copy}>
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      <div className="result-body">
        {isMarkdown ? (
          <div className="markdown">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content[tab] || "_Nothing to show._"}
            </ReactMarkdown>
          </div>
        ) : (
          <pre className="raw">{content[tab] || "Nothing to show."}</pre>
        )}
      </div>
    </section>
  );
}