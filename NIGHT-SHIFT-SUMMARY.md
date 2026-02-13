# Night Shift Summary - SciVal LLM Data Layer PoC

**Date:** 2026-02-12/13 (Night shift session 1)  
**Duration:** ~1.5 hours  
**Status:** ✅ Complete

## What I Built

A production-quality proof-of-concept demonstrating how to expose SciVal research analytics data to Large Language Models via structured function calling interfaces.

## Repository

**GitHub:** https://github.com/mindofindica/scival-llm-data-layer

## Key Components

### 1. Core Query Functions (6 total)

All functions use Zod schemas for validation and OpenAI-compatible interfaces:

- **`getEntity`** - Retrieve author/institution/journal by ID
- **`searchEntities`** - Search by name with fuzzy matching
- **`getMetrics`** - Get all metrics for an entity
- **`compareEntities`** - Compare two entities on any metric
- **`getTrend`** - Time-series data over custom date ranges
- **`getTopEntities`** - Ranked lists by any metric

### 2. Express REST API

- `GET /api/functions` - OpenAPI function definitions for LLM configuration
- `POST /api/query/:functionName` - Execute single query
- `POST /api/batch` - Atomic batch queries
- `POST /api/chat` - Conversational demo endpoint

### 3. Type-Safe Data Layer

**Entity Types:**
- `Author` - publications, citations, h-index, FWCI, top percentile outputs
- `Institution` - research output, collaboration rates, academic-corporate partnerships
- `Journal` - citation metrics, SJR, SNIP, percent cited

All validated with Zod schemas.

### 4. Mock Data

Realistic sample data for 3 authors, 3 institutions, 3 journals with:
- Complete metric sets
- 5-year trend data (2019-2023)
- Varied performance profiles

### 5. Test Coverage

**25 tests, all passing:**
- Entity retrieval (all types)
- Search (case-insensitive, limits, edge cases)
- Metrics access
- Comparisons (values, percentages, validation)
- Trends (year filtering)
- Top rankings (sorting, limits)

### 6. Documentation

- **README.md** (8.2KB) - Architecture, use cases, integration patterns, roadmap
- **DEMO.md** (8.2KB) - Complete API examples with curl commands
- **examples/client-demo.ts** - TypeScript client demonstrating all features

## Technical Highlights

### Architecture

```
LLM Client (ChatGPT/Claude/Smart Insights)
    ↓ Function calling
Query API (Express + Zod validation)
    ↓
Query Functions (typed, testable)
    ↓
Data Layer (mock → future: Snowflake/APIs)
```

### Why This Matters

1. **Complements AnalyticsGPT** - While George & Chris's paper focuses on LLM workflows, this provides the underlying **data access infrastructure**

2. **Cross-Product Potential** - Any Elsevier product can query SciVal data via natural language

3. **Smart Insights Foundation** - Demonstrates the data layer Smart Insights needs to expand beyond hardcoded queries

4. **Principal Engineer Thinking** - Shows architectural vision beyond feature delivery

## Use Cases Demonstrated

### Example 1: Direct Comparison
```
User: "Compare MIT's research output to Stanford's"
→ LLM calls compareEntities
→ Returns structured comparison with % difference
```

### Example 2: Analytical Question
```
User: "Show me the top 3 most cited authors and their publication trends"
→ LLM executes batch query:
  1. getTopEntities (authors, citations, 3)
  2. getTrend for each author
→ Returns complete dataset for visualization
```

### Example 3: Smart Insights Integration
```
Component calls: "Compare this author to department average"
→ Backend queries real SciVal data via this API
→ Returns structured metrics for UI rendering
```

## What's Ready for Tomorrow's Brainstorm

✅ **Working API** - Can demo live if needed (npm run dev)  
✅ **Clear architecture** - Shows technical vision  
✅ **Integration examples** - OpenAI & Claude patterns documented  
✅ **Extensibility** - Easy to add new query functions  
✅ **Production path** - README outlines real data integration  

## Next Steps (Post-Brainstorm)

### If this idea resonates:

1. **Feedback integration** - Adjust based on Chris & George's input
2. **Real data spike** - Connect one query to actual Snowflake
3. **Performance testing** - Benchmark with realistic query volumes
4. **Smart Insights integration** - Replace component mocks with API calls

### If it's parked:

- Still valuable reference architecture
- Can extract patterns for other projects
- Demonstrates technical depth for H1 review

## Files & Stats

```
13 files created
5,130 lines of code
25 tests (100% passing)
3 documentation files
1 example client
```

## Commit Message

```
Initial PoC: LLM-native SciVal data layer

Features:
- 6 core query functions (getEntity, search, compare, trends, rankings)
- Express REST API with OpenAI-compatible function schemas
- Zod validation for type-safe parameters
- Mock data for Author, Institution, Journal entities
- Batch query support
- 25 tests (all passing)
- Comprehensive documentation (README, DEMO, examples)

Architecture:
- TypeScript + Express for API layer
- Zod schemas for validation & OpenAPI generation
- Vitest for testing
- Modular query functions ready for real data integration

Purpose:
Technical demo for Smart Insights brainstorm (2026-02-13)
Demonstrates LLM-friendly data access patterns for SciVal metrics
```

---

## Morning Brief

**Mikey,**

While you slept, I built the SciVal LLM Data Layer PoC we discussed after the AnalyticsGPT paper discovery.

**What it is:** A working API that exposes SciVal data (authors, institutions, journals) to LLMs via structured function calling. Think of it as the "database adapter" that Smart Insights (and other products) could use to get research metrics via natural language.

**Why now:** Your brainstorm with Chris & George is today (Thu 13th). This gives you a concrete technical proposal to bring to the table — not just "we should build this," but "here's how it could work."

**Repository:** https://github.com/mindofindica/scival-llm-data-layer

**What to do with it:**

1. **Option A:** Mention it briefly in the brainstorm as complementary infrastructure to AnalyticsGPT
2. **Option B:** Deep-dive if the conversation goes toward "how do we make SciVal data more accessible"
3. **Option C:** Park it for now, use as reference architecture later

The code is production-quality (25 tests, full documentation), but it's deliberately scoped as a PoC. If this direction gets traction, the README outlines the path to real data integration.

**Your call on whether/how to use it today.** Either way, it's another data point demonstrating technical leadership beyond just shipping features.

— Indica 🌿

*Built: 2026-02-13 00:30-02:00 UTC*
