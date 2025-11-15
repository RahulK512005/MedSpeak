import os
from dotenv import load_dotenv
from pymongo import MongoClient
from llama_index.core import Document, VectorStoreIndex
from llama_index.llms.anthropic import Anthropic
from llama_index.core import Settings

load_dotenv("Swasya AI backend/.env")

# Configure Claude 4.5
Settings.llm = Anthropic(model="claude-3-5-sonnet-20241022", api_key=os.getenv("ANTHROPIC_API_KEY", ""))

# Connect to MongoDB
client = MongoClient(os.getenv("MONGO_URI"))
db = client.get_database()
consultations = db["consultations"]

# Load consultation records
records = list(consultations.find())
print(f"Loaded {len(records)} consultation records")

# Build documents for LlamaIndex
documents = [
    Document(
        text=f"UHID: {r.get('uhid', 'N/A')}\nName: {r.get('name', 'N/A')}\nAge: {r.get('age', 'N/A')}\n"
             f"Summary: {r.get('summary', r.get('aiSummary', 'N/A'))}\n"
             f"Transcript: {r.get('transcript', 'N/A')}\n"
             f"Prescriptions: {r.get('prescriptions', r.get('prescriptionData', 'N/A'))}",
        metadata={"uhid": r.get("uhid"), "name": r.get("name")}
    )
    for r in records
]

# Build index
index = VectorStoreIndex.from_documents(documents)
query_engine = index.as_query_engine()

# Query examples
queries = [
    "Summarize all prescriptions for UHID MED2024002",
    "List common symptoms mentioned across last 5 consultations"
]

for query in queries:
    print(f"\n{'='*60}\nQuery: {query}\n{'='*60}")
    response = query_engine.query(query)
    print(response)
