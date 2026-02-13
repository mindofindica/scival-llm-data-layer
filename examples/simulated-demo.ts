/**
 * Simulated LLM Demo (No API Key Required)
 * 
 * Demonstrates what the LLM integration looks like without requiring
 * an actual LLM API key. Perfect for presentations and brainstorms.
 * 
 * Run with: tsx examples/simulated-demo.ts
 */

const API_BASE = 'http://localhost:3000';

interface Step {
  speaker: 'user' | 'assistant' | 'system';
  content: string;
  functionCall?: {
    name: string;
    params: any;
  };
  functionResult?: any;
}

async function queryAPI(functionName: string, params: any) {
  const response = await fetch(`${API_BASE}/api/query/${functionName}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  
  const data = await response.json();
  return data.result;
}

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function formatJSON(obj: any, indent = 2): string {
  return JSON.stringify(obj, null, indent)
    .split('\n')
    .map(line => '    ' + line)
    .join('\n');
}

async function simulateScenario(title: string, steps: Step[]) {
  console.log('\n' + '━'.repeat(80));
  console.log(`📌 ${title}`);
  console.log('━'.repeat(80) + '\n');
  
  for (const step of steps) {
    if (step.speaker === 'user') {
      console.log(`👤 User: "${step.content}"\n`);
      await delay(500);
    } else if (step.speaker === 'assistant') {
      if (step.functionCall) {
        console.log(`🤖 Assistant (thinking): I need to call ${step.functionCall.name}()`);
        console.log(`📋 Parameters:`);
        console.log(formatJSON(step.functionCall.params));
        console.log();
        
        await delay(800);
        
        // Execute the actual function
        console.log(`⚙️  Executing query...`);
        const result = await queryAPI(step.functionCall.name, step.functionCall.params);
        
        console.log(`📊 Result:`);
        console.log(formatJSON(result));
        console.log();
        
        await delay(1000);
      } else {
        console.log(`💬 Assistant: ${step.content}\n`);
        await delay(1000);
      }
    }
  }
}

async function demo() {
  console.log('═'.repeat(80));
  console.log('🔬 SciVal LLM Data Layer - Simulated Demo');
  console.log('═'.repeat(80));
  console.log('\nThis demo shows what an LLM conversation looks like using the data layer.');
  console.log('The function calls and results are real; the LLM responses are simulated.\n');
  
  await delay(1500);
  
  // Scenario 1: Simple ranking query
  await simulateScenario('Scenario 1: Simple Ranking Query', [
    {
      speaker: 'user',
      content: 'Who is the most cited author in the database?'
    },
    {
      speaker: 'assistant',
      functionCall: {
        name: 'getTopEntities',
        params: {
          entityType: 'author',
          metric: 'citations',
          limit: 1
        }
      }
    },
    {
      speaker: 'assistant',
      content: 'Based on the data, **Dr. Michael Zhang** from Stanford University is the most cited author with **45,000 citations**. He has published 250 papers with an impressive h-index of 85 and a field-weighted citation impact of 2.8.'
    }
  ]);
  
  // Scenario 2: Comparison
  await simulateScenario('Scenario 2: Institutional Comparison', [
    {
      speaker: 'user',
      content: 'Compare MIT and Stanford on research output'
    },
    {
      speaker: 'assistant',
      functionCall: {
        name: 'searchEntities',
        params: {
          entityType: 'institution',
          query: 'MIT',
          limit: 1
        }
      }
    },
    {
      speaker: 'assistant',
      functionCall: {
        name: 'searchEntities',
        params: {
          entityType: 'institution',
          query: 'Stanford',
          limit: 1
        }
      }
    },
    {
      speaker: 'assistant',
      functionCall: {
        name: 'compareEntities',
        params: {
          entityType: 'institution',
          entityIdA: 'inst_001',
          entityIdB: 'inst_002',
          metric: 'publications'
        }
      }
    },
    {
      speaker: 'assistant',
      content: 'Here\'s the comparison:\n\n**MIT**: 15,000 publications\n**Stanford**: 12,000 publications\n\nMIT has produced **25% more publications** than Stanford. However, both institutions show strong collaboration metrics, with MIT at 65% international collaboration and Stanford at 60%.'
    }
  ]);
  
  // Scenario 3: Multi-step analytical query
  await simulateScenario('Scenario 3: Trend Analysis', [
    {
      speaker: 'user',
      content: 'Show me publication trends for the top author over the last 5 years'
    },
    {
      speaker: 'assistant',
      functionCall: {
        name: 'getTopEntities',
        params: {
          entityType: 'author',
          metric: 'citations',
          limit: 1
        }
      }
    },
    {
      speaker: 'assistant',
      functionCall: {
        name: 'getTrend',
        params: {
          entityId: 'auth_002',
          metric: 'publications',
          startYear: 2019,
          endYear: 2023
        }
      }
    },
    {
      speaker: 'assistant',
      content: 'Here are the publication trends for **Dr. Michael Zhang** (2019-2023):\n\n📈 Publications by Year:\n- 2019: 42 papers\n- 2020: 38 papers (slight dip, possibly COVID impact)\n- 2021: 51 papers (strong recovery)\n- 2022: 63 papers\n- 2023: 56 papers\n\n**Analysis**: Dr. Zhang shows consistently high productivity with a notable surge in 2021-2022, averaging over 50 publications per year in recent years.'
    }
  ]);
  
  // Scenario 4: Complex multi-entity query
  await simulateScenario('Scenario 4: Finding Collaboration Opportunities', [
    {
      speaker: 'user',
      content: 'I\'m a researcher interested in high-impact work. Show me the top 3 authors by h-index and their institutions'
    },
    {
      speaker: 'assistant',
      functionCall: {
        name: 'getTopEntities',
        params: {
          entityType: 'author',
          metric: 'hIndex',
          limit: 3
        }
      }
    },
    {
      speaker: 'assistant',
      content: 'Here are the **top 3 researchers by h-index** who could be excellent collaboration partners:\n\n**1. Dr. Michael Zhang** (h-index: 85)\n   - Institution: Stanford University\n   - Citations: 45,000\n   - Publications: 250\n   - Expertise: Consistently high-impact work with FWCI of 2.8\n\n**2. Dr. Sarah Chen** (h-index: 72)\n   - Institution: MIT\n   - Citations: 32,000\n   - Publications: 180\n   - Expertise: Strong citation impact with 15% top percentile outputs\n\n**3. Dr. James Wilson** (h-index: 68)\n   - Institution: UC Berkeley\n   - Citations: 28,000\n   - Publications: 210\n   - Expertise: High productivity with FWCI of 2.3\n\nAll three researchers show exceptional impact and would be valuable collaborators for high-quality research.'
    }
  ]);
  
  console.log('═'.repeat(80));
  console.log('✅ Demo Complete!');
  console.log('═'.repeat(80));
  console.log('\n💡 Key Takeaways:');
  console.log('   • Natural language queries automatically map to function calls');
  console.log('   • LLM handles multi-step reasoning (search → compare, rank → detail)');
  console.log('   • Structured data enables rich, accurate responses');
  console.log('   • Same API works for ChatGPT, Claude, or custom UIs');
  console.log();
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  demo().catch(console.error);
}

export { simulateScenario };
