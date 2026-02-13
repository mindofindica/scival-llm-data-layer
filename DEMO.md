# Demo: Using the SciVal LLM Data Layer

This guide demonstrates how to interact with the API in various scenarios.

## Starting the Server

```bash
npm run dev
# Server runs on http://localhost:3000
```

## Example Queries

### 1. Get Function Definitions (for LLM configuration)

```bash
curl http://localhost:3000/api/functions
```

**Response:**
```json
{
  "functions": [
    {
      "name": "getEntity",
      "description": "Retrieve a specific entity (author, institution, or journal) by its unique identifier",
      "parameters": {
        "type": "object",
        "properties": {
          "entityType": { "type": "string", "enum": ["author", "institution", "journal"] },
          "entityId": { "type": "string" }
        },
        "required": ["entityType", "entityId"]
      }
    },
    // ... more functions
  ]
}
```

### 2. Search for Authors

```bash
curl -X POST http://localhost:3000/api/query/searchEntities \
  -H "Content-Type: application/json" \
  -d '{
    "entityType": "author",
    "query": "chen",
    "limit": 5
  }'
```

**Response:**
```json
{
  "result": [
    {
      "id": "auth_001",
      "name": "Dr. Sarah Chen",
      "affiliation": "MIT",
      "metrics": {
        "publications": 156,
        "citations": 4823,
        "hIndex": 42,
        "fieldWeightedCitationImpact": 2.34,
        "outputsInTopCitationPercentiles": {
          "top1": 12,
          "top5": 28,
          "top10": 45
        }
      }
    }
  ]
}
```

### 3. Compare Two Authors

```bash
curl -X POST http://localhost:3000/api/query/compareEntities \
  -H "Content-Type: application/json" \
  -d '{
    "entityType": "author",
    "entityIdA": "auth_002",
    "entityIdB": "auth_001",
    "metric": "citations"
  }'
```

**Response:**
```json
{
  "result": {
    "entityA": {
      "id": "auth_002",
      "name": "Prof. James Anderson",
      "value": 8912
    },
    "entityB": {
      "id": "auth_001",
      "name": "Dr. Sarah Chen",
      "value": 4823
    },
    "difference": 4089,
    "percentDifference": 84.77
  }
}
```

### 4. Get Publication Trends

```bash
curl -X POST http://localhost:3000/api/query/getTrend \
  -H "Content-Type: application/json" \
  -d '{
    "entityId": "auth_001",
    "metric": "publications",
    "startYear": 2020,
    "endYear": 2023
  }'
```

**Response:**
```json
{
  "result": [
    { "year": 2020, "value": 15 },
    { "year": 2021, "value": 18 },
    { "year": 2022, "value": 22 },
    { "year": 2023, "value": 19 }
  ]
}
```

### 5. Get Top Institutions by Publications

```bash
curl -X POST http://localhost:3000/api/query/getTopEntities \
  -H "Content-Type: application/json" \
  -d '{
    "entityType": "institution",
    "metric": "publications",
    "limit": 3
  }'
```

**Response:**
```json
{
  "result": [
    {
      "id": "inst_002",
      "name": "University of Oxford",
      "country": "United Kingdom",
      "metrics": {
        "publications": 15234,
        "citations": 412567,
        "collaborationRate": 0.72,
        "fieldWeightedCitationImpact": 3.12,
        "academicCorporateCollaboration": 0.18
      }
    },
    // ... more institutions
  ]
}
```

### 6. Batch Queries

Execute multiple queries in a single request:

```bash
curl -X POST http://localhost:3000/api/batch \
  -H "Content-Type: application/json" \
  -d '{
    "queries": [
      {
        "functionName": "searchEntities",
        "params": {
          "entityType": "author",
          "query": "anderson",
          "limit": 1
        }
      },
      {
        "functionName": "getTrend",
        "params": {
          "entityId": "auth_002",
          "metric": "publications"
        }
      }
    ]
  }'
```

