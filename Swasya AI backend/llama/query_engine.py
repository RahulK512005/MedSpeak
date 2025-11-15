import os
import json
from dotenv import load_dotenv
from pymongo import MongoClient
from llama_index.core import Document, VectorStoreIndex, StorageContext, load_index_from_storage
from llama_index.core import Settings, MockEmbedding
from llama_index.core.llms import MockLLM
import re

load_dotenv()

# Use mock models (no API key needed)
Settings.embed_model = MockEmbedding(embed_dim=384)
Settings.llm = MockLLM()
Settings.chunk_size = 512

# Only print if not in API mode
if __name__ == "__main__":
    print("[INFO] Using mock LLM/embeddings (no API key needed)")
    print("[TIP] For real AI: Add OPENAI_API_KEY with active quota to .env")

class ConsultationQueryEngine:
    def __init__(self, index_path="./llama_index_storage", silent=False):
        self.index_path = index_path
        self.silent = silent
        mongo_uri = os.getenv("MONGO_URI")
        self.client = MongoClient(mongo_uri)
        db_name = mongo_uri.split('/')[-1].split('?')[0] or "test"
        self.db = self.client[db_name]
        self.index = None
        self.query_engine = None
    
    def _print(self, msg):
        if not self.silent:
            print(msg)
    
    def load_consultations(self):
        """Load consultations with patient details from MongoDB"""
        pipeline = [
            {
                "$lookup": {
                    "from": "patients",
                    "localField": "patientId",
                    "foreignField": "_id",
                    "as": "patient"
                }
            },
            {"$unwind": {"path": "$patient", "preserveNullAndEmptyArrays": True}}
        ]
        
        consultations = list(self.db["consultations"].aggregate(pipeline))
        self._print(f"[OK] Loaded {len(consultations)} consultations from MongoDB")
        return consultations
    
    def build_index(self):
        """Build LlamaIndex from consultation records"""
        consultations = self.load_consultations()
        
        documents = []
        for c in consultations:
            patient = c.get("patient", {})
            text = f"""
Patient: {patient.get('name', 'Unknown')}
UHID: {patient.get('uhid', 'N/A')}
Age: {patient.get('age', 'N/A')}
Gender: {patient.get('gender', 'N/A')}
Date: {c.get('date', 'N/A')}
Transcript: {c.get('transcript', 'N/A')}
Summary: {c.get('aiSummary', 'N/A')}
Prescriptions: {json.dumps(c.get('prescriptionData', {}))}
Doctor Notes: {c.get('doctorNotes', 'N/A')}
""".strip()
            
            documents.append(Document(
                text=text,
                metadata={
                    "uhid": patient.get("uhid"),
                    "patient_name": patient.get("name"),
                    "age": patient.get("age"),
                    "date": str(c.get("date"))
                }
            ))
        
        self.index = VectorStoreIndex.from_documents(documents)
        self.index.storage_context.persist(persist_dir=self.index_path)
        self._print(f"[OK] Index built and saved to {self.index_path}")
        self.query_engine = self.index.as_query_engine()
    
    def load_index(self):
        """Load existing index from disk"""
        try:
            storage_context = StorageContext.from_defaults(persist_dir=self.index_path)
            self.index = load_index_from_storage(storage_context)
            self.query_engine = self.index.as_query_engine()
            self._print(f"[OK] Index loaded from {self.index_path}")
        except:
            self._print("[WARN] No existing index found. Building new index...")
            self.build_index()
    
    def query(self, question):
        """Query the consultation data"""
        if not self.query_engine:
            self.load_index()
        
        response = self.query_engine.query(question)
        
        # If using mock LLM, generate a simple summary from context
        if isinstance(Settings.llm, MockLLM):
            return self._generate_simple_answer(str(response), question)
        
        return str(response)
    
    def _generate_simple_answer(self, context, question):
        """Generate a simple answer from context when using mock LLM"""
        # Extract patient data from context
        lines = context.split('\n')
        patients = []
        current_patient = {}
        
        for line in lines:
            if 'Patient:' in line:
                if current_patient:
                    patients.append(current_patient)
                current_patient = {'name': line.split('Patient:')[1].strip()}
            elif 'Age:' in line and current_patient:
                current_patient['age'] = line.split('Age:')[1].strip()
            elif 'Transcript:' in line and current_patient:
                current_patient['transcript'] = line.split('Transcript:')[1].strip()
            elif 'Summary:' in line and current_patient:
                current_patient['summary'] = line.split('Summary:')[1].strip()
        
        if current_patient:
            patients.append(current_patient)
        
        # Generate answer based on question type
        q_lower = question.lower()
        
        if 'symptom' in q_lower or 'complaint' in q_lower:
            symptoms = []
            for p in patients:
                if 'transcript' in p:
                    symptoms.append(f"{p.get('name', 'Unknown')}: {p['transcript']}")
            return f"Found {len(patients)} patient(s) with symptoms:\n" + "\n".join(symptoms)
        
        elif 'medication' in q_lower or 'prescription' in q_lower:
            return f"Found {len(patients)} consultation(s). Check prescriptions in the context above."
        
        elif 'patient' in q_lower and any(name in question for p in patients for name in [p.get('name', '')]):
            return f"Found {len(patients)} consultation(s) for the requested patient(s). Details shown above."
        
        else:
            return f"Found {len(patients)} relevant consultation(s). Summary:\n" + "\n".join(
                [f"- {p.get('name', 'Unknown')} (Age {p.get('age', 'N/A')}): {p.get('transcript', 'No details')[:100]}" 
                 for p in patients[:3]]
            )

def main():
    engine = ConsultationQueryEngine()
    
    # Build or load index
    if os.path.exists(engine.index_path):
        choice = input("Index exists. Rebuild? (y/n): ").lower()
        if choice == 'y':
            engine.build_index()
        else:
            engine.load_index()
    else:
        engine.build_index()
    
    # Interactive query loop
    print("\n" + "="*60)
    print("Consultation Query Engine Ready")
    print("[NOTE] Using mock LLM - responses will be generic")
    print("[TIP] Add OPENAI_API_KEY to .env for real AI responses")
    print("="*60)
    
    while True:
        question = input("\nAsk a question (or 'quit' to exit): ").strip()
        if question.lower() in ['quit', 'exit', 'q']:
            break
        
        if question:
            print("\nAnswer:")
            print("-" * 60)
            answer = engine.query(question)
            print(answer)
            print("-" * 60)

if __name__ == "__main__":
    main()
