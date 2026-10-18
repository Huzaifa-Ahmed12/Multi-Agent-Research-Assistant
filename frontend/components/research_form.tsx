"use client";

import { useState } from "react";

const EXAMPLES = [
  "Impact of a Strait of Hormuz closure on fuel prices",
  "Latest breakthroughs in solid-state batteries",
  "How is AI changing software engineering jobs?",
];

interface Props {
  onSubmit: (topic: string) => void;
  loading: boolean;
}

export default function ResearchForm({ onSubmit, loading }: Props) {
  const [topic, setTopic] = useState("");

  function submit() {
    const value = topic.trim();
    if (!value || loading) return;
    onSubmit(value);
  }

  return (
    <section className="card">
      <label htmlFor="topic" className="label">
        What do you want to research?
      </label>
      <textarea
        id="topic"
        className="textarea"
        rows={3}
        placeholder="Type any question or topic..."
        value={topic}
        disabled={loading}
        onChange={(e) => setTopic(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) submit();
        }}
      />

      <div className="chips">
        {EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            className="chip"
            disabled={loading}
            onClick={() => setTopic(example)}
          >
            {example}
          </button>
        ))}
      </div>

      <div className="form-footer">
        <span className="hint">Ctrl + Enter to run</span>
        <button
          type="button"
          className="btn"
          onClick={submit}
          disabled={loading || !topic.trim()}
        >
          {loading ? "Researching..." : "Start Research"}
        </button>
      </div>
    </section>
  );
}