import os
from dotenv import load_dotenv

load_dotenv()

from langchain_openai import AzureChatOpenAI, AzureOpenAIEmbeddings
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
            print("Connecting to Azure OpenAI...")
            self.llm = AzureChatOpenAI(
                azure_deployment=os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME", "gpt-4o-mini"),
                api_version=os.getenv("AZURE_OPENAI_API_VERSION", "2024-02-15-preview"),
                temperature=0.2,
                api_key=os.getenv("AZURE_OPENAI_API_KEY"),
                azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT")
            )
            self.embeddings = AzureOpenAIEmbeddings(
                azure_deployment=os.getenv("AZURE_OPENAI_EMBEDDINGS_DEPLOYMENT_NAME", "text-embedding-3-small"),
                api_version=os.getenv("AZURE_OPENAI_API_VERSION", "2024-02-15-preview"),
                api_key=os.getenv("AZURE_OPENAI_API_KEY"),
                azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT")
            )
            print("✅ Azure OpenAI initialized successfully.")
        except Exception as e:
            print(f"❌ Error initializing Azure OpenAI: {e}")
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

    def get_financial_advice(
        self,
        query: str,
        model_name: str = "gpt-4o-mini",
        chat_history: list | None = None,
        user_data: dict | None = None,
    ) -> str:
        if not self.embeddings or not self.vector_store or not self.llm:
            return "AI Service is initializing. Please wait a moment and try again!"

        if chat_history is None:
            chat_history = []

        history_str = ""
        for msg in chat_history[-6:]:
            role = "User" if msg.get("role") == "user" else "AI"
            history_str += f"{role}: {msg.get('content')}\n\n"

        greetings = ["hi", "hello", "hey", "hi ai", "namaste", "good morning", "good evening"]
        if query.lower().strip() in greetings:
            return "Namaste! 🙏 I'm your Finance AI Assistant. I can help you with Indian Tax planning, SIPs, Mutual Funds, and Loan calculations. How can I assist you today?"

        retriever = self.vector_store.as_retriever(search_kwargs={"k": 3})

        user_data_str = "No specific user data provided."
        if isinstance(user_data, dict):
            user_data_str = (
                f"Salary: {user_data.get('salary', 'Unknown')}\n"
                f"Total Monthly EMI: {user_data.get('emi', 'Unknown')}\n"
                f"Goals: {user_data.get('goals', 'Unknown')}\n"
                f"Financial Score: {user_data.get('score', 'Unknown')}\n"
                f"Has Emergency Fund: {user_data.get('hasEmergency', 'Unknown')}\n"
                f"Has Health Insurance: {user_data.get('hasHealthIns', 'Unknown')}"
            )

        prompt_template = """You are a highly capable AI Financial Expert specializing in the Indian context.
Your goal is to provide helpful, accurate, and educational financial guidance. 

CRITICAL SEBI COMPLIANCE RULES:
1. You are NOT a SEBI-registered Investment Adviser (RIA).
2. You MUST NOT give personalized stock recommendations (e.g., "Buy X", "Sell Y").
3. You MUST NOT guarantee returns or predict the future value of specific assets.
4. If a user asks for personalized investment advice, you MUST politely decline and state that you provide educational information only, advising them to consult a SEBI-registered professional.

DASHBOARD CONTROL CAPABILITIES:
You have the ability to update the user's dashboard and calculators based on the conversation. 
If the user wants to calculate an EMI, see a mutual fund, or navigate to a page, you MUST include a special action tag at the very end of your response.

Action Tag Format: [[ACTION: {{"type": "ACTION_TYPE", "data": {{ ... }}, "navigate": true/false}}]]

Supported Actions:
1. EMI_UPDATE: Updates the EMI calculator.
   Data: {{"principal": number, "rate": number, "tenure": number}}
   Example: [[ACTION: {{"type": "EMI_UPDATE", "data": {{"principal": 5000000, "rate": 8.5, "tenure": 20}}, "navigate": true}}]]

2. MF_FILTER: Searches for a mutual fund.
   Data: {{"search": "fund name"}}
   Example: [[ACTION: {{"type": "MF_FILTER", "data": {{"search": "Quant Small Cap"}}, "navigate": true}}]]

3. TAX_UPDATE: Updates the tax planner.
   Data: {{"income": number, "deductions": number}}
   Example: [[ACTION: {{"type": "TAX_UPDATE", "data": {{"income": 1500000, "deductions": 150000}}, "navigate": true}}]]

4. INVEST_UPDATE: Updates investment planning.
   Data: {{"monthlyAmount": number, "expectedReturn": number, "timeHorizon": number}}
   Example: [[ACTION: {{"type": "INVEST_UPDATE", "data": {{"monthlyAmount": 25000, "expectedReturn": 14, "timeHorizon": 15}}, "navigate": true}}]]

5. GOALS_UPDATE: Updates the financial goals list.
   Data: Array of goals: [{{"title": string, "target": number, "current": number, "deadline": "YYYY-MM"}}]
   Example: [[ACTION: {{"type": "GOALS_UPDATE", "data": [{{"title": "House", "target": 5000000, "current": 100000, "deadline": "2030-01"}}], "navigate": true}}]]

6. RETIREMENT_UPDATE: Updates retirement planning.
   Data: {{"currentAge": number, "retirementAge": number, "monthlyExpense": number, "inflationRate": number, "expectedReturn": number}}
   Example: [[ACTION: {{"type": "RETIREMENT_UPDATE", "data": {{"currentAge": 25, "retirementAge": 55, "monthlyExpense": 60000}}, "navigate": true}}]]

7. NAVIGATE: Switches to a specific page.
   Data: {{}} 
   Example: [[ACTION: {{"type": "NAVIGATE", "page": "dashboard"}}]] (Pages: dashboard, tax, invest, emi, goals, mf, retirement, afford)

8. AFFORD_UPDATE: Updates the affordability calculator based on a user's prompt about a purchase.
   Data: {{"itemName": string, "itemPrice": number}}
   Example: [[ACTION: {{"type": "AFFORD_UPDATE", "data": {{"itemName": "iPhone 16", "itemPrice": 80000}}, "navigate": true}}]]

Use these actions sparingly and only when the user explicitly asks for calculations, searches, or to see a specific page.

USER PERSONAL CONTEXT (CRITICAL):
The user has provided their real personal financial data below. 
You MUST use this exact data to provide highly personalized advice. 
If their salary is X, reference it. If their EMI is Y, calculate their debt burden. 
If they lack an emergency fund, tell them to build one before investing.
Do NOT give generic advice when you can use their specific numbers below!
{user_data}

Conversation History:
{history}

Context from Knowledge Base:
{context}

User Query: {question}

Educational Guidance:"""

        prompt = PromptTemplate(
            template=prompt_template,
            input_variables=["context", "question", "history", "user_data"],
        )

        def format_docs(docs):
            return "\n\n".join(doc.page_content for doc in docs)

        chain = (
            {
                "context": retriever | format_docs,
                "question": RunnablePassthrough(),
                "history": lambda _: history_str,
                "user_data": lambda _: user_data_str,
            }
            | prompt
            | self.llm
            | StrOutputParser()
        )

        print(f"Asking Azure OpenAI: {query}")
        return chain.invoke(query)
