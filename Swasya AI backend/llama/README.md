# LlamaIndex Consultation Query Engine

Semantic search and AI summarization over MongoDB consultation data using LlamaIndex.

## Setup

```bash
cd "Swasya AI backend/llama"
pip install -r requirements.txt
```

## Configuration

Currently using **mock LLM/embeddings** (no API key needed).

The mock LLM returns context from the database but doesn't generate AI summaries.

**For real AI responses**, you need:
- OpenAI API key with active quota/credits
- Modify `query_engine.py` to enable OpenAI integration

Get OpenAI API key: https://platform.openai.com/api-keys

## Usage

### Quick Demo (Recommended)
```bash
python run_demo.py
```

### Interactive Mode
```bash
python demo.py
```

### Quick Test
```bash
python test_query.py
```

### Build Index & CLI
```bash
python query_engine.py
```

### Programmatic Usage
```python
from query_engine import ConsultationQueryEngine

engine = ConsultationQueryEngine()
engine.load_index()  # or engine.build_index() to rebuild

answer = engine.query("What are the most common symptoms?")
print(answer)
```

## Features

- ✅ Loads consultations from MongoDB with patient details
- ✅ Builds vector index for semantic search
- ✅ Persists index locally (no rebuild needed)
- ✅ Uses Gemini API for LLM responses
- ✅ Interactive CLI for ad-hoc queries
- ✅ Programmatic API for integration

## Example Queries

- "What symptoms are most frequent across all patients?"
- "Summarize Rajesh Kumar's last 3 visits."
- "Which medications were prescribed for fever cases?"
- "List all patients with respiratory issues"
- "What are common prescriptions for elderly patients?"

## Index Storage

Index is saved to `./llama_index_storage/` and persists across runs. Rebuild when consultation data changes.
