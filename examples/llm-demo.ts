/**
 * Live LLM Integration Demo
 * 
 * Shows the SciVal LLM Data Layer being used by an actual AI assistant.
 * Demonstrates natural language → function calling → structured response.
 * 
 * Run with: OPENAI_API_KEY=sk-... tsx examples/llm-demo.ts
 */

import OpenAI from 'openai';

const API_BASE = 'http://localhost:3000';

interface Message {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string | null;
  function_call?: any;
  name?: string;
}

// Fetch function definitions from the API
async function getFunctionDefinitions(): Promise<any[]> {
  const response = await fetch(`${API_BASE}/api/functions`);
  const data = await response.json();
  return data.functions;
}

// Execute a function call against the API
async function executeFunction(functionName: string, params: any): Promise<any> {
  const response = await fetch(`${API_BASE}/api/query/${functionName}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  
  const data = await response.json();
  return data.result;
}

// Run conversation with LLM + function calling
async function runConversation(userQuestion: string) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
  
  console.log('\n🧠 Initializing LLM with SciVal function definitions...');
  const functions = await getFunctionDefinitions();
  console.log(`✅ Loaded ${functions.length} function definitions\n`);
  
  const messages: Message[] = [
    {
      role: 'system',
      content: 'You are a research analytics assistant with access to the SciVal database. Use the provided functions to answer questions about authors, institutions, and journals.'
    },
    {
      role: 'user',
      content: userQuestion
    }
  ];
  
  console.log(`❓ User question: "${userQuestion}"\n`);
  
  let iteration = 0;
  const maxIterations = 5;
  
  while (iteration < maxIterations) {
    iteration++;
    
    // Call LLM
    const response = await openai.chat.completions.create({
      model: 'gpt-4-0125-preview',
      messages: messages as any,
      functions: functions,
      function_call: 'auto'
    });
    
    const message = response.choices[0].message;
    
    // If no function call, we're done
    if (!message.function_call) {
      console.log(`\n💬 Assistant response:\n${message.content}\n`);
      break;
    }
    
    // Execute function call
    const functionName = message.function_call.name;
    const functionArgs = JSON.parse(message.function_call.arguments);
    
    console.log(`🔧 LLM called: ${functionName}(${JSON.stringify(functionArgs, null, 2)})`);
    
    const result = await executeFunction(functionName, functionArgs);
    console.log(`📊 Result: ${JSON.stringify(result, null, 2)}\n`);
    
    // Add function call and result to conversation
    messages.push({
      role: 'assistant',
      content: null,
      function_call: message.function_call
    });
    
    messages.push({
      role: 'function',
      name: functionName,
      content: JSON.stringify(result)
    });
  }
  
  if (iteration >= maxIterations) {
    console.log('⚠️  Maximum iterations reached');
  }
}

// Demo scenarios
async function demo() {
  console.log('='.repeat(80));
  console.log('🔬 SciVal LLM Data Layer - Live AI Integration Demo');
  console.log('='.repeat(80));
  
  const scenarios = [
    {
      title: 'Simple Query',
      question: 'Who is the most cited author in the database?'
    },
    {
      title: 'Comparison',
      question: 'How does MIT compare to Stanford in terms of research output?'
    },
    {
      title: 'Trend Analysis',
      question: 'Show me the publication trends for the top author over the past 5 years'
    }
  ];
  
  for (const scenario of scenarios) {
    console.log('\n' + '─'.repeat(80));
    console.log(`📌 Scenario: ${scenario.title}`);
    console.log('─'.repeat(80));
    
    await runConversation(scenario.question);
    
    // Pause between scenarios
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('='.repeat(80));
  console.log('✅ Demo complete!');
  console.log('='.repeat(80));
}

// Check for API key
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ Error: OPENAI_API_KEY environment variable not set');
  console.log('\nUsage: OPENAI_API_KEY=sk-... tsx examples/llm-demo.ts');
  process.exit(1);
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  demo().catch(console.error);
}

export { runConversation, getFunctionDefinitions, executeFunction };
