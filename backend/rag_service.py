import os
import json
import urllib.request
import urllib.error
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).parent / '.env', override=True)

from langchain_openai import AzureChatOpenAI, AzureOpenAIEmbeddings
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_community.vectorstores import Chroma

# ─── Fallback Knowledge ────────────────────────────────────────────────
FALLBACK_KNOWLEDGE = """
The old tax regime offers lower tax rates across different income brackets but requires taxpayers to let go of many tax exemptions and deductions such as HRA, LTA, 80C, 80D, etc. 
The new tax regime has no tax up to Rs 7 lakh. The standard deduction of Rs 50,000 was introduced in the new tax regime in Budget 2023. In Budget 2024-25, standard deduction was increased to Rs 75,000 for the new tax regime.
For FY 2025-26 under the new tax regime, slabs are: 0 to 4L is Nil. 4L to 8L is 5%. 8L to 12L is 10%. 12L to 16L is 15%. 16L to 20L is 20%. 20L to 24L is 25%. Above 24L is 30%. Rebate under 87A allows zero tax for income up to Rs 12 lakh under the new tax regime.
Under the Old Regime, the standard deduction is Rs 50,000. Income up to Rs 2.5L is Nil. 2.5L to 5L is 5%. 5L to 10L is 20%. Above 10L is 30%. Rebate makes income up to Rs 5 lakh tax-free.
Section 80C allows a maximum deduction of Rs 1.5 lakh from taxable income for investments like PPF, EPF, ELSS, Life Insurance premiums.
Section 80D allows deduction up to Rs 25,000 for medical insurance for self, spouse, and dependent children. An additional deduction of Rs 50,000 is allowed for parents above 60 years.
SIP (Systematic Investment Plan) is a method of investing in mutual funds. Large Cap funds have low risk, Flexi Cap have medium risk, Small Cap have highest risk and return potential.
Always maintain an emergency fund equivalent to 6 months of living expenses.
"""

CHROMA_DB_DIR = "./chroma_db"


