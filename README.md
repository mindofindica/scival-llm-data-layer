# SciVal LLM Data Layer

**LLM-native data access layer for SciVal research analytics**

A proof-of-concept demonstrating how to expose SciVal metrics and analytics in formats optimized for Large Language Model consumption via function calling interfaces.

## 🎯 Purpose

This project addresses a key architectural question: **How do we make research analytics data accessible to LLMs in a structured, reliable way?**

While [AnalyticsGPT](https://arxiv.org/abs/2602.09817) demonstrates LLM workflows for scientometric question answering, this project focuses on the complementary challenge of building an **LLM-friendly data layer** that:

- Provides structured function calling interfaces (OpenAI-compatible)
- Returns validated, typed data (via Zod schemas)
- Supports complex queries (search, compare, trends, rankings)
- Enables cross-product integration (any Elsevier product can query SciVal data via natural language)

## ⚡ Quick Demo

**See it in action** (no API key required):

```bash
npm install
npm run dev          # Terminal 1: Start API server
npx tsx examples/simulated-demo.ts  # Terminal 2: Run demo
```

This shows a realistic LLM conversation using the data layer:
- User asks: *"Who is the most cited author?"*
- LLM automatically calls `getTopEntities(entityType: "author", metric: "citations")`
- System returns structured data
- LLM synthesizes natural language response

**Perfect for brainstorms and presentations** — see `examples/README.md` for more demos.

## 🏗️ Architecture

```
┌─────────────────┐
│   LLM Client    │  (ChatGPT, Claude, Smart Insights, etc.)
└────────┬────────┘
         │
         │ Function calling
         │
┌────────▼────────┐
│  Query API      │  Express REST API
│  /api/query     │  - Parameter validation (Zod)
│  /api/batch     │  - Type-safe execution
│  /api/functions │  - OpenAPI schema generation
└────────┬────────┘
         │
┌────────▼────────┐
│ Query Functions │  Core business logic
│  - getEntity    │  - Strongly typed
│  - search       │  - Composable
│  - compare      │  - Testable
│  - trends       │
└────────┬────────┘
         │
┌────────▼────────┐
│  Data Layer     │  (Currently: mock data)
│                 │  (Future: Snowflake, APIs, etc.)
└─────────────────┘
```

## 🚀 Features

### Core Query Functions

All functions follow OpenAI function calling schema format with Zod validation:

1. **`getEntity`** - Retrieve specific author/institution/journal by ID
2. **`searchEntities`** - Search by name/keywords with fuzzy matching
3. **`getMetrics`** - Get all metrics for an entity
4. **`compareEntities`** - Compare two entities on any metric
5. **`getTrend`** - Time-series data for any metric
6. **`getTopEntities`** - Ranked lists by any metric

### API Endpoints

- `GET /api/functions` - OpenAPI-compatible function definitions for LLM consumption
- `POST /api/query/:functionName` - Execute single query
- `POST /api/batch` - Execute multiple queries atomically
- `POST /api/chat` - Conversational demo endpoint (pattern-matched suggestions)

### Type Safety

All data structures validated with Zod schemas:
- `Author` - publications, citations, h-index, field-weighted metrics
- `Institution` - research output, collaboration rates, impact
- `Journal` - citation metrics, SJR, SNIP, coverage

## 📊 Use Cases

### 1. Smart Insights Component Integration

```typescript
// Smart Insights UI calls this API via LLM function calling
const response = await fetch('/api/query/compareEntities', {
  method: 'POST',
  body: JSON.stringify({
    entityType: 'author',
    entityIdA: 'auth_001',
    entityIdB: 'auth_002',
    metric: 'hIndex'
  })
});
```

### 2. Cross-Product Analytics

Any Elsevier product with LLM capabilities can query SciVal data:

```
User: "Compare MIT's research output to Stanford's"

LLM Function Call:
{
  "name": "compareEntities",
  "arguments": {
    "entityType": "institution",
    "entityIdA": "inst_001", // MIT
    "entityIdB": "inst_002", // Stanford  
    "metric": "publications"
  }
}

Response: {
  "entityA": { "name": "MIT", "value": 12456 },
  "entityB": { "name": "Stanford", "value": 11234 },
  "difference": 1222,
  "percentDifference": 10.88
}
```

### 3. Batch Queries for Complex Questions

```
User: "Show me the top 3 most cited authors and their publication trends"

LLM executes:
POST /api/batch
{
  "queries": [
    { "functionName": "getTopEntities", "params": { "entityType": "author", "metric": "citations", "limit": 3 } },
    { "functionName": "getTrend", "params": { "entityId": "auth_002", "metric": "publications" } },
    { "functionName": "getTrend", "params": { "entityId": "auth_001", "metric": "publications" } },
    { "functionName": "getTrend", "params": { "entityId": "auth_003", "metric": "publications" } }
  ]
}
```

## 🧪 Testing

```bash
npm test
```

**Current coverage:** 18 tests covering:
- Entity retrieval (all types)
- Search (case-insensitive, limits, empty results)
- Metrics access
- Comparisons (values, percent differences, edge cases)
- Trends (filtering by year range)
- Top rankings (sorting, limits)

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run in dev mode (auto-reload)
npm run dev

# Type check
npm run typecheck

# Build
npm run build

# Production
npm start
```

## 🔮 Future Enhancements

### Near-term (Production-ready)
- [ ] Replace mock data with real Snowflake/API integration
- [ ] Authentication & authorization
- [ ] Rate limiting
- [ ] Caching layer (Redis)
- [ ] Request logging & monitoring
- [ ] OpenAPI spec generation (full OpenAPI 3.0 doc)

### Medium-term (Advanced Features)
- [ ] Streaming responses for large datasets
- [ ] GraphQL endpoint (alternative to REST)
- [ ] Webhook subscriptions for metric updates
- [ ] Advanced query composition (filters, aggregations)
- [ ] Multi-entity batch comparisons

### Long-term (Platform)
- [ ] Plugin system for custom metrics
- [ ] Data access auditing
- [ ] Multi-tenant support
- [ ] SDK libraries (Python, JavaScript, Java)
- [ ] Real-time collaboration features

## 💡 Integration Patterns

### Pattern 1: Direct LLM Function Calling

```typescript
// LLM receives function definitions from /api/functions
const functions = await fetch('/api/functions').then(r => r.json());

// User asks question, LLM decides which function to call
const completion = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Who has more citations, Dr. Chen or Prof. Anderson?' }],
  functions: functions.functions
});

