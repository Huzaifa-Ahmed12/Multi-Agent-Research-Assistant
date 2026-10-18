from agents import build_reader_agent, build_search_agent, writter_chain, critic_chain
import warnings

warnings.filterwarnings(
    "ignore",
    message=".*uses fixed sampling defaults.*",
)


def get_text(content) -> str:
    """Gemini can return a list of content blocks. Always return plain text."""
    if isinstance(content, str):
        return content
    if hasattr(content, "content"):  # LangChain message object
        return get_text(content.content)
    if isinstance(content, list):
        parts = []
        for block in content:
            if isinstance(block, str):
                parts.append(block)
            elif isinstance(block, dict) and block.get("type") == "text":
                parts.append(block.get("text", ""))
        return "\n".join(parts)
    return str(content)


def run_research_pipeline(topic: str) -> dict:
    state = {}

    # Search Agent
    search_agent = build_search_agent()
    search_result = search_agent.invoke({
        "messages": [("user", f"Find recent reliable and detailed information about: {topic}")]
    })
    state["search_results"] = get_text(search_result["messages"][-1].content)

    # Reader Agent
    reader_agent = build_reader_agent()
    reader_result = reader_agent.invoke({
        "messages": [("user",
            f"Based on the following research results about {topic}, "
            f"pick the most relevant URLs and scrape the deeper content from them.\n\n"
            f"Search Results:\n{state['search_results'][:3000]}"
        )]
    })
    state["scraped_results"] = get_text(reader_result["messages"][-1].content)

    # Writer Chain
    research_combined = (
        f"Search Results:\n{state['search_results']}\n\n"
        f"Detailed Scraped Content:\n{state['scraped_results']}\n\n"
    )
    state["report"] = get_text(writter_chain.invoke({
        "topic": topic,
        "research": research_combined,
    }))

    # Critic Chain
    state["feedback"] = get_text(critic_chain.invoke({
        "report": state["report"],
    }))

    return state


if __name__ == "__main__":
    topic = input("Enter the research topic: ")
    result = run_research_pipeline(topic)
    print("\n===== REPORT =====\n")
    print(result["report"])
    print("\n===== CRITIC FEEDBACK =====\n")
    print(result["feedback"])