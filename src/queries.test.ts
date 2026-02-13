import { describe, it, expect } from 'vitest';
import {
  getEntity,
  searchEntities,
  getMetrics,
  compareEntities,
  getTrend,
  getTopEntities
} from './queries';

describe('getEntity', () => {
  it('should retrieve an author by ID', () => {
    const result = getEntity({ entityType: 'author', entityId: 'auth_001' });
    expect(result).toBeDefined();
    expect(result?.id).toBe('auth_001');
    expect(result?.name).toBe('Dr. Sarah Chen');
  });

  it('should retrieve an institution by ID', () => {
    const result = getEntity({ entityType: 'institution', entityId: 'inst_001' });
    expect(result).toBeDefined();
    expect(result?.id).toBe('inst_001');
    expect(result?.name).toBe('Massachusetts Institute of Technology');
  });

  it('should retrieve a journal by ID', () => {
    const result = getEntity({ entityType: 'journal', entityId: 'jour_001' });
    expect(result).toBeDefined();
    expect(result?.id).toBe('jour_001');
    expect(result?.name).toBe('Nature');
  });

  it('should return null for non-existent entity', () => {
    const result = getEntity({ entityType: 'author', entityId: 'nonexistent' });
    expect(result).toBeNull();
  });
});

describe('searchEntities', () => {
  it('should find authors by name', () => {
    const results = searchEntities({ entityType: 'author', query: 'Chen' });
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name).toContain('Chen');
  });

  it('should find institutions by name', () => {
    const results = searchEntities({ entityType: 'institution', query: 'Technology' });
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name).toContain('Technology');
  });

  it('should be case-insensitive', () => {
    const results = searchEntities({ entityType: 'author', query: 'chen' });
    expect(results.length).toBeGreaterThan(0);
  });

  it('should respect limit parameter', () => {
    const results = searchEntities({ entityType: 'author', query: '', limit: 2 });
    expect(results.length).toBeLessThanOrEqual(2);
  });

  it('should return empty array for no matches', () => {
    const results = searchEntities({ entityType: 'author', query: 'xyz123notfound' });
    expect(results).toEqual([]);
  });
});

describe('getMetrics', () => {
  it('should retrieve metrics for an author', () => {
    const metrics = getMetrics({ entityType: 'author', entityId: 'auth_001' });
    expect(metrics).toBeDefined();
    expect(metrics?.publications).toBe(156);
    expect(metrics?.citations).toBe(4823);
    expect(metrics?.hIndex).toBe(42);
  });

  it('should retrieve metrics for an institution', () => {
    const metrics = getMetrics({ entityType: 'institution', entityId: 'inst_001' });
    expect(metrics).toBeDefined();
    expect(metrics?.publications).toBe(12456);
  });

  it('should return null for non-existent entity', () => {
    const metrics = getMetrics({ entityType: 'author', entityId: 'nonexistent' });
    expect(metrics).toBeNull();
  });
});

describe('compareEntities', () => {
  it('should compare two authors on citations', () => {
    const comparison = compareEntities({
      entityType: 'author',
      entityIdA: 'auth_002',
      entityIdB: 'auth_001',
      metric: 'citations'
    });
    
    expect(comparison).toBeDefined();
    expect(comparison?.entityA.id).toBe('auth_002');
    expect(comparison?.entityB.id).toBe('auth_001');
    expect(comparison?.entityA.value).toBe(8912);
    expect(comparison?.entityB.value).toBe(4823);
    expect(comparison?.difference).toBe(8912 - 4823);
  });

  it('should calculate percent difference correctly', () => {
    const comparison = compareEntities({
      entityType: 'author',
      entityIdA: 'auth_002',
      entityIdB: 'auth_001',
      metric: 'hIndex'
    });
    
    expect(comparison).toBeDefined();
    const expectedPercent = ((58 - 42) / 42) * 100;
    expect(comparison?.percentDifference).toBeCloseTo(expectedPercent, 1);
  });

  it('should return null for non-existent entities', () => {
    const comparison = compareEntities({
      entityType: 'author',
      entityIdA: 'nonexistent',
      entityIdB: 'auth_001',
      metric: 'citations'
    });
    
    expect(comparison).toBeNull();
  });

  it('should return null for non-existent metric', () => {
    const comparison = compareEntities({
      entityType: 'author',
      entityIdA: 'auth_001',
      entityIdB: 'auth_002',
      metric: 'nonexistentMetric'
    });
    
    expect(comparison).toBeNull();
  });
});

describe('getTrend', () => {
  it('should retrieve trend data for an entity', () => {
    const trend = getTrend({ entityId: 'auth_001', metric: 'publications' });
    expect(trend).toBeDefined();
    expect(trend!.length).toBeGreaterThan(0);
    expect(trend![0]).toHaveProperty('year');
    expect(trend![0]).toHaveProperty('value');
  });

  it('should filter by start year', () => {
    const trend = getTrend({ entityId: 'auth_001', metric: 'publications', startYear: 2021 });
    expect(trend).toBeDefined();
    expect(trend!.every(point => point.year >= 2021)).toBe(true);
  });

  it('should filter by end year', () => {
    const trend = getTrend({ entityId: 'auth_001', metric: 'publications', endYear: 2021 });
    expect(trend).toBeDefined();
    expect(trend!.every(point => point.year <= 2021)).toBe(true);
  });

  it('should filter by year range', () => {
    const trend = getTrend({ 
      entityId: 'auth_001', 
      metric: 'publications', 
      startYear: 2020, 
      endYear: 2022 
    });
    expect(trend).toBeDefined();
    expect(trend!.every(point => point.year >= 2020 && point.year <= 2022)).toBe(true);
  });

  it('should return null for non-existent entity', () => {
    const trend = getTrend({ entityId: 'nonexistent', metric: 'publications' });
    expect(trend).toBeNull();
  });
});

describe('getTopEntities', () => {
  it('should return top authors by citations', () => {
    const top = getTopEntities({ entityType: 'author', metric: 'citations', limit: 2 });
    expect(top.length).toBe(2);
    // Should be sorted descending
    expect(top[0].metrics.citations).toBeGreaterThanOrEqual(top[1].metrics.citations);
  });

  it('should return top institutions by publications', () => {
    const top = getTopEntities({ entityType: 'institution', metric: 'publications', limit: 3 });
    expect(top.length).toBe(3);
    expect(top[0].metrics.publications).toBeGreaterThanOrEqual(top[1].metrics.publications);
  });

  it('should respect limit parameter', () => {
    const top = getTopEntities({ entityType: 'author', metric: 'hIndex', limit: 1 });
    expect(top.length).toBe(1);
  });

  it('should default to limit 10', () => {
    const top = getTopEntities({ entityType: 'author', metric: 'citations' });
    expect(top.length).toBeLessThanOrEqual(10);
  });
});
