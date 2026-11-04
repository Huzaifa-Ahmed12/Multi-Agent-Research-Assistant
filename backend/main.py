"""FastAPI backend for the Multi-Agent Research Assistant."""

import os
import time
from typing import Any

from dotenv import load_dotenv

# Load API keys BEFORE importing the pipeline (agents.py / tools.py read them on import).
load_dotenv()

from fastapi import FastAPI, HTTPException  # noqa: E402
from fastapi.middleware.cors import CORSMiddleware  # noqa: E402
from pydantic import BaseModel, Field  # noqa: E402

from pipeline import run_research_pipeline  # noqa: E402

app = FastAPI(title="Multi-Agent Research Assistant API")

# Websites that may call this API. Set ALLOWED_ORIGINS (comma-separated) on Render.
origins = [
    o.strip().rstrip("/")
    for o in os.getenv(
        "ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000"
    ).split(",")
    if o.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ResearchRequest(BaseModel):
    topic: str = Field(..., min_length=3, max_length=500)


class ResearchResponse(BaseModel):
    search_results: str
    scraped_results: str
    report: str
    feedback: str


def to_text(value: Any) -> str:
    """Always return plain text, even if Gemini returns a list of content blocks."""
    if value is None:
        return ""
    if isinstance(value, str):
        return value.strip()
    if hasattr(value, "content"):
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


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


# A plain `def` (not `async def`): the pipeline is slow and blocking, so FastAPI
# runs it in a worker thread and the server stays responsive.
@app.post("/research", response_model=ResearchResponse)
def research(request: ResearchRequest) -> ResearchResponse:
    topic = request.topic.strip()
    started = time.time()

    try:
        state = run_research_pipeline(topic)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"Pipeline error: {exc}") from exc

    report = to_text(state.get("report"))
    if not report:
        raise HTTPException(status_code=502, detail="The writer produced an empty report.")

    print(f"[API] Research finished in {time.time() - started:.1f}s: {topic[:60]}")

    return ResearchResponse(
        search_results=to_text(state.get("search_results")),
        scraped_results=to_text(state.get("scraped_results")),
        report=report,
        feedback=to_text(state.get("feedback")),
    )