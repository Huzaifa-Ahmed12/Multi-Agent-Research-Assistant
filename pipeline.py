from agents import build_reader_agent,build_search_agent,writter_chain,critic_chain
import warnings

warnings.filterwarnings(
    "ignore",
    message=".*uses fixed sampling defaults.*",
)
def run_research_pipeline(topic:str)->dict:
    state={}

    #Search Agent 
    search_agent=build_search_agent()
    search_result=search_agent.invoke({
        "messages":[("user",f"Find recent reliable and detailed information about: {topic}")]
    })
    state["search_results"]=search_result['messages'][-1].content

    #Reader Agent
    reader_agent=build_reader_agent()
    reader_result=reader_agent.invoke({
        "messages":[("user",
                  f"Based on the following research results about {topic}"
                  f" pick the most relevant URLs and scrape the deeper content from them. \n\n"
                  f"Search Results:\n{state['search_results'][:1000]}"   
            )]
    })
    state["scraped_results"]=reader_result['messages'][-1].content

    #Writer Chain
    research_combined=(
        f"Search Results: \n {state['search_results']}\n\n"
        f"Detailed Scraped Content: \n {state['scraped_results']}\n\n"
    )
    state["report"]=writter_chain.invoke({
        "topic":topic,
        "research":research_combined
    })

    #Critic Chain
    state["feedback"]=critic_chain.invoke({
        "report":state["report"]
    })
    return state

if __name__ =="__main__":
    topic=input("Enter the research Topic: ")
    run_research_pipeline(topic)