**Response:**
```json
{
  "results": [
    {
      "success": true,
      "result": [
        {
          "id": "auth_002",
          "name": "Prof. James Anderson",
          "affiliation": "Stanford University",
          "metrics": { ... }
        }
      ]
    },
    {
      "success": true,
      "result": [
        { "year": 2019, "value": 18 },
        { "year": 2020, "value": 21 },
        // ...
      ]
    }
  ]
}
```

### 7. Conversational Demo

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Compare two authors"
  }'
```

**Response:**
```json
{
  "message": "To compare authors, I can use the compareEntities function. Which two authors would you like to compare, and on which metric?",
  "suggestedQueries": [
    {
      "functionName": "compareEntities",
      "params": {
        "entityType": "author",
        "entityIdA": "auth_001",
        "entityIdB": "auth_002",
        "metric": "hIndex"
      }
    }
  ]
}
```

## LLM Integration Example

### OpenAI Function Calling

```typescript
import OpenAI from 'openai';

const openai = new OpenAI();

// Get function definitions from the API
const functionsResponse = await fetch('http://localhost:3000/api/functions');
const { functions } = await functionsResponse.json();

// Create chat completion with function calling
const completion = await openai.chat.completions.create({
  model: 'gpt-4-turbo-preview',
  messages: [
    {
      role: 'user',
      content: 'Who has published more papers, Dr. Sarah Chen or Prof. James Anderson?'
    }
  ],
  functions: functions,
  function_call: 'auto'
});

const message = completion.choices[0].message;

if (message.function_call) {
  const functionName = message.function_call.name;
  const args = JSON.parse(message.function_call.arguments);
  
  // Execute the function
  const result = await fetch(`http://localhost:3000/api/query/${functionName}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(args)
  });
  
  const data = await result.json();
  
  // Send result back to LLM for natural language response
  const finalCompletion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      ...completion.choices[0].message,
      {
        role: 'function',
        name: functionName,
        content: JSON.stringify(data.result)
      }
    ]
  });
  
  console.log(finalCompletion.choices[0].message.content);
  // "Prof. James Anderson has published more papers (203) compared to Dr. Sarah Chen (156)."
}
```

### Anthropic Claude Integration

```typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

// Claude uses tools instead of functions
const tools = functions.map(f => ({
  name: f.name,
  description: f.description,
  input_schema: f.parameters
}));

const message = await anthropic.messages.create({
  model: 'claude-3-opus-20240229',
  max_tokens: 1024,
  tools: tools,
  messages: [
    {
      role: 'user',
      content: 'Compare the citation impact of MIT and Oxford'
    }
  ]
});

// Handle tool use similar to OpenAI function calling
```

## Error Handling

### Invalid Parameters

```bash
curl -X POST http://localhost:3000/api/query/compareEntities \
  -H "Content-Type: application/json" \
  -d '{
    "entityType": "author",
    "entityIdA": "auth_001"
  }'
```

**Response (400 Bad Request):**
```json
{
  "error": "Invalid parameters",
  "details": [
    {
      "code": "invalid_type",
      "expected": "string",
      "received": "undefined",
      "path": ["entityIdB"],
      "message": "Required"
    }
  ]
}
```

### Non-existent Function

```bash
curl -X POST http://localhost:3000/api/query/nonExistentFunction \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Response (404 Not Found):**
```json
{
  "error": "Function 'nonExistentFunction' not found"
}
```

## Performance Testing

```bash
# Simple load test
for i in {1..100}; do
  curl -X POST http://localhost:3000/api/query/searchEntities \
    -H "Content-Type: application/json" \
    -d '{"entityType":"author","query":"chen"}' &
done

wait
echo "Completed 100 concurrent requests"
```

## Next Steps

1. **Try different queries** - Explore all 6 function types
2. **Build an LLM agent** - Use the functions in a conversational agent
3. **Integrate with Smart Insights** - Replace mock UI data with real queries
4. **Extend with real data** - Connect to Snowflake or SciVal APIs

---

**For more details, see [README.md](./README.md)**