// Execute the function call
const result = await fetch(`/api/query/${functionCall.name}`, {
  method: 'POST',
  body: JSON.stringify(JSON.parse(functionCall.arguments))
});
```

### Pattern 2: Agent Orchestration

```typescript
// Agent maintains conversation state, executes multiple queries
const agent = new SciValAgent();

await agent.ask('Compare the top 3 institutions by citations and show their collaboration rates');

// Agent internally:
// 1. Calls getTopEntities (institutions, citations, 3)
// 2. For each result, calls getMetrics with metricNames=['collaborationRate']
// 3. Formats natural language response
```

### Pattern 3: Embedded Analytics

```typescript
// Embed conversational analytics in existing products
<SciValChat 
  apiUrl="https://scival-llm.elsevier.com"
  context={{ userId: 'user123', institution: 'MIT' }}
  suggestions={['Compare my department to peers', 'Show trending topics']}
/>
```

## 📈 Performance Considerations

### Current Implementation
- **Response time:** <10ms (in-memory mock data)
- **Throughput:** Limited by Express (can handle ~10k req/s with clustering)
- **Payload size:** Typically <10KB per response

### Production Targets
- **Response time:** <100ms p95 (with Snowflake backend)
- **Throughput:** 1k req/s sustained
- **Caching:** 95%+ hit rate for common queries
- **Availability:** 99.9% uptime

## 🔒 Security

### Current Status (PoC)
- ⚠️ No authentication
- ⚠️ No rate limiting
- ⚠️ No input sanitization beyond Zod validation

### Production Requirements
- API key authentication
- Rate limiting per client (100 req/min)
- Input validation & sanitization
- SQL injection protection (parameterized queries)
- CORS restrictions
- Audit logging for all data access

## 🤝 Contributing

This is a proof-of-concept for internal discussion. Future contributions should focus on:
- Real data integration
- Performance optimization
- Additional query functions
- Client SDK development

## 📝 License

MIT License - Internal Elsevier PoC

---

**Built by:** Indica  
**Date:** February 13, 2026  
**Context:** Technical proposal for Smart Insights LLM data access patterns  
**Related:** [AnalyticsGPT paper](https://arxiv.org/abs/2602.09817), SciVal Smart Insights roadmap
