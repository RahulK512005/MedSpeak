from query_engine import ConsultationQueryEngine

# Initialize engine
print("Initializing LlamaIndex Query Engine...")
engine = ConsultationQueryEngine()
engine.load_index()

print("\n" + "="*70)
print("SWASYA AI - CONSULTATION QUERY ENGINE")
print("="*70)
print("\nExample queries you can try:")
print("  1. What are the common symptoms across all patients?")
print("  2. List all patients with fever")
print("  3. Show me consultations for AKASH")
print("  4. What medications were prescribed?")
print("  5. Summarize recent consultations")
print("\nType 'quit' to exit\n")
print("="*70)

while True:
    question = input("\n💬 Your question: ").strip()
    
    if question.lower() in ['quit', 'exit', 'q']:
        print("\n👋 Goodbye!")
        break
    
    if not question:
        continue
    
    print("\n🔍 Searching consultations...")
    answer = engine.query(question)
    print("\n📋 Answer:")
    print("-" * 70)
    print(answer)
    print("-" * 70)
