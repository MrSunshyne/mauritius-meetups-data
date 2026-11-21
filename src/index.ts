#!/usr/bin/env node

import { fetchAllMeetupData } from './fetcher.ts';
import { MEETUP_GROUPS } from './config.ts';

/**
 * Main entry point for the Mauritius Meetups Data Fetcher
 */
async function main(): Promise<void> {
  try {
    const results = await fetchAllMeetupData(MEETUP_GROUPS);
    
    // Exit with error code if any fetches failed
    const hasFailures = results.some(result => !result.success);
    if (hasFailures) {
      process.exit(1);
    }
    
    console.log('\n🎉 All data fetched successfully!');
  } catch (error) {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  }
}

// Run the main function if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
}

export { fetchAllMeetupData, fetchMeetupData } from './fetcher.ts';
export { MEETUP_GROUPS, FETCH_OPTIONS } from './config.ts';
export type * from './types.ts';
