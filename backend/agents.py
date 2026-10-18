from langchain.agents import create_agent
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from tools import web_search, scrap_url
from dotenv import load_dotenv
load_dotenv()

llm=ChatGoogleGenerativeAI(model="gemini-3.5-flash-lite")

#First Agent use Tavily
def build_search_agent():
    return create_agent(
        model=llm,
        tools=[web_search]
    )

#Second Agent extract info from web use Beautiful Soup
def build_reader_agent():
    return create_agent(
        model=llm,
        tools=[scrap_url]
    )

#3rd agent which connect and return result in structured output

writter=ChatPromptTemplate.from_messages([
    ("system","You are an expert research writer. Write clear, structured and insightful reports."),
    ("human","""Write a detailed research report on the topic below.
    Topic: {topic}
    Research gathered:{research}
    Structured the resport as:
    -Introduction
    -Key Findings(Minimum 3 well-explained points)
    -Sources (List the sources you found during research)
    Be detailed, factual and professional.""")
])

writter_chain=writter | llm| StrOutputParser()

#4th Agent Critic chain for scoring 

critic_prompt=ChatPromptTemplate.from_messages([
    ("system","""You are sharp and constructive research critic. Be honest and specific."""),
    ("human","""Review the research report below and evaluate it strictly.
    Report:
    {report}
    Respond in exact Format:
    Score: X/10
    Strengths:
    -..
    -..
    Areas to improve:
    -...
    -...
    One line verdict:
    ...""")
])
critic_chain=critic_prompt | llm | StrOutputParser()

