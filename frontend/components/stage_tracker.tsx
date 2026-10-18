"use client";

import { useEffect, useState } from "react";

const STAGES = [
  { title: "Search Agent", desc: "Searching the web with Tavily" },
  { title: "Reader Agent", desc: "Scraping the best sources" },
  { title: "Writer", desc: "Drafting the report" },
  { title: "Critic", desc: "Reviewing the report" },
];

export default function StageTracker() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrent((c) => Math.min(c + 1, STAGES.length - 1));
    }, 8000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="card" aria-live="polite">
      <h2 className="section-title">Agents at work</h2>
      <ol className="stages">
        {STAGES.map((stage, i) => {
          const status =
            i < current ? "done" : i === current ? "active" : "pending";
          return (
            <li key={stage.title} className={`stage ${status}`}>
              <span className="stage-dot">
                {status === "done" ? "✓" : i + 1}
              </span>
              <div>
                <div className="stage-title">{stage.title}</div>
                <div className="stage-desc">{stage.desc}</div>
              </div>
              {status === "active" && <span className="spinner" />}
            </li>
          );
        })}
      </ol>
      <p className="hint">
        Progress shown here is an estimate. This can take a minute or two.
      </p>
    </section>
  );
}