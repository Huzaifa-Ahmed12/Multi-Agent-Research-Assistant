"use client";

import { useState } from "react";
import Header from "@/components/header";
import ResearchForm from "@/components/research_form";
import StageTracker from "@/components/stage_tracker";
import ResultView from "@/components/result_view";
import HistoryPanel from "@/components/history_panel";
import { useHistory } from "@/hooks/useHistory";
import { runResearch } from "@/lib/api";
import type { HistoryItem, ResearchResult } from "@/lib/types";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { items, add, clear } = useHistory();

  async function handleSubmit(topic: string) {
    setLoading(true);
    setError(null);
    setResult(null);
    setActiveId(null);
    try {
      const data = await runResearch(topic);
      setResult(data);
      add(topic, data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function handleSelect(item: HistoryItem) {
    if (loading) return;
    setError(null);
    setResult(item.result);
    setActiveId(item.id);
  }

  function handleClear() {
    clear();
    setActiveId(null);
  }

  return (
    <main className="container">
      <Header />

      <div className="layout">
        <div className="stack">
          <ResearchForm onSubmit={handleSubmit} loading={loading} />

          {loading && <StageTracker />}

          {error && (
            <div className="card error" role="alert">
              <strong>Something went wrong.</strong>
              <pre className="raw">{error}</pre>
            </div>
          )}

          {result && <ResultView key={activeId ?? "latest"} result={result} />}
        </div>

        <HistoryPanel
          items={items}
          activeId={activeId}
          onSelect={handleSelect}
          onClear={handleClear}
        />
      </div>

      <footer className="footer">Built with Next.js and LangChain</footer>
    </main>
  );
}