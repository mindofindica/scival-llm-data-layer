/**
 * Example client demonstrating LLM Data Layer usage
 * 
 * Run with: tsx examples/client-demo.ts
 */

const API_BASE = 'http://localhost:3000';

async function queryAPI(functionName: string, params: any) {
  const response = await fetch(`${API_BASE}/api/query/${functionName}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  
  return response.json();
}

async function batchQuery(queries: Array<{ functionName: string; params: any }>) {
  const response = await fetch(`${API_BASE}/api/batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ queries })
  });
  
  return response.json();
}

async function demo() {
  console.log('🔬 SciVal LLM Data Layer - Client Demo\n');
  
  // Example 1: Search for authors
  console.log('📋 Example 1: Search for authors named "Chen"');
  const searchResult = await queryAPI('searchEntities', {
    entityType: 'author',
    query: 'Chen',
    limit: 3
  });
  console.log(`Found ${searchResult.result.length} author(s):`);
  searchResult.result.forEach((author: any) => {
    console.log(`  - ${author.name} (${author.affiliation}): ${author.metrics.publications} publications`);
  });
  console.log();
  
  // Example 2: Compare two authors
  console.log('⚖️  Example 2: Compare citations of two authors');
  const compareResult = await queryAPI('compareEntities', {
    entityType: 'author',
    entityIdA: 'auth_002',
    entityIdB: 'auth_001',
    metric: 'citations'
  });
  console.log(`${compareResult.result.entityA.name}: ${compareResult.result.entityA.value} citations`);
  console.log(`${compareResult.result.entityB.name}: ${compareResult.result.entityB.value} citations`);
  console.log(`Difference: ${compareResult.result.difference} (${compareResult.result.percentDifference.toFixed(1)}% more)`);
  console.log();
  
  // Example 3: Get publication trends
  console.log('📈 Example 3: Publication trends for Dr. Sarah Chen (2020-2023)');
  const trendResult = await queryAPI('getTrend', {
    entityId: 'auth_001',
    metric: 'publications',
    startYear: 2020,
    endYear: 2023
  });
  console.log('Year-over-year publications:');
  trendResult.result.forEach((point: any) => {
    console.log(`  ${point.year}: ${'█'.repeat(point.value / 2)} ${point.value}`);
  });
  console.log();
  
  // Example 4: Top institutions
  console.log('🏆 Example 4: Top 3 institutions by publications');
  const topResult = await queryAPI('getTopEntities', {
    entityType: 'institution',
    metric: 'publications',
    limit: 3
  });
  topResult.result.forEach((inst: any, i: number) => {
    console.log(`  ${i + 1}. ${inst.name}: ${inst.metrics.publications.toLocaleString()} publications`);
  });
  console.log();
  
  // Example 5: Batch query
  console.log('🔄 Example 5: Batch query - Get top author and their trends');
  const batchResult = await batchQuery([
    {
      functionName: 'getTopEntities',
      params: { entityType: 'author', metric: 'citations', limit: 1 }
    },
    {
      functionName: 'getTrend',
      params: { entityId: 'auth_002', metric: 'publications' }
    }
  ]);
  
  const topAuthor = batchResult.results[0].result[0];
  const authorTrend = batchResult.results[1].result;
  
  console.log(`Top author by citations: ${topAuthor.name}`);
  console.log(`Publications over time:`);
  authorTrend.forEach((point: any) => {
    console.log(`  ${point.year}: ${point.value}`);
  });
  console.log();
  
  // Example 6: Complex analytical question
  console.log('💡 Example 6: Analytical scenario - "Who should I collaborate with?"');
  console.log('Scenario: I\'m an early-career researcher. Show me top authors by h-index\n');
  
  const topAuthorsResult = await queryAPI('getTopEntities', {
    entityType: 'author',
    metric: 'hIndex',
    limit: 3
  });
  
  console.log('Potential collaborators (ranked by h-index):');
  topAuthorsResult.result.forEach((author: any, i: number) => {
    console.log(`\n${i + 1}. ${author.name} (${author.affiliation})`);
    console.log(`   h-index: ${author.metrics.hIndex}`);
    console.log(`   Citations: ${author.metrics.citations.toLocaleString()}`);
    console.log(`   Publications: ${author.metrics.publications}`);
    console.log(`   Field-Weighted Citation Impact: ${author.metrics.fieldWeightedCitationImpact}`);
  });
  
  console.log('\n✅ Demo complete!');
}

// Run demo if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  demo().catch(console.error);
}

export { queryAPI, batchQuery };
