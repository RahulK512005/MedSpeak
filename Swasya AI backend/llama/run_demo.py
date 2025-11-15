from query_engine import ConsultationQueryEngine

# Initialize engine
print("Initializing LlamaIndex Query Engine...")
engine = ConsultationQueryEngine()
engine.load_index()

print("\n" + "="*70)
print("SWASYA AI - CONSULTATION QUERY ENGINE DEMO")
print("="*70)

# Demo queries
queries = [
    "What are the common symptoms across all patients?",
    "List all patients with fever",
    "Show me consultations for AKASH",
    "What are the patient ages?"
]

for i, question in enumerate(queries, 1):
    print(f"\n[Query {i}] {question}")
    print("-" * 70)
    answer = engine.query(question)
    print(answer)
    print("-" * 70)

print("\n[SUCCESS] Demo completed!")