class RAGFinanceService:
    def __init__(self):
        self.llm = None
        self.embeddings = None
        self.vector_store = None

        # ── Initialize LLM ──
        try:
            print("Connecting to Azure OpenAI (Chat)...")
            self.llm = AzureChatOpenAI(
                azure_deployment=os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME", "gpt-4o-mini"),
                api_version=os.getenv("AZURE_OPENAI_API_VERSION", "2025-01-01-preview"),
                temperature=0.2,
                api_key=os.getenv("AZURE_OPENAI_API_KEY"),
                azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
            )
            print("✅ Azure OpenAI Chat initialized successfully.")
        except Exception as e:
            print(f"❌ Error initializing Azure OpenAI Chat: {e}")

        # ── Initialize Embeddings ──
        try:
            print("Connecting to Azure OpenAI (Embeddings)...")
            self.embeddings = AzureOpenAIEmbeddings(
                azure_deployment=os.getenv("AZURE_OPENAI_EMBEDDINGS_DEPLOYMENT_NAME", "text-embedding-3-small"),
                api_version=os.getenv("AZURE_OPENAI_API_VERSION", "2025-01-01-preview"),
                api_key=os.getenv("AZURE_OPENAI_API_KEY"),
                azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
            )
            print("✅ Azure OpenAI Embeddings initialized successfully.")
        except Exception as e:
            print(f"❌ Error initializing Azure Embeddings: {e}")

        # ── Connect Vector Store ──
        self._initialize_knowledge()

    def _initialize_knowledge(self):
        """Load or reload the ChromaDB vector store."""
        if not self.embeddings:
            print("⚠️ Embeddings not available. Vector search disabled.")
            return

        try:
            if os.path.exists(CHROMA_DB_DIR):
                self.vector_store = Chroma(
                    persist_directory=CHROMA_DB_DIR,
                    embedding_function=self.embeddings,
                )
                doc_count = self.vector_store._collection.count()
                print(f"✅ ChromaDB loaded with {doc_count} document chunks.")
            else:
                print("⚠️ ChromaDB directory not found. RAG will use fallback knowledge.")
                self.vector_store = None
        except Exception as e:
            print(f"❌ Error loading ChromaDB: {e}")
            self.vector_store = None

    def _retrieve_context(self, query: str, k: int = 4) -> str:
        retrieved_chunks = []

        if self.vector_store:
            try:
                results = self.vector_store.similarity_search(query, k=k)
                if results:
                    retrieved_chunks = [doc.page_content for doc in results]
                    print(f"🔍 Retrieved {len(retrieved_chunks)} chunks from ChromaDB")
            except Exception as e:
                print(f"⚠️ Vector search failed: {e}")

        if retrieved_chunks:
            context = "RETRIEVED FROM KNOWLEDGE BASE:\n"
            context += "\n---\n".join(retrieved_chunks)
            context += "\n\nADDITIONAL REFERENCE:\n" + FALLBACK_KNOWLEDGE
            return context
        else:
            return FALLBACK_KNOWLEDGE

    def _build_full_prompt(self, query, history_str, user_data_str, retrieved_context):
        """Build the full system prompt text for GPT 5.5 direct API call."""
        return f"""You are a highly capable AI Financial Expert specializing in the Indian context.
Your goal is to provide helpful, accurate, and educational financial guidance. 

CRITICAL SEBI COMPLIANCE RULES:
1. You are NOT a SEBI-registered Investment Adviser (RIA).
2. You MUST NOT give personalized direct stock recommendations (e.g., "Buy X Shares").
3. For Mutual Funds: You CAN and SHOULD recommend suitable Mutual Fund categories (e.g., Index Funds, Small Cap, ELSS) or prominent well-known schemes purely for educational purposes and reference, based on the user's goals. Do not give guarantees, but explicitly provide actionable mutual fund category recommendations.
4. Always include a brief, standard disclaimer when discussing specific funds.

DASHBOARD CONTROL CAPABILITIES:
You CAN and SHOULD update the user's dashboard calculators when explicitly asked. You are fully capable of doing this by outputting the specific action tags below.
But you must follow these STRICT RULES:

WHEN TO USE ACTION TAGS:
- ONLY when the user EXPLICITLY asks you to update a value on the dashboard (e.g., "update my SIP to 30000", "set my goal")
- ONLY when the user EXPLICITLY asks you to calculate something (e.g., "calculate my EMI for 50 lakh loan")
- ONLY when the user EXPLICITLY asks to navigate to a page (e.g., "show me my dashboard", "take me to EMI calculator")
- ONLY when the user EXPLICITLY asks to search for a mutual fund (e.g., "search for Quant Small Cap fund")

WHEN TO NEVER USE ACTION TAGS:
- Do NOT add action tags just because you MENTIONED a topic like dashboard, EMI, tax, or mutual funds in your answer.
- Do NOT add action tags for general advice, explanations, or educational responses.
- Do NOT add action tags just to be helpful or proactive. Wait for the user to ask.
- Do NOT add NAVIGATE actions unless the user says words like "show me", "take me to", "open", "go to".

Action Tag Format: [[ACTION: {{"type": "ACTION_TYPE", "data": {{ ... }}, "navigate": true/false}}]]
Set "navigate" to true if you are updating a value or if the user asked to see that page.

Supported Actions:
1. EMI_UPDATE: Updates the EMI calculator. Only use when user asks to CALCULATE an EMI.
   Data: {{"principal": number, "rate": number, "tenure": number}}
2. MF_FILTER: Searches for a mutual fund. Only use when user asks to SEARCH or FIND a specific fund.
   Data: {{"search": "fund name"}}
3. TAX_UPDATE: Updates the tax planner. Only use when user asks to CALCULATE their tax.
   Data: {{"income": number, "deductions": number}}
4. INVEST_UPDATE: Updates investment planning. Only use when user asks to PLAN or CALCULATE investments.
   Data: {{"monthlyAmount": number, "expectedReturn": number, "timeHorizon": number}}
5. GOALS_UPDATE: Updates the financial goals list. Only use when user asks to SET or UPDATE their goals.
   Data: Array of goals: [{{"title": string, "target": number, "current": number, "deadline": "YYYY-MM"}}]
6. RETIREMENT_UPDATE: Updates retirement planning. Only use when user asks to PLAN retirement.
   Data: {{"currentAge": number, "retirementAge": number, "monthlyExpense": number, "inflationRate": number, "expectedReturn": number}}
7. AFFORD_UPDATE: Updates the affordability calculator. Only use when user asks "Can I afford X?".
   Data: {{"itemName": string, "itemPrice": number}}

REMEMBER: Most of your responses should NOT contain any action tags. Only use them when the user explicitly requests a calculation or navigation.

USER PERSONAL CONTEXT (CRITICAL):
The user has provided their real personal financial data below. 
You MUST use this exact data to provide highly personalized advice. 
If their salary is X, reference it. If their EMI is Y, calculate their debt burden. 
If they lack an emergency fund, tell them to build one before investing.
Do NOT give generic advice when you can use their specific numbers below!
{user_data_str}

Conversation History:
{history_str}

Context from Knowledge Base:
{retrieved_context}

User Query: {query}

Educational Guidance:"""

    def _call_gpt55_responses_api(self, full_prompt: str) -> str:
        """Call Azure OpenAI GPT 5.5 via the Responses API (direct HTTP)."""
        GPT55_ENDPOINT = "https://yanku-mptr6fe7-eastus2.cognitiveservices.azure.com/openai/responses?api-version=2025-04-01-preview"
        GPT55_API_KEY = os.getenv("AZURE_OPENAI_API_KEY")

        payload = {
            "model": "gpt-5.5",
            "input": full_prompt,
            "temperature": 0.2,
        }

        headers = {
            "Content-Type": "application/json",
            "api-key": GPT55_API_KEY,
        }

        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(GPT55_ENDPOINT, data=data, headers=headers, method="POST")

        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                body = json.loads(resp.read().decode("utf-8"))
                # The Responses API returns output in a different format
                # Try multiple response formats for compatibility
                if "output" in body:
                    # Responses API format - output is a list of message objects
                    for item in body["output"]:
                        if item.get("type") == "message":
                            for content in item.get("content", []):
                                if content.get("type") == "output_text":
                                    return content.get("text", "")
                # Fallback: try standard chat completions format
                if "choices" in body:
                    return body["choices"][0]["message"]["content"]
                # Last resort: return raw
                return str(body)
        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8")
            print(f"❌ GPT 5.5 API error ({e.code}): {err_body}")
            raise Exception(f"GPT 5.5 API error ({e.code}): {err_body}")
        except Exception as e:
            print(f"❌ GPT 5.5 request failed: {e}")
            raise

    def get_financial_advice(
        self,
        query: str,
        model_name: str = "gpt-4o",
        chat_history: list | None = None,
        user_data: dict | None = None,
    ) -> str:
        if chat_history is None:
            chat_history = []

        history_str = ""
        for msg in chat_history[-6:]:
            role = "User" if msg.get("role") == "user" else "AI"
            history_str += f"{role}: {msg.get('content')}\n\n"

        greetings = ["hi", "hello", "hey", "hi ai", "namaste", "good morning", "good evening"]
        if query.lower().strip() in greetings:
            return "Namaste! 🙏 I'm your Finance AI Assistant. I can help you with Indian Tax planning, SIPs, Mutual Funds, and Loan calculations. How can I assist you today?"

        user_data_str = "No specific user data provided."
        if isinstance(user_data, dict):
            persona = user_data.get('persona', 'personal')
            if persona == 'business':
                user_data_str = (
                    f"User Mode: BUSINESS\n"
                    f"Monthly Revenue: {user_data.get('monthlyRevenue', 'Unknown')}\n"
                    f"Operating Expenses: {user_data.get('operatingExpenses', 'Unknown')}\n"
                    f"Profit Margin: {user_data.get('profitMargin', 'Unknown')}\n"
                    f"Has Business Loan: {user_data.get('hasBusinessLoan', 'Unknown')}\n"
                    f"Business Loan EMI: {user_data.get('businessLoanAmount', 'None')}\n"
                    f"GST Registered: {user_data.get('gstRegistered', 'Unknown')}\n"
                    f"Business Health Score: {user_data.get('score', 'Unknown')}\n"
                    f"Business Goals: {user_data.get('goals', 'None')}"
                )
            else:
                user_data_str = (
                    f"User Mode: PERSONAL\n"
                    f"Monthly Salary: {user_data.get('salary', 'Not provided')}\n"
                    f"Monthly Expenses: {user_data.get('monthlyExpenses', 'Not provided')}\n"
                    f"Total Monthly EMI: {user_data.get('emi', 'No active EMI')}\n"
                    f"Monthly SIP Amount: {user_data.get('sipAmount', 'Not set')}\n"
                    f"Financial Goals: {user_data.get('goals', 'None')}\n"
                    f"Financial Health Score: {user_data.get('score', 'Unknown')}\n"
                    f"Has Emergency Fund: {user_data.get('hasEmergency', 'Unknown')}\n"
                    f"Has Health Insurance: {user_data.get('hasHealthIns', 'Unknown')}"
                )

        retrieved_context = self._retrieve_context(query)

        # ── GPT 5.5 via Azure Responses API (direct HTTP) ──
        if model_name == "gpt-5.5":
            print(f"🚀 Asking GPT 5.5 (Responses API): {query}")
            full_prompt = self._build_full_prompt(query, history_str, user_data_str, retrieved_context)
            return self._call_gpt55_responses_api(full_prompt)

        # ── Default: GPT-4o-mini via LangChain ──
        if self.llm is None:
            return "AI Service is initializing. Please wait a moment and try again!"

        prompt_template = """You are a highly capable AI Financial Expert specializing in the Indian context.
Your goal is to provide helpful, accurate, and educational financial guidance. 

CRITICAL SEBI COMPLIANCE RULES:
1. You are NOT a SEBI-registered Investment Adviser (RIA).
2. You MUST NOT give personalized direct stock recommendations (e.g., "Buy X Shares").
3. For Mutual Funds: You CAN and SHOULD recommend suitable Mutual Fund categories (e.g., Index Funds, Small Cap, ELSS) or prominent well-known schemes purely for educational purposes and reference, based on the user's goals. Do not give guarantees, but explicitly provide actionable mutual fund category recommendations.
4. Always include a brief, standard disclaimer when discussing specific funds.

DASHBOARD CONTROL CAPABILITIES:
You CAN and SHOULD update the user's dashboard calculators when explicitly asked. You are fully capable of doing this by outputting the specific action tags below.
But you must follow these STRICT RULES:

WHEN TO USE ACTION TAGS:
- ONLY when the user EXPLICITLY asks you to update a value on the dashboard (e.g., "update my SIP to 30000", "set my goal")
- ONLY when the user EXPLICITLY asks you to calculate something (e.g., "calculate my EMI for 50 lakh loan")
- ONLY when the user EXPLICITLY asks to navigate to a page (e.g., "show me my dashboard", "take me to EMI calculator")
- ONLY when the user EXPLICITLY asks to search for a mutual fund (e.g., "search for Quant Small Cap fund")

WHEN TO NEVER USE ACTION TAGS:
- Do NOT add action tags just because you MENTIONED a topic like dashboard, EMI, tax, or mutual funds in your answer.
- Do NOT add action tags for general advice, explanations, or educational responses.
- Do NOT add action tags just to be helpful or proactive. Wait for the user to ask.
- Do NOT add NAVIGATE actions unless the user says words like "show me", "take me to", "open", "go to".
- If user asks a question like "What is SIP?" or "How does tax work?", just answer. NO action tag.
- If user says "Hi" or has a casual conversation, NEVER add any action tag.

Action Tag Format: [[ACTION: {{"type": "ACTION_TYPE", "data": {{ ... }}, "navigate": true/false}}]]
Set "navigate" to true if you are updating a value or if the user asked to see that page.

Supported Actions:
1. EMI_UPDATE: Updates the EMI calculator. Only use when user asks to CALCULATE an EMI.
   Data: {{"principal": number, "rate": number, "tenure": number}}
   Example: [[ACTION: {{"type": "EMI_UPDATE", "data": {{"principal": 5000000, "rate": 8.5, "tenure": 20}}, "navigate": true}}]]

2. MF_FILTER: Searches for a mutual fund. Only use when user asks to SEARCH or FIND a specific fund.
   Data: {{"search": "fund name"}}
   Example: [[ACTION: {{"type": "MF_FILTER", "data": {{"search": "Quant Small Cap"}}, "navigate": true}}]]

3. TAX_UPDATE: Updates the tax planner. Only use when user asks to CALCULATE their tax.
   Data: {{"income": number, "deductions": number}}
   Example: [[ACTION: {{"type": "TAX_UPDATE", "data": {{"income": 1500000, "deductions": 150000}}, "navigate": true}}]]

4. INVEST_UPDATE: Updates investment planning. Only use when user asks to PLAN or CALCULATE investments.
   Data: {{"monthlyAmount": number, "expectedReturn": number, "timeHorizon": number}}
   Example: [[ACTION: {{"type": "INVEST_UPDATE", "data": {{"monthlyAmount": 25000, "expectedReturn": 14, "timeHorizon": 15}}, "navigate": true}}]]

5. GOALS_UPDATE: Updates the financial goals list. Only use when user asks to SET or UPDATE their goals.
   Data: Array of goals: [{{"title": string, "target": number, "current": number, "deadline": "YYYY-MM"}}]
   Example: [[ACTION: {{"type": "GOALS_UPDATE", "data": [{{"title": "House", "target": 5000000, "current": 100000, "deadline": "2030-01"}}], "navigate": true}}]]

6. RETIREMENT_UPDATE: Updates retirement planning. Only use when user asks to PLAN retirement.
   Data: {{"currentAge": number, "retirementAge": number, "monthlyExpense": number, "inflationRate": number, "expectedReturn": number}}
   Example: [[ACTION: {{"type": "RETIREMENT_UPDATE", "data": {{"currentAge": 25, "retirementAge": 55, "monthlyExpense": 60000}}, "navigate": true}}]]

7. AFFORD_UPDATE: Updates the affordability calculator. Only use when user asks "Can I afford X?".
   Data: {{"itemName": string, "itemPrice": number}}
   Example: [[ACTION: {{"type": "AFFORD_UPDATE", "data": {{"itemName": "iPhone 16", "itemPrice": 80000}}, "navigate": true}}]]

REMEMBER: Most of your responses should NOT contain any action tags. Only use them when the user explicitly requests a calculation or navigation.

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

        chain = (
            {
                "context": lambda _: retrieved_context,
                "question": RunnablePassthrough(),
                "history": lambda _: history_str,
                "user_data": lambda _: user_data_str,
            }
            | prompt
            | self.llm
            | StrOutputParser()
        )

        print(f"Asking Azure OpenAI (4o-mini): {query}")
        return chain.invoke(query)


