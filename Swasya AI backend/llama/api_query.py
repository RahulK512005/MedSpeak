import sys
import json
import os
from query_engine import ConsultationQueryEngine

# Suppress all print statements from query_engine
class SuppressPrint:
    def __enter__(self):
        self._original_stdout = sys.stdout
        self._original_stderr = sys.stderr
        sys.stdout = open(os.devnull, 'w')
        sys.stderr = open(os.devnull, 'w')
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        sys.stdout.close()
        sys.stderr.close()
        sys.stdout = self._original_stdout
        sys.stderr = self._original_stderr

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No question provided"}))
        sys.exit(1)
    
    question = sys.argv[1]
    
    try:
        engine = ConsultationQueryEngine(silent=True)
        engine.load_index()
        answer = engine.query(question)
        
        result = {
            "success": True,
            "question": question,
            "answer": answer
        }
        
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": str(e)
        }))
        sys.exit(1)

if __name__ == "__main__":
    main()
