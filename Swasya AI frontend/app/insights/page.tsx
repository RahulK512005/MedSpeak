"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Sparkles } from "lucide-react";

export default function InsightsPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const examples = [
    "What are the common symptoms across all patients?",
    "List all patients with fever",
    "Show me consultations for AKASH",
    "What medications were prescribed?",
    "Summarize recent consultations"
  ];

  const handleQuery = async (q: string) => {
    setLoading(true);
    setError("");
    setAnswer("");
    setQuestion(q);

    try {
      const response = await fetch("http://localhost:5000/api/llama/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q })
      });

      const data = await response.json();

      if (data.success) {
        setAnswer(data.answer);
      } else {
        setError(data.error || "Query failed");
      }
    } catch (err: any) {
      setError(err.message || "Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          AI Insights Dashboard
        </h1>
        <p className="text-muted-foreground">
          Query your consultation data using natural language
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Ask a Question</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="e.g., What are the common symptoms?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleQuery(question)}
              disabled={loading}
            />
            <Button 
              onClick={() => handleQuery(question)} 
              disabled={loading || !question.trim()}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="mt-4">
            <p className="text-sm text-muted-foreground mb-2">Try these examples:</p>
            <div className="flex flex-wrap gap-2">
              {examples.map((ex, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuery(ex)}
                  disabled={loading}
                >
                  {ex}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <Card>
          <CardContent className="py-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground">Analyzing consultations...</p>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-destructive">
          <CardContent className="py-6">
            <p className="text-destructive font-medium">Error: {error}</p>
          </CardContent>
        </Card>
      )}

      {answer && !loading && (
        <Card>
          <CardHeader>
            <CardTitle>Answer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap bg-muted p-4 rounded-lg">
              {answer}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
