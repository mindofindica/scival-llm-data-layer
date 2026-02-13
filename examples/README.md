# Examples

This directory contains demonstration scripts showing different ways to use the SciVal LLM Data Layer.

## Quick Start

Make sure the API server is running first:

```bash
npm run dev
# Server starts on http://localhost:3000
```

Then run any example in a new terminal:

```bash
npx tsx examples/<script-name>.ts
```

---

## Available Demos

### 1. `client-demo.ts` - Basic API Usage

**What it shows:** Direct API calls without LLM involvement

**Use case:** Understanding the API endpoints and query patterns

**Run:**
```bash
npx tsx examples/client-demo.ts
```

**Examples:**
- Search for entities
- Compare two entities
- Get trends and rankings
- Batch queries
- Complex analytical scenarios

**No dependencies:** Works immediately, no API keys needed

---

### 2. `simulated-demo.ts` - LLM Conversation Simulation ⭐

**What it shows:** What an LLM conversation looks like using the data layer

**Use case:** **Perfect for presentations and brainstorms** — shows the full flow without requiring API keys

**Run:**
```bash
npx tsx examples/simulated-demo.ts
```

**Features:**
- Real function calls with live data
- Simulated LLM reasoning (what the AI would think/say)
- Beautiful formatted output
- 4 realistic scenarios:
  1. Simple ranking query
  2. Institutional comparison (multi-step)
  3. Trend analysis
  4. Finding collaboration opportunities

**Why use this:** 
- No OpenAI/Anthropic API key required
- Runs in ~30 seconds
- Shows exactly how LLMs would use the API
- Great for demos to stakeholders

---

### 3. `llm-demo.ts` - Live OpenAI Integration

**What it shows:** Actual GPT-4 using the data layer via function calling

**Use case:** Proving the integration works with real LLM providers

**Run:**
```bash
OPENAI_API_KEY=sk-... npx tsx examples/llm-demo.ts
```

**Features:**
- Real OpenAI API calls
- Automatic function calling
- 3 test scenarios with different query types
- Shows complete request/response flow

**Requirements:**
- OpenAI API key
- ~$0.05 cost to run all scenarios

---

## Which Demo Should I Use?

| Use Case | Demo Script | API Key? |
|----------|-------------|----------|
| **Quick test** | `client-demo.ts` | No |
| **Presenting to team** | `simulated-demo.ts` ⭐ | No |
| **Technical proof** | `llm-demo.ts` | Yes (OpenAI) |
| **Learning the API** | `client-demo.ts` | No |
| **Brainstorm/Standup** | `simulated-demo.ts` ⭐ | No |

---

## Sample Output

### Simulated Demo (No API Key)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 Scenario 1: Simple Ranking Query
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 User: "Who is the most cited author in the database?"

🤖 Assistant (thinking): I need to call getTopEntities()
📋 Parameters:
    {
      "entityType": "author",
      "metric": "citations",
      "limit": 1
    }

⚙️  Executing query...
📊 Result:
    [
      {
        "id": "auth_002",
        "name": "Dr. Michael Zhang",
        "affiliation": "Stanford University",
        "metrics": {
          "publications": 250,
          "citations": 45000,
          ...
        }
      }
    ]

💬 Assistant: Based on the data, **Dr. Michael Zhang** from Stanford University 
is the most cited author with **45,000 citations**...
```

---

## Adding Your Own Examples

1. Create `examples/your-example.ts`
2. Import helper functions from existing demos
3. Use the API endpoints documented in `../DEMO.md`
4. Test with `npx tsx examples/your-example.ts`

---

## Tips for Demos

**For brainstorms/presentations:**
- Use `simulated-demo.ts` — it's visual, fast, and requires no setup
- Run it beforehand to make sure the server is working
- You can modify the scenarios in the script to match your talking points

**For technical validation:**
- Use `llm-demo.ts` with a real API key
- Shows the integration actually works
- Good for skeptical engineers or security reviews

**For learning:**
- Start with `client-demo.ts`
- Simple, linear, shows all query types
- Good reference for building your own clients
