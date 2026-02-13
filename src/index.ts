import express, { Request, Response } from 'express';
import { queryFunctions } from './queries';
import { z } from 'zod';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

/**
 * Health check endpoint
 */
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * Get OpenAPI-style function definitions for LLM function calling
 */
app.get('/api/functions', (req: Request, res: Response) => {
  const functions = Object.entries(queryFunctions).map(([name, config]) => ({
    name,
    description: config.description,
    parameters: zodToJsonSchema(config.schema)
  }));
  
  res.json({ functions });
});

/**
 * Execute a query function
 */
app.post('/api/query/:functionName', (req: Request, res: Response) => {
  const { functionName } = req.params;
  const params = req.body;
  
  const queryConfig = queryFunctions[functionName as keyof typeof queryFunctions];
  
  if (!queryConfig) {
    return res.status(404).json({ error: `Function '${functionName}' not found` });
  }
  
  try {
    // Validate parameters
    const validatedParams = queryConfig.schema.parse(params);
    
    // Execute function
    const result = queryConfig.function(validatedParams as any);
    
    res.json({ result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid parameters', details: error.errors });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Batch query endpoint - execute multiple queries in one request
 */
app.post('/api/batch', (req: Request, res: Response) => {
  const { queries } = req.body;
  
  if (!Array.isArray(queries)) {
    return res.status(400).json({ error: 'queries must be an array' });
  }
  
  const results = queries.map((query: any) => {
    const { functionName, params } = query;
    const queryConfig = queryFunctions[functionName as keyof typeof queryFunctions];
    
    if (!queryConfig) {
      return { error: `Function '${functionName}' not found` };
    }
    
    try {
      const validatedParams = queryConfig.schema.parse(params);
      const result = queryConfig.function(validatedParams as any);
      return { success: true, result };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { success: false, error: 'Invalid parameters', details: error.errors };
      }
      return { success: false, error: 'Execution failed' };
    }
  });
  
  res.json({ results });
});

/**
 * Conversational endpoint - simulate LLM interaction
 */
app.post('/api/chat', (req: Request, res: Response) => {
  const { message } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'message is required' });
  }
  
  // Simple pattern matching for demo purposes
  const lowerMessage = message.toLowerCase();
  
  let response = {
    message: '',
    suggestedQueries: [] as any[]
  };
  
  if (lowerMessage.includes('compare') && lowerMessage.includes('author')) {
    response.message = 'To compare authors, I can use the compareEntities function. Which two authors would you like to compare, and on which metric?';
    response.suggestedQueries = [
      {
        functionName: 'compareEntities',
        params: {
          entityType: 'author',
          entityIdA: 'auth_001',
          entityIdB: 'auth_002',
          metric: 'hIndex'
        }
      }
    ];
  } else if (lowerMessage.includes('search')) {
    response.message = 'I can search for authors, institutions, or journals. What would you like to search for?';
    response.suggestedQueries = [
      {
        functionName: 'searchEntities',
        params: {
          entityType: 'author',
          query: 'chen',
          limit: 5
        }
      }
    ];
  } else if (lowerMessage.includes('top')) {
    response.message = 'I can find top entities ranked by various metrics. What type of entity and metric are you interested in?';
    response.suggestedQueries = [
      {
        functionName: 'getTopEntities',
        params: {
          entityType: 'author',
          metric: 'citations',
          limit: 5
        }
      }
    ];
  } else if (lowerMessage.includes('trend')) {
    response.message = 'I can show trends over time for any entity metric. Which entity and metric would you like to see?';
    response.suggestedQueries = [
      {
        functionName: 'getTrend',
        params: {
          entityId: 'auth_001',
          metric: 'publications'
        }
      }
    ];
  } else {
    response.message = 'I can help you explore SciVal data. Try asking about:\n- Comparing authors/institutions/journals\n- Searching for entities\n- Finding top performers\n- Analyzing trends over time';
  }
  
  res.json(response);
});

/**
 * Convert Zod schema to JSON Schema format (simplified)
 */
function zodToJsonSchema(schema: z.ZodTypeAny): any {
  // This is a simplified converter - in production, use a proper library like zod-to-json-schema
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape;
    const properties: any = {};
    const required: string[] = [];
    
    Object.entries(shape).forEach(([key, value]) => {
      properties[key] = zodToJsonSchema(value as z.ZodTypeAny);
      if (!(value as any).isOptional()) {
        required.push(key);
      }
    });
    
    return {
      type: 'object',
      properties,
      required: required.length > 0 ? required : undefined
    };
  } else if (schema instanceof z.ZodString) {
    return { type: 'string', description: schema.description };
  } else if (schema instanceof z.ZodNumber) {
    return { type: 'number', description: schema.description };
  } else if (schema instanceof z.ZodArray) {
    return { type: 'array', items: zodToJsonSchema(schema.element), description: schema.description };
  } else if (schema instanceof z.ZodEnum) {
    return { type: 'string', enum: schema.options, description: schema.description };
  } else if (schema instanceof z.ZodOptional) {
    return zodToJsonSchema(schema.unwrap());
  } else if (schema instanceof z.ZodDefault) {
    return { ...zodToJsonSchema(schema.removeDefault()), default: schema._def.defaultValue() };
  }
  
  return { type: 'unknown' };
}

app.listen(PORT, () => {
  console.log(`SciVal LLM Data Layer API running on port ${PORT}`);
  console.log(`OpenAPI functions available at: http://localhost:${PORT}/api/functions`);
});

export { app };
