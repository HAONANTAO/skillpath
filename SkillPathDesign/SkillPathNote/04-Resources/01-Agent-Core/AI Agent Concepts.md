# AI Agent Concepts

## What is an Agent
LLM + 自主决策 + 工具调用 + 执行行动
不是 chatbot，是能主动"做事"的系统

## Agent vs Chatbot
| | Chatbot | Agent |
|---|---|---|
| 行为 | 被动回答 | 主动决策 |
| 工具 | ❌ | ✅ |
| 多步骤 | ❌ | ✅ |
| 记忆 | 可选 | 可选 |

## Core Modules
- [[Tool Calling]]
- [[Memory Management]]
- [[Task Planning]]
- [[Multi-Agent]]

## ReAct Framework
Reason + Act 循环：
1. 思考下一步
2. 执行行动
3. 观察结果
4. 重复