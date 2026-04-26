# SkillPath · Progress Tracker

## Design Phase
- [x] Design System
- [x] Landing Page
- [x] Login Page
- [ ] Roadmap Generator
- [ ] Learning Node
- [ ] Quiz Page
- [ ] Dashboard

## Development Phase
- [ ] Week 1 · Project Setup
- [ ] Week 2 · Planner Node
- [ ] Week 3 · Researcher Node
- [ ] Week 4 · Quiz + Memory
- [ ] Week 5 · Cost Control
- [ ] Week 6 · Dashboard
- [ ] Week 7 · Launch

## Stats
```dataview
TABLE length(filter(file.tasks, (t) => t.completed)) AS "Done",
length(filter(file.tasks, (t) => !t.completed)) AS "Remaining"
FROM "00-Overview"
```