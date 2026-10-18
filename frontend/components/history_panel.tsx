"use client";

import type { HistoryItem } from "@/lib/types";

interface Props {
  items: HistoryItem[];
  activeId: string | null;
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HistoryPanel({
  items,
  activeId,
  onSelect,
  onClear,
}: Props) {
  return (
    <aside className="card history">
      <div className="history-head">
        <h2 className="section-title">Recent research</h2>
        {items.length > 0 && (
          <button type="button" className="link-btn" onClick={onClear}>
            Clear
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <p className="hint">Your past searches will appear here.</p>
      ) : (
        <ul className="history-list">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className={`history-item ${
                  activeId === item.id ? "active" : ""
                }`}
                onClick={() => onSelect(item)}
              >
                <span className="history-topic">{item.topic}</span>
                <span className="history-time">{formatTime(item.createdAt)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}