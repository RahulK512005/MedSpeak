from query_engine import ConsultationQueryEngine

# Initialize and load index
engine = ConsultationQueryEngine()
engine.load_index()

# Test query
print("\n" + "="*60)
print("Testing Query Engine")
print("="*60)

question = "What are the common symptoms across all patients?"
print(f"\nQuestion: {question}")
print("-"*60)

answer = engine.query(question)
print(f"Answer: {answer}")
print("-"*60)

print("\n[SUCCESS] Query engine is working!")
print("[NOTE] Using mock LLM - for real AI responses, add OPENAI_API_KEY to .env")
