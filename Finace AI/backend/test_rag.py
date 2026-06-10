from rag_service import RAGFinanceService

try:
    service = RAGFinanceService()
    print("Service initialized.")
    response = service.get_financial_advice("hi")
    print(f"Response: {response}")
except Exception as e:
    print(f"Error: {e}")
