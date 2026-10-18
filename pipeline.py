from agents import build_reader_agent,build_search_agent,writter_chain,critic_chain

def run_research_pipeline(topic:str)->dict:
    state={}

    #Search Agent 
    print("\n"+"="*20)
    print("Search Agent Working")
    print("\n"+"="*20)

    search_agent=build_search_agent()
    search_result=search_agent.invoke({
        "messages":[("user",f"Find recent reliable and detailed information about: {topic}")]
    })
    state["search_results"]=search_result['messages'][-1].content
    print("\n Search Agent Result ",state["search_results"])

    #Reader Agent