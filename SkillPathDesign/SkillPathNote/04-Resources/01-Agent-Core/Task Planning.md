# Task Planning

## What is it
The ability of an Agent to break down a complex goal
into smaller, manageable steps — and decide the order
and method of execution.

## Planning Strategies

### Chain of Thought (CoT)
Ask the LLM to think step by step before answering.
"Let's think step by step..."
Improves reasoning quality significantly.

### ReAct (Reason + Act)
The most common Agent pattern.
Loop: Think → Act → Observe → Repeat

1. **Reason**: What do I need to do next?
2. **Act**: Execute a tool or take an action
3. **Observe**: What was the result?
4. **Repeat**: Until goal is achieved

### Tree of Thought
Explore multiple reasoning paths simultaneously.
More powerful but more expensive.
Used for complex problems with many possible solutions.

### Task Decomposition
Break a large task into subtasks.
Each subtask can be handled by a different node or agent.

Example in SkillPath:
"Learn React in 14 days"
→ Day 1: JSX basics
→ Day 2: Props and State
→ Day 3: useEffect
→ ...

## In LangGraph
Each planning step is a Node in the state machine.
Conditional Edges decide which node runs next.
The graph structure IS the plan.

## In SkillPath
1. User inputs topic + goal + time
2. Planner Node breaks it into daily learning nodes
3. Each node gets resources assigned
4. Quiz evaluates completion
5. Evaluator decides: advance or retry

## Key Insight
Planning is what makes an Agent autonomous.
Without planning, you just have a fancy chatbot
that needs hand-holding for every step.

## Links
[[AI Agent Concepts]]
[[LangGraph]]
[[Tool Calling]]