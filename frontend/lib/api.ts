import type { ResearchResult } from "./types";

export async function runResearch(topic: string): Promise<ResearchResult> {
  let res: Response;
  try {
    res = await fetch("/api/backend/research", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic }),
    });
  } catch {
    throw new Error("Could not reach the server. Check your connection and try again.");
  }

  if (!res.ok) {
    let message = "";
    try {
      const data = await res.json();
      message = Array.isArray(data.detail)
        ? data.detail.map((d: { msg: string }) => d.msg).join(", ")
        : String(data.detail ?? "");
    } catch {
      /* response was not JSON */
    }
    if (!message) {
      message =
        res.status >= 500
          ? "The backend is not responding. Make sure FastAPI is running on port 8000."
          : `Request failed (${res.status})`;
    }
    throw new Error(message);
  }

  return res.json();
}