import { z } from 'zod';
import { mockAuthors, mockInstitutions, mockJournals, mockTrends } from './data/mockData';
import { Author, Institution, Journal, TrendPoint, Comparison, EntityType } from './types';

/**
 * Get entity by ID
 */
export const getEntitySchema = z.object({
  entityType: z.enum(['author', 'institution', 'journal']).describe('Type of entity to retrieve'),
  entityId: z.string().describe('Unique identifier for the entity')
});

export function getEntity(params: z.infer<typeof getEntitySchema>): Author | Institution | Journal | null {
  const { entityType, entityId } = params;
  
  switch (entityType) {
    case 'author':
      return mockAuthors.find(a => a.id === entityId) || null;
    case 'institution':
      return mockInstitutions.find(i => i.id === entityId) || null;
    case 'journal':
      return mockJournals.find(j => j.id === entityId) || null;
  }
}

/**
 * Search entities by name
 */
export const searchEntitiesSchema = z.object({
  entityType: z.enum(['author', 'institution', 'journal']).describe('Type of entity to search'),
  query: z.string().describe('Search query string'),
  limit: z.number().optional().default(10).describe('Maximum number of results')
});

export function searchEntities(params: z.infer<typeof searchEntitiesSchema>): (Author | Institution | Journal)[] {
  const { entityType, query, limit } = params;
  const queryLower = query.toLowerCase();
  
  let results: (Author | Institution | Journal)[];
  
  switch (entityType) {
    case 'author':
      results = mockAuthors.filter(a => a.name.toLowerCase().includes(queryLower));
      break;
    case 'institution':
      results = mockInstitutions.filter(i => i.name.toLowerCase().includes(queryLower));
      break;
    case 'journal':
      results = mockJournals.filter(j => j.name.toLowerCase().includes(queryLower));
      break;
  }
  
  return results.slice(0, limit);
}

/**
 * Get metrics for an entity
 */
export const getMetricsSchema = z.object({
  entityType: z.enum(['author', 'institution', 'journal']).describe('Type of entity'),
  entityId: z.string().describe('Entity identifier'),
  metricNames: z.array(z.string()).optional().describe('Specific metrics to retrieve (all if not specified)')
});

export function getMetrics(params: z.infer<typeof getMetricsSchema>): Record<string, number> | null {
  const { entityType, entityId } = params;
  const entity = getEntity({ entityType, entityId });
  
  if (!entity) return null;
  
  return entity.metrics as Record<string, number>;
}

/**
 * Compare two entities on a specific metric
 */
export const compareEntitiesSchema = z.object({
  entityType: z.enum(['author', 'institution', 'journal']).describe('Type of entities to compare'),
  entityIdA: z.string().describe('First entity identifier'),
  entityIdB: z.string().describe('Second entity identifier'),
  metric: z.string().describe('Metric to compare (e.g., "publications", "citations", "hIndex")')
});

export function compareEntities(params: z.infer<typeof compareEntitiesSchema>): Comparison | null {
  const { entityType, entityIdA, entityIdB, metric } = params;
  
  const entityA = getEntity({ entityType, entityId: entityIdA });
  const entityB = getEntity({ entityType, entityId: entityIdB });
  
  if (!entityA || !entityB) return null;
  
  const metricsA = entityA.metrics as any;
  const metricsB = entityB.metrics as any;
  
  const valueA = metricsA[metric];
  const valueB = metricsB[metric];
  
  if (valueA === undefined || valueB === undefined) return null;
  
  const difference = valueA - valueB;
  const percentDifference = valueB !== 0 ? ((valueA - valueB) / valueB) * 100 : 0;
  
  return {
    entityA: {
      id: entityA.id,
      name: entityA.name,
      value: valueA
    },
    entityB: {
      id: entityB.id,
      name: entityB.name,
      value: valueB
    },
    difference,
    percentDifference
  };
}

/**
 * Get trend data for an entity metric over time
 */
export const getTrendSchema = z.object({
  entityId: z.string().describe('Entity identifier'),
  metric: z.string().describe('Metric to track over time'),
  startYear: z.number().optional().describe('Start year (defaults to earliest available)'),
  endYear: z.number().optional().describe('End year (defaults to latest available)')
});

export function getTrend(params: z.infer<typeof getTrendSchema>): TrendPoint[] | null {
  const { entityId, startYear, endYear } = params;
  
  const trendData = mockTrends[entityId];
  if (!trendData) return null;
  
  let filtered = trendData;
  
  if (startYear) {
    filtered = filtered.filter(point => point.year >= startYear);
  }
  
  if (endYear) {
    filtered = filtered.filter(point => point.year <= endYear);
  }
  
  return filtered;
}

/**
 * Get top entities by a specific metric
 */
export const getTopEntitiesSchema = z.object({
  entityType: z.enum(['author', 'institution', 'journal']).describe('Type of entity'),
  metric: z.string().describe('Metric to rank by'),
  limit: z.number().optional().default(10).describe('Number of top entities to return')
});

export function getTopEntities(params: z.infer<typeof getTopEntitiesSchema>): (Author | Institution | Journal)[] {
  const { entityType, metric, limit } = params;
  
  let entities: (Author | Institution | Journal)[];
  
  switch (entityType) {
    case 'author':
      entities = [...mockAuthors];
      break;
    case 'institution':
      entities = [...mockInstitutions];
      break;
    case 'journal':
      entities = [...mockJournals];
      break;
  }
  
  // Sort by metric (descending)
  entities.sort((a, b) => {
    const metricsA = a.metrics as any;
    const metricsB = b.metrics as any;
    const valueA = metricsA[metric] || 0;
    const valueB = metricsB[metric] || 0;
    return valueB - valueA;
  });
  
  return entities.slice(0, limit);
}

/**
 * All query functions with their schemas for LLM function calling
 */
export const queryFunctions = {
  getEntity: {
    function: getEntity,
    schema: getEntitySchema,
    description: 'Retrieve a specific entity (author, institution, or journal) by its unique identifier'
  },
  searchEntities: {
    function: searchEntities,
    schema: searchEntitiesSchema,
    description: 'Search for entities by name or keywords'
  },
  getMetrics: {
    function: getMetrics,
    schema: getMetricsSchema,
    description: 'Get all metrics for a specific entity'
  },
  compareEntities: {
    function: compareEntities,
    schema: compareEntitiesSchema,
    description: 'Compare two entities on a specific metric and get the difference'
  },
  getTrend: {
    function: getTrend,
    schema: getTrendSchema,
    description: 'Get trend data for an entity metric over a time period'
  },
  getTopEntities: {
    function: getTopEntities,
    schema: getTopEntitiesSchema,
    description: 'Get the top-performing entities ranked by a specific metric'
  }
};
