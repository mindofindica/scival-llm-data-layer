# Architecture Overview

## System Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                         LLM CLIENTS                              │
│  (ChatGPT, Claude, Smart Insights UI, Custom Agents)            │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ HTTP/JSON Function Calling
                 │
┌────────────────▼────────────────────────────────────────────────┐
│                      QUERY API LAYER                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  GET  /api/functions     → Function definitions         │   │
│  │  POST /api/query/:fn     → Single query execution       │   │
│  │  POST /api/batch         → Multiple queries atomic      │   │
│  │  POST /api/chat          → Conversational suggestions   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  • Express REST API                                              │
│  • Zod parameter validation                                      │
│  • OpenAPI schema generation                                     │
│  • Error handling & status codes                                 │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ Typed Function Calls
                 │
┌────────────────▼────────────────────────────────────────────────┐
│                    QUERY FUNCTIONS                               │
│  ┌──────────────────────┐  ┌──────────────────────┐            │
│  │  getEntity           │  │  searchEntities      │            │
│  │  • By ID lookup      │  │  • Name fuzzy match  │            │
│  │  • Type validation   │  │  • Limit & filter    │            │
│  └──────────────────────┘  └──────────────────────┘            │
│                                                                   │
│  ┌──────────────────────┐  ┌──────────────────────┐            │
│  │  getMetrics          │  │  compareEntities     │            │
│  │  • All metrics       │  │  • Side-by-side      │            │
│  │  • Filtered subsets  │  │  • % difference      │            │
│  └──────────────────────┘  └──────────────────────┘            │
│                                                                   │
│  ┌──────────────────────┐  ┌──────────────────────┐            │
│  │  getTrend            │  │  getTopEntities      │            │
│  │  • Time series       │  │  • Ranked lists      │            │
│  │  • Year filtering    │  │  • Metric sorting    │            │
│  └──────────────────────┘  └──────────────────────┘            │
│                                                                   │
│  • Pure functions (testable)                                     │
│  • Zod schema validation                                         │
│  • Composable & reusable                                         │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ Data Access
                 │
┌────────────────▼────────────────────────────────────────────────┐
│                      DATA LAYER                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  CURRENT: Mock Data (in-memory)                        │    │
│  │  • mockAuthors[]                                       │    │
│  │  • mockInstitutions[]                                  │    │
│  │  • mockJournals[]                                      │    │
│  │  • mockTrends{}                                        │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  FUTURE: Real Data Sources                             │    │
│  │  • Snowflake (SciVal metrics warehouse)               │    │
│  │  • SciVal REST APIs                                    │    │
│  │  • Redis cache layer                                   │    │
│  │  • GraphQL federation                                  │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Example

### Simple Query: "Who is Dr. Sarah Chen?"

```
1. LLM Client
   ↓ POST /api/query/searchEntities
   ↓ { "entityType": "author", "query": "chen" }

2. API Layer
   ↓ Validate params with Zod schema
   ↓ Call searchEntities(params)

3. Query Function
   ↓ Filter mockAuthors by name match
   ↓ Return matched Author[]

4. API Layer
   ↓ Wrap result: { "result": [...] }
   ↓ Send JSON response

5. LLM Client
   ↓ Receive structured data
   ↓ Generate natural language: "Dr. Sarah Chen is a researcher at MIT..."
```

### Complex Query: "Compare MIT to Stanford"

```
1. LLM Client
   ↓ First: Search for entities
   ↓ POST /api/query/searchEntities (MIT)
   ↓ POST /api/query/searchEntities (Stanford)
   
2. LLM Client
   ↓ Extract IDs from results
   ↓ POST /api/query/compareEntities
   ↓ { "entityType": "institution",
   ↓   "entityIdA": "inst_001",
   ↓   "entityIdB": "inst_002",
   ↓   "metric": "publications" }

3. Query Function
   ↓ Fetch both institutions
   ↓ Extract metric values
   ↓ Calculate difference & %
   ↓ Return Comparison object

4. LLM Client
   ↓ Format natural language response with numbers
```

### Batch Query: "Top 3 authors and their trends"

```
1. LLM Client
   ↓ POST /api/batch
   ↓ {
   ↓   "queries": [
   ↓     { "functionName": "getTopEntities", "params": {...} },
   ↓     { "functionName": "getTrend", "params": {...} },
   ↓     { "functionName": "getTrend", "params": {...} },
   ↓     { "functionName": "getTrend", "params": {...} }
   ↓   ]
   ↓ }

2. API Layer
   ↓ Execute all queries
   ↓ Aggregate results
   ↓ Return array: [{ success, result }, ...]

3. LLM Client
   ↓ Combine top authors with their trends
   ↓ Generate visualization or narrative
```

## Type System

```typescript
// Entity Types
Author {
  id: string
  name: string
  affiliation?: string
  metrics: {
    publications: number
    citations: number
    hIndex: number
    fieldWeightedCitationImpact: number
    outputsInTopCitationPercentiles: {
      top1: number
      top5: number
      top10: number
    }
  }
}

Institution {
  id: string
  name: string
  country: string
  metrics: {
    publications: number
    citations: number
    collaborationRate: number
    fieldWeightedCitationImpact: number
    academicCorporateCollaboration: number
  }
}

Journal {
  id: string
  name: string
  publisher: string
  metrics: {
    citesPerDoc: number
    sjr: number  // SCImago Journal Rank
    snip: number // Source Normalized Impact per Paper
    percentCited: number
  }
}

// Query Result Types
Comparison {
  entityA: { id, name, value }
  entityB: { id, name, value }
  difference: number
  percentDifference: number
}

TrendPoint {
  year: number
  value: number
}
```

