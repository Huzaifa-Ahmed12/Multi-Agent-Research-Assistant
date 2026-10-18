"""FastAPI backend for the Multi-Agent Research Assistant."""

import time
from typing import Any

import uvicorn
from dotenv import load_dotenv

# Load API keys (GOOGLE_API_KEY, TAVILY_API_KEY) BEFORE importing the pipeline,
# because agents.py and tools.py read them when they are imported.
load_dotenv()

from fastapi import FastAPI, HTTPException  # noqa: E402
from fastapi.middleware.cors import CORSMiddleware  # noqa: E402
from pydantic import BaseModel, Field  # noqa: E402

from pipeline import run_research_pipeline  # noqa: E402

app = FastAPI(title="Multi-Agent Research Assistant API", version="1.0.0")

# Allows the Next.js app to call this API directly if needed.
# (Normally requests go through the Next.js proxy, which needs no CORS.)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Request / response shapes ----------
class ResearchRequest(BaseModel):
    topic: str = Field(..., min_length=3, max_length=500)


class ResearchResponse(BaseModel):
    search_results: str
    scraped_results: str
    report: str
    feedback: str


# ---------- Helpers ----------
def to_text(value: Any) -> str:
    """Turn any agent/chain output into a plain string.

    Gemini can return a list of content blocks instead of a string, e.g.
    [{'type': 'text', 'text': '...'}]. This always gives back clean text.
    """
    if value is None:
        return ""
    if isinstance(value, str):
        return value.strip()
    if hasattr(value, "content"):  # LangChain message objects
        return to_text(value.content)
    if isinstance(value, list):
        parts = []
        for block in value:
            if isinstance(block, dict):
                if block.get("type") == "text":
                    parts.append(block.get("text", ""))
            else:
                parts.append(to_text(block))
        return "\n".join(p for p in parts if p).strip()
    return str(value).strip()


# ---------- Routes ----------
@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


# A plain `def` (not `async def`) on purpose: the pipeline is slow and blocking,
# so FastAPI runs it in a worker thread and the server stays responsive.
@app.post("/research", response_model=ResearchResponse)
def research(request: ResearchRequest) -> ResearchResponse:
    topic = request.topic.strip()
    if len(topic) < 3:
        raise HTTPException(status_code=422, detail="Please enter a longer topic.")

    started = time.time()
    try:
        state = run_research_pipeline(topic)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"Pipeline error: {exc}") from exc

    search_results = to_text(state.get("search_results"))
    scraped_results = to_text(
        state.get("scraped_results") or state.get("scraped_content")
    )
    report = to_text(state.get("report"))
    feedback = to_text(state.get("feedback"))

    # The pipeline stores step failures as text. Search and writer are essential,
    # so report those as errors instead of showing a broken report.
    if search_results.startswith("Search failed"):
        raise HTTPException(status_code=502, detail=search_results)
    if report.startswith("Report generation failed") or not report:
        raise HTTPException(
            status_code=502, detail=report or "The writer produced an empty report."
        )

    print(f"[API] Research finished in {time.time() - started:.1f}s: {topic[:60]}")

    return ResearchResponse(
        search_results=search_results,
        scraped_results=scraped_results,
        report=report,
        feedback=feedback,
    )


if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)