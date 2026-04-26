# MCP — Model Context Protocol

## What is it
An open standard by Anthropic that lets AI models
connect to external tools and data sources in a
standardized way.
Think of it as "USB for AI tools" — plug any tool
into any AI model.

## Why it's a big deal
Before MCP: every app built custom integrations.
After MCP: one protocol, works everywhere.
Claude, GPT, Gemini can all use the same MCP server.

## How it works
AI Model ←→ MCP Client ←→ MCP Server ←→ Tool/Data

MCP Server exposes: Tools, Resources, Prompts

## You already use it
Claude Code runs on MCP.
Every tool Claude Code uses (file read, bash, etc)
is an MCP tool call under the hood.

## In SkillPath (future)
Could expose SkillPath as an MCP server:
- get_user_progress tool
- get_weak_points tool
- generate_quiz tool
Any AI assistant could then use SkillPath's data.

## Links
[[Tool Calling]]
[[AI Agent Concepts]]