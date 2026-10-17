from langchain.tools import tool
import requests # For web Scraping 
from bs4 import BeautifulSoup
from tavily import TavilyClient
import os
from dotenv import load_dotenv
load_dotenv()
from rich import print
tavily=TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))


@tool
def web_search(query:str)->str:
    """Search the web for recent and reliable information on topic. Returns Titles, URLs and Snippets."""
    results=tavily.search(query=query)
    output=[]
    for r in results['results']:
        output.append(
            f"Title:{r['title']}\n Url:{r['url']}\n Content:{r['content']} "
    )
    return "\n\n".join(output)        

print(web_search.invoke("What are the Current International Oil Prices. Also tell me the actual price in which Pakistan buy 1 litre of oil in pkr except all those lavies and taxes."))
