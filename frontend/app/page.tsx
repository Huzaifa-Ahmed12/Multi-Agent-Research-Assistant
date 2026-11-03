"use client";

import { useEffect, useRef, useState } from "react";
import Header from "@/components/header";
import ResearchForm from "@/components/research_form";
import StageTracker from "@/components/stage_tracker";
import ResultView from "@/components/result_view";
import HistoryPanel from "@/components/history_panel";
import { useHistory } from "@/hooks/useHistory";
import { runResearch } from "@/lib/api";
import type { HistoryItem, ResearchResult } from "@/lib/types";

// Smoothly brings an element to the top of the screen
// (instant if the user prefers reduced motion).
function scrollToElement(el: HTMLElement | null) {
  if (!el) return;
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  el.scrollIntoView({
    behavior: reduceMotion ? "auto" : "smooth",
    block: "start",
  });
}

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { items, add, clear } = useHistory();

  const trackerRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  // 1. Research starts -> bring the progress card into view
  useEffect(() => {
    if (loading) scrollToElement(trackerRef.current);
  }, [loading]);

  // 2. Result is ready (or an old one is opened from history) -> show it
  useEffect(() => {
    if (result) scrollToElement(resultRef.current);
  }, [result]);

  // 3. Something went wrong -> show the error
  useEffect(() => {
    if (error) scrollToElement(errorRef.current);
  }, [error]);

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

          {loading && (
            <div ref={trackerRef} className="scroll-target">
              <StageTracker />
            </div>
          )}

          {error && (
            <div ref={errorRef} className="scroll-target">
              <div className="card error" role="alert">
                <strong>Something went wrong.</strong>
                <pre className="raw">{error}</pre>
              </div>
            </div>
          )}

          {result && (
            <div ref={resultRef} className="scroll-target">
              <ResultView key={activeId ?? "latest"} result={result} />
            </div>
          )}
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