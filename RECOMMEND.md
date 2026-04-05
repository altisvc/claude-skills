# Get Personalized Skill Recommendations

Paste this prompt into your Claude Code session to get recommendations tailored to your project.

---

```
Fetch the skills registry from https://altis-primary-marketplace.vercel.app/api/skills and analyze my project to recommend which skills would be most valuable.

Scan my setup:
- Read CLAUDE.md if it exists
- List .claude/ directory structure (agents, skills, commands, hooks)
- Check integrations: look at package.json, env files, MCP configs, and import statements for Slack, Trello, Google Calendar, Gmail, GitHub, Supabase, HubSpot, or similar
- Identify existing workflows: check-in routines, session wrap, meeting sync, advisor personas, task tracking, content pipelines

For each registry entry, evaluate:
- Do I have the integrations it requires?
- Does it fill a workflow gap?
- Does it improve something I do manually?
- Does it depend on skills I already have?

Return top 5 recommendations ranked by impact. For each:
- **Name** — one-line description
- **Why it fits** — reference specific things you found in my project
- **What it replaces** — the manual process or gap it addresses
- **Install prompt** — copy-paste ready from the registry entry

Skip anything I already have a working version of.

Full catalog: https://altis-primary-marketplace.vercel.app
```
