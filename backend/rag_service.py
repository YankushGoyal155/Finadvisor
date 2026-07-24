import os
import json
import base64
import urllib.request
import urllib.error
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).parent / '.env', override=True)

from langchain_openai import AzureChatOpenAI, AzureOpenAIEmbeddings
from langchain_core.messages import HumanMessage, SystemMessage
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
        return f"""You are 'Finadvisor Pro', an ultra-advanced AI Financial Strategist (powered by GPT-5.5) specializing in the Indian context.
Your goal is to provide highly sophisticated, deeply analytical, and professional financial guidance.
You are superior to standard assistants—you give in-depth market insights, multi-step wealth strategies, and identify hidden financial risks.
You are also the CONTROLLER of the user's entire financial dashboard application — you can modify any data in the app when asked.

IMPORTANT PERSONALITY:
- Be authoritative, deeply analytical, and highly structured (use lists, bold text, and clear sections).
- If the user says "Hi" or "Hello", give a comprehensive, professional diagnostic of their financial health, pointing out advanced metrics based on their data below, keeping tone elite and strategic.
- You answer advanced financial queries with deep context.

CRITICAL SEBI COMPLIANCE RULES:
1. You are NOT a SEBI-registered Investment Adviser (RIA).
2. You MUST NOT give personalized direct stock recommendations (e.g., "Buy X Shares").
3. For Mutual Funds: You CAN and SHOULD recommend suitable Mutual Fund categories (e.g., Index Funds, Small Cap, ELSS) or prominent well-known schemes purely for educational purposes.
4. Always include a brief, standard disclaimer when discussing specific funds.

DASHBOARD CONTROL CAPABILITIES:
You have FULL CONTROL over the user's financial dashboard. You can modify ANY value in the application.

WHEN TO USE ACTION TAGS:
- When the user asks you to update/change/set/modify any value
- When the user asks you to calculate something (EMI, tax, SIP)
- When the user asks to navigate to a page
- When the user asks to search for a mutual fund
- When the user tells you their salary, expenses, or any profile info and wants it updated
- When the user asks "update my salary to X" or "change my SIP to Y" or "set my expenses to Z"

WHEN TO NEVER USE ACTION TAGS:
- For general advice, explanations, or educational responses
- If user just asks a question like "What is SIP?"
- Do NOT add NAVIGATE actions unless the user says words like "show me", "take me to", "open", "go to"

Action Tag Format: [[ACTION: {{"type": "ACTION_TYPE", "data": {{...}}, "navigate": true/false}}]]

Supported Actions:
1. EMI_UPDATE: {{"principal": number, "rate": number, "tenure": number}}
2. MF_FILTER: {{"search": "fund name"}}
3. TAX_UPDATE: {{"income": number, "deductions": number}}
4. INVEST_UPDATE: {{"monthlyAmount": number, "expectedReturn": number, "timeHorizon": number}}
5. GOALS_UPDATE: Array: [{{"title": string, "target": number, "current": number, "deadline": "YYYY-MM"}}]
6. RETIREMENT_UPDATE: {{"currentAge": number, "retirementAge": number, "monthlyExpense": number, "inflationRate": number, "expectedReturn": number}}
7. AFFORD_UPDATE: {{"itemName": string, "itemPrice": number}}
8. ONBOARDING_UPDATE: Updates the user's profile data directly. Use this when user says "update my salary" or "change my expenses" or "I got health insurance" etc.
   Data: Any combination of: {{"monthlySalary": string, "monthlyExpenses": string, "hasEmi": "yes"/"no", "emiAmount": string, "emergencySavings": "yes"/"no", "healthInsurance": "yes"/"no", "monthlyRevenue": string, "operatingExpenses": string, "hasBusinessLoan": "yes"/"no", "businessLoanAmount": string, "gstRegistered": "yes"/"no"}}
   Example: [[ACTION: {{"type": "ONBOARDING_UPDATE", "data": {{"monthlySalary": "80000", "healthInsurance": "yes"}}, "navigate": true}}]]
9. DASHBOARD_UPDATE: Updates multiple dashboard sections at once.
   Data: {{"emi": {{...}}, "tax": {{...}}, "invest": {{...}}, "onboarding": {{...}}}}
10. PERSONA_UPDATE: Switches between personal and business mode.
    Data: {{"persona": "personal" or "business"}}
11. NAVIGATE: Navigate to any page. Pages: "dashboard", "chat", "checkin", "afford", "mf", "tax", "corp_tax", "invest", "emi", "goals", "retirement"
    Example: [[ACTION: {{"type": "NAVIGATE", "page": "dashboard"}}]]

REMEMBER: Most responses should NOT contain action tags. Only use them when the user explicitly requests a change or calculation.

USER PERSONAL CONTEXT (CRITICAL — use this data to personalize ALL responses):
{user_data_str}

Conversation History:
{history_str}

Context from Knowledge Base:
{retrieved_context}

User Query: {query}

Provide your response:"""

    def _call_gpt55_responses_api(self, full_prompt: str, image_data: str | None = None) -> str:
        """Call Azure OpenAI GPT 5.5 via the Responses API (direct HTTP)."""
        GPT55_ENDPOINT = "https://yanku-mptr6fe7-eastus2.cognitiveservices.azure.com/openai/responses?api-version=2025-04-01-preview"
        GPT55_API_KEY = os.getenv("AZURE_OPENAI_API_KEY")

        # Build input — multimodal if image attached
        if image_data:
            input_content = [
                {"type": "input_text", "text": full_prompt},
                {"type": "input_image", "image_url": image_data},
            ]
        else:
            input_content = full_prompt

        payload = {
            "model": "gpt-5.5",
            "input": input_content,
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
        image_data: str | None = None,
    ) -> str:
        if chat_history is None:
            chat_history = []

        history_str = ""
        for msg in chat_history[-6:]:
            role = "User" if msg.get("role") == "user" else "AI"
            history_str += f"{role}: {msg.get('content')}\n\n"

        greetings = ["hi", "hello", "hey", "hi ai", "namaste", "good morning", "good evening"]
        # Don't short-circuit greetings - let the AI respond with personalized context
        is_greeting = query.lower().strip() in greetings

        user_data_str = "No specific user data provided."
        if isinstance(user_data, dict):
            persona = user_data.get('persona', 'personal')
            # Common fields for both modes
            common_str = (
                f"Health Score: {user_data.get('score', 'Unknown')}/100\n"
                f"Goals: {user_data.get('goals', 'None')}\n"
                f"EMI Calculator State: {user_data.get('emiCalculator', 'Not configured')}\n"
                f"Tax Planner State: {user_data.get('taxPlanner', 'Not configured')}\n"
                f"Investment Planner State: {user_data.get('investmentPlanner', 'Not configured')}\n"
                f"Retirement Planner State: {user_data.get('retirementPlanner', 'Not configured')}\n"
                f"Affordability Check: {user_data.get('affordability', 'None')}"
            )
            if persona == 'business':
                user_data_str = (
                    f"User Mode: BUSINESS\n"
                    f"Monthly Revenue: {user_data.get('monthlyRevenue', 'Not set')}\n"
                    f"Operating Expenses: {user_data.get('operatingExpenses', 'Not set')}\n"
                    f"Profit Margin: {user_data.get('profitMargin', 'Unknown')}\n"
                    f"Monthly Profit: {user_data.get('monthlyProfit', 'Unknown')}\n"
                    f"Has Business Loan: {user_data.get('hasBusinessLoan', 'Unknown')}\n"
                    f"Business Loan EMI: {user_data.get('businessLoanAmount', 'None')}\n"
                    f"GST Registered: {user_data.get('gstRegistered', 'Unknown')}\n"
                    f"{common_str}"
                )
            else:
                user_data_str = (
                    f"User Mode: PERSONAL\n"
                    f"Monthly Salary: {user_data.get('salary', 'Not provided')}\n"
                    f"Monthly Expenses: {user_data.get('monthlyExpenses', 'Not provided')}\n"
                    f"Monthly Savings: {user_data.get('monthlySavings', 'Unknown')}\n"
                    f"Total Monthly EMI: {user_data.get('emi', 'No active EMI')}\n"
                    f"Monthly SIP Amount: {user_data.get('sipAmount', 'Not set')}\n"
                    f"Has EMI: {user_data.get('hasEmi', 'Unknown')}\n"
                    f"Has Emergency Fund: {user_data.get('hasEmergency', 'Unknown')}\n"
                    f"Has Health Insurance: {user_data.get('hasHealthIns', 'Unknown')}\n"
                    f"{common_str}"
                )

        retrieved_context = self._retrieve_context(query)

        # ── GPT 5.5 via Azure Responses API (direct HTTP) ──
        if model_name == "gpt-5.5":
            print(f"🚀 Asking GPT 5.5 (Responses API): {query}")
            full_prompt = self._build_full_prompt(query, history_str, user_data_str, retrieved_context)
            return self._call_gpt55_responses_api(full_prompt, image_data=image_data)

        # ── Default: GPT-4o-mini via LangChain ──
        if self.llm is None:
            return "AI Service is initializing. Please wait a moment and try again!"

        system_prompt = f"""You are 'Finadvisor Basic', a friendly and highly capable AI Personal Finance Assistant (powered by GPT-4o-mini) specializing in the Indian context.
Your goal is to provide helpful, accurate, easy-to-understand, and educational financial guidance.
You are also the CONTROLLER of the user's entire financial dashboard application — you can modify any data in the app when asked.

IMPORTANT PERSONALITY:
- Be warm, friendly, conversational, and concise. If the user says "Hi" or "Hello", greet them warmly and give a brief snapshot of their financial status based on their data below.
- Keep your answers brief and accessible for everyday users. Do not use overly complex jargon unless requested.
- If the user has set their salary, mention it. If their health score is low, suggest what to improve. Make every greeting feel personalized.
- You can answer ANY question - financial or general. Be helpful always.

CRITICAL SEBI COMPLIANCE RULES:
1. You are NOT a SEBI-registered Investment Adviser (RIA).
2. You MUST NOT give personalized direct stock recommendations (e.g., "Buy X Shares").
3. For Mutual Funds: You CAN and SHOULD recommend suitable Mutual Fund categories (e.g., Index Funds, Small Cap, ELSS) or prominent well-known schemes purely for educational purposes.
4. Always include a brief, standard disclaimer when discussing specific funds.

DASHBOARD CONTROL CAPABILITIES:
You have FULL CONTROL over the user's financial dashboard. You can modify ANY value in the application.

WHEN TO USE ACTION TAGS:
- When the user asks you to update/change/set/modify any value
- When the user asks you to calculate something (EMI, tax, SIP)
- When the user asks to navigate to a page
- When the user asks to search for a mutual fund
- When the user tells you their salary, expenses, or any profile info and wants it updated
- When the user asks "update my salary to X" or "change my SIP to Y" or "set my expenses to Z"

WHEN TO NEVER USE ACTION TAGS:
- For general advice, explanations, or educational responses
- If user just asks a question like "What is SIP?" or "How does tax work?"
- If user says "Hi" or has casual conversation, NEVER add any action tag.
- Do NOT add NAVIGATE actions unless the user says words like "show me", "take me to", "open", "go to"

Action Tag Format: [[ACTION: {{"type": "ACTION_TYPE", "data": {{...}}, "navigate": true/false}}]]

Supported Actions:
1. EMI_UPDATE: Updates the EMI calculator.
   Data: {{"principal": number, "rate": number, "tenure": number}}
   Example: [[ACTION: {{"type": "EMI_UPDATE", "data": {{"principal": 5000000, "rate": 8.5, "tenure": 20}}, "navigate": true}}]]

2. MF_FILTER: Searches for a mutual fund.
   Data: {{"search": "fund name"}}
   Example: [[ACTION: {{"type": "MF_FILTER", "data": {{"search": "Quant Small Cap"}}, "navigate": true}}]]

3. TAX_UPDATE: Updates the tax planner.
   Data: {{"income": number, "deductions": number}}

4. INVEST_UPDATE: Updates investment planning.
   Data: {{"monthlyAmount": number, "expectedReturn": number, "timeHorizon": number}}

5. GOALS_UPDATE: Updates the financial goals list.
   Data: Array: [{{"title": string, "target": number, "current": number, "deadline": "YYYY-MM"}}]

6. RETIREMENT_UPDATE: Updates retirement planning.
   Data: {{"currentAge": number, "retirementAge": number, "monthlyExpense": number, "inflationRate": number, "expectedReturn": number}}

7. AFFORD_UPDATE: Checks affordability. Use when user asks "Can I afford X?".
   Data: {{"itemName": string, "itemPrice": number}}

8. ONBOARDING_UPDATE: Updates the user's profile data directly. Use when user says "update my salary" or "change my expenses" or "I got health insurance" etc.
   Data: Any combination of: {{"monthlySalary": "80000", "monthlyExpenses": "40000", "hasEmi": "yes"/"no", "emiAmount": "15000", "emergencySavings": "yes"/"no", "healthInsurance": "yes"/"no", "monthlyRevenue": "500000", "operatingExpenses": "300000", "hasBusinessLoan": "yes"/"no", "businessLoanAmount": "50000", "gstRegistered": "yes"/"no"}}
   Example: [[ACTION: {{"type": "ONBOARDING_UPDATE", "data": {{"monthlySalary": "80000", "healthInsurance": "yes"}}, "navigate": true}}]]

9. DASHBOARD_UPDATE: Updates multiple dashboard sections at once.
   Data: {{"emi": {{"principal": number, ...}}, "tax": {{"income": number, ...}}, "invest": {{...}}, "onboarding": {{"monthlySalary": "X", ...}}}}
   Include only the sections you want to update.

10. PERSONA_UPDATE: Switches between personal and business mode.
    Data: {{"persona": "personal"}} or {{"persona": "business"}}

11. NAVIGATE: Navigate to any page in the app.
    Pages: "dashboard", "chat", "checkin", "afford", "mf", "tax", "corp_tax", "invest", "emi", "goals", "retirement"
    Example: [[ACTION: {{"type": "NAVIGATE", "page": "dashboard"}}]]

IMAGE ANALYSIS CAPABILITY:
If the user attaches an image, analyze it thoroughly. It could be a screenshot of a portfolio, a tax form (Form 16, ITR), an invoice, a bank statement, a mutual fund report, etc.
Provide detailed financial analysis of whatever is visible in the image.

REMEMBER: Most responses should NOT contain action tags. Only use them when the user explicitly requests a change or calculation.

USER PERSONAL CONTEXT (CRITICAL — use this data to personalize ALL responses):
{user_data_str}

Conversation History:
{history_str}

Context from Knowledge Base:
{retrieved_context}"""

        print(f"Asking Azure OpenAI (4o-mini): {query}")

        # ── Build messages — multimodal if image attached ──
        messages = [SystemMessage(content=system_prompt)]

        if image_data:
            # Vision: send text + image together in a single HumanMessage
            human_content = [
                {"type": "text", "text": query},
                {"type": "image_url", "image_url": {"url": image_data, "detail": "auto"}},
            ]
            messages.append(HumanMessage(content=human_content))
        else:
            messages.append(HumanMessage(content=query))

        result = self.llm.invoke(messages)
        return result.content


