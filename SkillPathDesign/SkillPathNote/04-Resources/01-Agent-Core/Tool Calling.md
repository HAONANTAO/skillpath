# Tool Calling

## What is it
The mechanism that allows an LLM Agent to interact 
with the outside world — calling APIs, searching the web, 
reading databases, executing code, and more.

Without tool calling, an LLM can only generate text.
With tool calling, it can take real actions.

## How it works
1. User sends a request to the Agent
2. LLM decides whether a tool is needed
3. LLM generates the tool name + parameters (JSON)
4. System executes the tool call
5. Result is returned to the LLM
6. LLM uses the result to generate final response

## Types of Tools
- **Search tools** — Tavily, Google Search, Bing
- **API tools** — Weather, GitHub, Calendar, Email
- **Database tools** — Query MongoDB, Pinecone lookup
- **Code execution** — Run Python, execute shell commands
- **File tools** — Read/write files, parse PDFs

## OpenAI Function Calling
The standard way to implement tool calling with GPT models.
You define a JSON schema for each tool, and the model
decides when and how to call it.

```json