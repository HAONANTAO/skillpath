# SSE Streaming (Server-Sent Events)

## What is it
A way to push data from server to client in real-time,
over a single HTTP connection.
One-directional: server → client only.

## Why use SSE for AI
LLM responses are slow (2-10 seconds).
Without streaming: user stares at blank screen.
With streaming: user sees tokens appear in real-time.
Much better UX — feels alive and responsive.

## SSE vs WebSocket
| | SSE | WebSocket |
|---|---|---|
| Direction | One-way | Two-way |
| Complexity | Simple | Complex |
| Reconnection | Auto | Manual |
| Use case | AI streaming | Chat, games |

SSE is perfect for AI — we only need server → client.

## How it works

### Server (Express)
```javascript
res.setHeader('Content-Type', 'text/event-stream')
res.setHeader('Cache-Control', 'no-cache')
res.setHeader('Connection', 'keep-alive')

// Send data
res.write(`data: ${JSON.stringify(chunk)}\n\n`)

// End stream
res.write('data: [DONE]\n\n')
res.end()
```

### Client (React)
```javascript
const eventSource = new EventSource('/api/stream')

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data)
  if (data === '[DONE]') {
    eventSource.close()
    return
  }
  setContent(prev => prev + data.token)
}
```

## In SkillPath
Each LangGraph node streams its status:
- "Planning your roadmap..."
- "Searching for resources..."
- "Generating quiz questions..."
- "Evaluating your answers..."

User sees the Agent thinking in real-time.
This is a major UX differentiator.

## Already used in DocuMind
Same pattern, different content.
DocuMind streams LLM response tokens.
SkillPath streams Agent node status + tokens.

## Links
[[AI Agent Concepts]]
[[LangGraph]]