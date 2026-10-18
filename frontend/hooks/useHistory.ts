"use client";

import { useCallback, useEffect, useState } from "react";
import type { HistoryItem, ResearchResult } from "@/lib/types";

const KEY = "research-history";
const MAX_ITEMS = 10;

export function useHistory() {
  const [items, setItems] = useState<HistoryItem[]>([]);

  // Load saved history once, after the first render (browser only).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* ignore corrupted storage */
    }
  }, []);

  const save = (next: HistoryItem[]) => {
    setItems(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* storage full or blocked: keep in memory only */
    }
  };

  const add = useCallback(
    (topic: string, result: ResearchResult) => {
      const item: HistoryItem = {
        id: Date.now().toString(),
        topic,
        createdAt: Date.now(),
        result,
      };
      save([item, ...items].slice(0, MAX_ITEMS));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items]
  );

  const clear = useCallback(() => save([]), []);

  return { items, add, clear };
}