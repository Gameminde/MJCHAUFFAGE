#!/usr/bin/env node
// Figma MCP client (stdio) to list/call tools and sync tokens
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a.startsWith('--')) {
      const key = a.replace(/^--/, '');
      const val = args[i + 1] && !args[i + 1].startsWith('--') ? args[++i] : true;
      opts[key] = val;
    }
  }
  return opts;
}

async function main() {
  const opts = parseArgs();
  const figmaKey = opts['figma-key'] || process.env.FIGMA_API_KEY;
  if (!figmaKey) {
    console.error('FIGMA_API_KEY missing. Set env or pass --figma-key <token>.');
    process.exit(1);
  }

  const transport = new StdioClientTransport({
    command: 'npx',
    args: ['-y', 'figma-developer-mcp', '--stdio'],
    env: { ...process.env, FIGMA_API_KEY: figmaKey },
  });
  const client = new Client(transport);
  await client.connect();

  // Default action: list tools
  const tools = await client.listTools();
  console.log('Available MCP tools:');
  for (const t of tools.tools) {
    console.log(`- ${t.name}: ${t.description || ''}`);
  }

  // If a tool is specified, call it with optional JSON args
  if (opts.tool) {
    let argsObj = {};
    if (opts.args) {
      try {
        argsObj = JSON.parse(opts.args);
      } catch (e) {
        console.error('Failed to parse --args JSON:', e.message);
        process.exit(2);
      }
    }

    const result = await client.callTool(opts.tool, argsObj);
    console.log('Tool result:', JSON.stringify(result, null, 2));

    // Optional write to file
    if (opts.out) {
      const fs = await import('node:fs');
      fs.writeFileSync(opts.out, JSON.stringify(result, null, 2), 'utf-8');
      console.log('Wrote result to', opts.out);
    }
  }

  await transport.close();
}

main().catch(err => {
  console.error('MCP client error:', err);
  process.exit(1);
});
