import os

from langchain_community.embeddings import OllamaEmbeddings
from langchain_community.llms import Ollama
from langchain_community.vectorstores import Chroma
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_text_splitters import RecursiveCharacterTextSplitter

financial_knowledge_base = """
The old tax regime offers lower tax rates across different income brackets but requires taxpayers to let go of many tax exemptions and deductions such as HRA, LTA, 80C, 80D, etc. 
The new tax regime has no tax up to Rs 7 lakh. The standard deduction of Rs 50,000 was introduced in the new tax regime in Budget 2023. In Budget 2024-25, standard deduction was increased to Rs 75,000 for the new tax regime.
For FY 2025-26 under the new tax regime, slabs are: 0 to 4L is Nil. 4L to 8L is 5%. 8L to 12L is 10%. 12L to 16L is 15%. 16L to 20L is 20%. 20L to 24L is 25%. Above 24L is 30%. Rebate under 87A allows zero tax for income up to Rs 12 lakh under the new tax regime.
Under the Old Regime, the standard deduction is Rs 50,000. Income up to Rs 2.5L is Nil. 2.5L to 5L is 5%. 5L to 10L is 20%. Above 10L is 30%. Rebate makes income up to Rs 5 lakh tax-free.
Section 80C allows a maximum deduction of Rs 1.5 lakh from taxable income for investments like PPF, EPF, ELSS, Life Insurance premiums.
Section 80D allows deduction up to Rs 25,000 for medical insurance for self, spouse, and dependent children. An additional deduction of Rs 50,000 is allowed for parents above 60 years.
SIP (Systematic Investment Plan) is a method of investing in mutual funds. Large Cap funds have low risk, Flexi Cap have medium risk, Small Cap have highest risk and return potential.
Always maintain an emergency fund equivalent to 6 months of living expenses.
"""


class RAGFinanceService:
    def __init__(self):
        self.db_dir = "./chroma_db"

        try:
            print("Connecting to local Llama3 model via Ollama...")
            self.llm = Ollama(model="llama3:latest", temperature=0.2)
            self.embeddings = OllamaEmbeddings(model="nomic-embed-text")
        except Exception as e:
            print(f"Error initializing Ollama: {e}")
            self.llm = None
            self.embeddings = None

        self.vector_store = None
        self._initialize_knowledge()

    def _initialize_knowledge(self):
        if not self.embeddings:
            return

        if os.path.exists(self.db_dir):
            print("Loading existing Chroma vector database...")
            self.vector_store = Chroma(
                persist_directory=self.db_dir,
                embedding_function=self.embeddings,
            )
            return

        print("Creating new knowledge base with Indian Finance context...")
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
        chunks = text_splitter.split_text(financial_knowledge_base)
        self.vector_store = Chroma.from_texts(
            texts=chunks,
            embedding=self.embeddings,
            persist_directory=self.db_dir,
        )
        print("Knowledge base created successfully.")

    def get_financial_advice(self, query: str, model_name: str = "llama3:latest") -> str:
        if not self.embeddings or not self.vector_store:
            return "Local AI model is initializing. Please wait!"

        # Handle Greetings directly to avoid model refusals
        greetings = ["hi", "hello", "hey", "hi ai", "namaste", "good morning", "good evening"]
        if query.lower().strip() in greetings:
            return "Namaste! 🙏 I'm your Finance AI Assistant. I can help you with Indian Tax planning, SIPs, Mutual Funds, and Loan calculations. How can I assist you today?"

        retriever = self.vector_store.as_retriever(search_kwargs={"k": 3})

        prompt_template = """You are a highly capable AI Financial Expert specializing in the Indian context.
Your goal is to provide helpful, accurate, and educational financial guidance. 

CRITICAL SEBI COMPLIANCE RULES:
1. You are NOT a SEBI-registered Investment Adviser (RIA).
2. You MUST NOT give personalized stock recommendations (e.g., "Buy X", "Sell Y").
3. You MUST NOT guarantee returns or predict the future value of specific assets.
4. If a user asks for personalized investment advice, you MUST politely decline and state that you provide educational information only, advising them to consult a SEBI-registered professional.

Context from Knowledge Base:
{context}

User Query: {question}

Educational Guidance:"""

        prompt = PromptTemplate(template=prompt_template, input_variables=["context", "question"])

        def format_docs(docs):
            return "\n\n".join(doc.page_content for doc in docs)

        try:
            llm_to_use = Ollama(model=model_name, temperature=0.2)
        except Exception as e:
            return f"Error connecting to Ollama mode {model_name}: {str(e)}"

        chain = (
            {"context": retriever | format_docs, "question": RunnablePassthrough()}
            | prompt
            | llm_to_use
            | StrOutputParser()
        )

        print(f"Asking {model_name}: {query}")
        return chain.invoke(query)