## Integration Patterns

### Pattern 1: Direct Function Calling

```typescript
// 1. LLM gets function definitions
const functions = await fetch('/api/functions').then(r => r.json());

// 2. User asks question
const userMessage = "Compare MIT to Stanford publications";

// 3. LLM decides which function to call
const completion = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: userMessage }],
  functions: functions.functions
});

// 4. Execute the function
const functionCall = completion.choices[0].message.function_call;
const result = await fetch(`/api/query/${functionCall.name}`, {
  method: 'POST',
  body: functionCall.arguments
});

// 5. Return to LLM for natural language response
```

### Pattern 2: Smart Insights Component

```typescript
// React component in SciVal Smart Insights UI
function AuthorComparison({ authorIdA, authorIdB }) {
  const [comparison, setComparison] = useState(null);
  
  useEffect(() => {
    // Call LLM data layer instead of hardcoded data
    fetch('/api/query/compareEntities', {
      method: 'POST',
      body: JSON.stringify({
        entityType: 'author',
        entityIdA,
        entityIdB,
        metric: 'citations'
      })
    })
    .then(r => r.json())
    .then(data => setComparison(data.result));
  }, [authorIdA, authorIdB]);
  
  return (
    <ComparisonChart data={comparison} />
  );
}
```

### Pattern 3: Cross-Product Integration

```typescript
// Any Elsevier product can query SciVal data
class SciValDataClient {
  async ask(question: string) {
    // 1. Send question to LLM with function definitions
    const response = await this.llm.chat({
      message: question,
      functions: this.scivalFunctions
    });
    
    // 2. Execute function calls
    const results = await Promise.all(
      response.functionCalls.map(call =>
        this.executeSciValQuery(call.name, call.args)
      )
    );
    
    // 3. Return formatted answer
    return this.llm.formatResponse(results);
  }
  
  private async executeSciValQuery(name: string, params: any) {
    return fetch(`${SCIVAL_API}/query/${name}`, {
      method: 'POST',
      body: JSON.stringify(params)
    }).then(r => r.json());
  }
}
```

## Security & Performance

### Current PoC

```
Security:  ⚠️  None (public endpoints)
Auth:      ⚠️  None
Rate Limit:⚠️  None
Cache:     ⚠️  None
Validation:✅  Zod schemas
Type Safe: ✅  Full TypeScript
```

### Production Requirements

```
Security:  ✅  API key authentication
Auth:      ✅  OAuth 2.0 / SAML
Rate Limit:✅  100 req/min per client
Cache:     ✅  Redis (95%+ hit rate)
Monitoring:✅  DataDog / NewRelic
Logging:   ✅  Structured JSON logs
CORS:      ✅  Restricted origins
Input:     ✅  Sanitization + Zod
SQL:       ✅  Parameterized queries
Audit:     ✅  All data access logged
```

## Scaling Considerations

### Current Performance

```
Response Time:  <10ms (in-memory)
Throughput:     ~10k req/s (single process)
Concurrency:    Limited by Express defaults
Memory:         ~50MB for mock data
```

### Production Targets

```
Response Time:  <100ms p95 (with Snowflake)
Throughput:     1k req/s sustained
Concurrency:    10k simultaneous connections
Memory:         ~500MB with Redis cache
Availability:   99.9% uptime (3 nines)
```

### Scaling Strategy

1. **Horizontal Scaling**
   - Deploy multiple API instances behind load balancer
   - Stateless design enables easy scaling

2. **Caching**
   - Redis for frequently accessed entities
   - 95%+ cache hit rate target
   - TTL based on data freshness requirements

3. **Database Optimization**
   - Indexed queries on Snowflake
   - Materialized views for common aggregations
   - Connection pooling

4. **CDN**
   - Cache function definitions (rarely change)
   - Geographic distribution for global access

## Future Extensions

### Phase 2: Advanced Queries

```typescript
// Complex aggregations
getEntityCollaborationNetwork(entityId: string): Graph

// Temporal analysis
getMetricEvolution(entityId: string, metric: string): TimeSeries

// Benchmarking
getBenchmark(entityId: string, peerGroup: string): Benchmark
```

### Phase 3: Real-Time Features

```typescript
// Streaming updates
subscribeToMetricUpdates(entityId: string): EventStream

// Webhooks
registerWebhook(event: string, url: string): Subscription
```

### Phase 4: Multi-Tenant

```typescript
// Organization-scoped data
getEntities(orgId: string, filters: Filters): Entity[]

// Role-based access
checkPermission(userId: string, action: string): boolean
```

---

**This architecture is designed to:**
- Start simple (PoC with mocks)
- Scale incrementally (add real data, caching, etc.)
- Support multiple use cases (direct LLM, UI components, cross-product)
- Maintain type safety throughout
- Enable testing at every layer
