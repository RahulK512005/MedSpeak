$body = @{
    text = "Artificial intelligence is transforming healthcare"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/gemini/summarize" -Method POST -ContentType "application/json" -Body $body
