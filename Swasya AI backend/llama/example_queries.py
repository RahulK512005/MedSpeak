from query_engine import ConsultationQueryEngine

# Initialize engine
engine = ConsultationQueryEngine()
engine.load_index()

# Example queries
queries = [
    "What symptoms are most frequent across all patients?",
    "Summarize Rajesh Kumar's last 3 visits.",
    "Which medications were prescribed for fever cases?",
    "List all patients with respiratory issues",
    "What are the common prescriptions for elderly patients?"
]

print("="*60)
print("Running Example Queries")
print("="*60)

for q in queries:
    print(f"\n❓ {q}")
    print("-"*60)
    answer = engine.query(q)
    print(answer)
    print("-"*60)
