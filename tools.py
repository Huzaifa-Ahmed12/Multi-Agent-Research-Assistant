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

@tool
def scrap_url(url:str)->str:
    """Scrape and return clean content frpm a given URL for deeper reading."""
    try:
        resp=requests.get(url,timeout=8,headers={"User-Agent":"Mozilla/5.0"})  #Sent URl and set a time for 8s, if website doesnot open within 8 
                                                                               #sec, Error wil occur and also send header so that it looked like
                                                                               #real User is opening the website
        soup=BeautifulSoup(resp.text,"html.parser")                            #Save The beautiful soup output. 
        for tag in soup(['scripts','style','nav','footer']):                   #Remove extra content from html page like header, footer and other things.
            tag.decompose()
        return soup.get_text(separator=" ",strip=True)[:3000]                  #Get text from remaining blocks 
    except Exception as e:
        return f"Could not Scrap URL: {str(e)}"

print(scrap_url.invoke("https://www.bbc.com/"))