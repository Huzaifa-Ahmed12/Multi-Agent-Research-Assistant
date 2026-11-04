import type { ResearchResult } from "./types";

// On your computer this points to the local backend.
// On Vercel, set the NEXT_PUBLIC_API_URL environment variable to your Render URL.
const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000"
).replace(/\/+$/, "");

export async function runResearch(topic: string): Promise<ResearchResult> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/research`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic }),
    });
  } catch {
    throw new Error(
      "Could not reach the server. It may be waking up, so wait a minute and try again."
    );
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
          ? "The backend is not responding. Please try again in a moment."
          : `Request failed (${res.status})`;
    }
    throw new Error(message);
  }

  return res.json();
}