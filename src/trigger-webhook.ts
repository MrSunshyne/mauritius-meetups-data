#!/usr/bin/env bun

/**
 * CLI Tool to Trigger GitHub Action
 * 
 * This script triggers the GitHub Action directly via repository dispatch API.
 * External services can use the same API endpoint to trigger data fetches.
 */

// Configuration from environment or command line
const CONFIG = {
  githubToken: process.env.GITHUB_TOKEN,
  githubRepo: process.env.GITHUB_REPO || 'MrSunshyne/mauritius-meetups-data',
};

/**
 * Trigger GitHub Action directly via repository dispatch
 */
async function triggerGitHubActionDirect(): Promise<boolean> {
  if (!CONFIG.githubToken) {
    console.error('❌ GITHUB_TOKEN environment variable is required for direct GitHub API calls');
    console.error('   Set it with: export GITHUB_TOKEN="your_personal_access_token"');
    return false;
  }

  const url = `https://api.github.com/repos/${CONFIG.githubRepo}/dispatches`;
  
  try {
    console.log('🚀 Triggering GitHub Action directly...');
    console.log(`📍 Repository: ${CONFIG.githubRepo}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `Bearer ${CONFIG.githubToken}`,
        'Content-Type': 'application/json',
        'User-Agent': 'mauritius-meetups-trigger/1.0.0',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({
        event_type: 'fetch-meetup-data',
        client_payload: {
          triggered_by: 'cli-tool',
          timestamp: new Date().toISOString(),
          source: 'direct-api-call',
        },
      }),
    });

    if (response.ok) {
      console.log('✅ GitHub Action triggered successfully!');
      console.log('🔍 Check the Actions tab in your repository to see the workflow run');
      return true;
    } else {
      const errorText = await response.text();
      console.error(`❌ Failed to trigger GitHub Action: ${response.status} ${response.statusText}`);
      console.error(`Response: ${errorText}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Error triggering GitHub Action:', error);
    return false;
  }
}


/**
 * Show help information
 */
function showHelp() {
  console.log(`
🎯 Mauritius Meetups GitHub Action Trigger

Usage:
  bun src/trigger-webhook.ts [command]

Commands:
  trigger   Trigger GitHub Action directly via API (default)
  help      Show this help message

Environment Variables:
  GITHUB_TOKEN      GitHub personal access token (required)
  GITHUB_REPO       GitHub repository (default: MrSunshyne/mauritius-meetups-data)

Examples:
  # Trigger GitHub Action
  GITHUB_TOKEN=ghp_xxxx bun src/trigger-webhook.ts trigger

  # Or just run without command (defaults to trigger)
  GITHUB_TOKEN=ghp_xxxx bun src/trigger-webhook.ts

External Services can trigger the GitHub Action by calling:
  POST https://api.github.com/repos/MrSunshyne/mauritius-meetups-data/dispatches

With headers:
  Authorization: Bearer YOUR_GITHUB_TOKEN
  Accept: application/vnd.github.v3+json
  Content-Type: application/json

Body:
  {"event_type": "fetch-meetup-data"}
`);
}

/**
 * Main CLI function
 */
async function main() {
  const command = process.argv[2] || 'trigger';

  switch (command.toLowerCase()) {
    case 'trigger':
    case 'direct': // Keep 'direct' for backward compatibility
      const success = await triggerGitHubActionDirect();
      process.exit(success ? 0 : 1);

    case 'help':
    case '--help':
    case '-h':
      showHelp();
      process.exit(0);

    default:
      console.error(`❌ Unknown command: ${command}`);
      showHelp();
      process.exit(1);
  }
}

// Run CLI if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('💥 CLI error:', error);
    process.exit(1);
  });
}
