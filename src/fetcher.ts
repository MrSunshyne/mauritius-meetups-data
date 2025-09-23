import fs from 'fs/promises';
import path from 'path';
import { FetchConfig, FetchResult, Communities, CommunityMetadata } from './types';
import { FETCH_OPTIONS, COMMUNITIES_FILE_PATH } from './config';

/**
 * Utility function to delay execution
 */
const delay = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetch data from a single endpoint with retry logic
 */
async function fetchWithRetry(url: string, maxRetries: number = FETCH_OPTIONS.retries): Promise<any> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), FETCH_OPTIONS.timeout);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'mauritius-meetups-data-fetcher/1.0.0',
          'Accept': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON');
      }

      return await response.json();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt < maxRetries) {
        console.warn(`Attempt ${attempt + 1} failed for ${url}: ${lastError.message}. Retrying in ${FETCH_OPTIONS.retryDelay}ms...`);
        await delay(FETCH_OPTIONS.retryDelay);
      }
    }
  }

  throw lastError!;
}

/**
 * Ensure directory exists
 */
async function ensureDirectoryExists(filePath: string): Promise<void> {
  const dir = path.dirname(filePath);
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

/**
 * Read communities metadata from file
 */
async function readCommunitiesMetadata(): Promise<Communities> {
  try {
    const data = await fs.readFile(COMMUNITIES_FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.warn('⚠️  Could not read communities.json, creating default structure');
    // Return empty object if file doesn't exist or is invalid
    return {};
  }
}


/**
 * Update all communities metadata at once to avoid race conditions
 */
async function updateAllCommunitiesMetadata(results: FetchResult[]): Promise<void> {
  try {
    const communities = await readCommunitiesMetadata();
    const currentTimestamp = new Date().toISOString();
    
    // Update all communities based on fetch results
    for (const result of results) {
      if (!communities[result.slug]) {
        communities[result.slug] = { lastRun: null, lastUpdated: null, meta: {} };
      }
      
      // Always update lastRun (regardless of success/failure)
      communities[result.slug].lastRun = currentTimestamp;
      
      // Only update lastUpdated if the fetch was successful
      if (result.success) {
        communities[result.slug].lastUpdated = currentTimestamp;
      }
    }
    
    // Ensure directory exists
    await ensureDirectoryExists(COMMUNITIES_FILE_PATH);
    
    // Write updated communities data
    const jsonData = JSON.stringify(communities, null, 2);
    await fs.writeFile(COMMUNITIES_FILE_PATH, jsonData, 'utf-8');
    
    const successfulCount = results.filter(r => r.success).length;
    const failedCount = results.filter(r => !r.success).length;
    
    console.log(`📄 Updated communities metadata: ${successfulCount} successful, ${failedCount} failed`);
  } catch (error) {
    console.warn(`⚠️  Could not update communities metadata:`, error instanceof Error ? error.message : String(error));
  }
}

/**
 * Fetch data for a single meetup group
 */
export async function fetchMeetupData(config: FetchConfig): Promise<FetchResult> {
  const startTime = Date.now();
  console.log(`📥 Fetching data for ${config.slug}...`);

  try {
    // Fetch data from the endpoint
    const data = await fetchWithRetry(config.endpoint);
    
    // Ensure output directory exists
    await ensureDirectoryExists(config.outputPath);
    
    // Write data to file with pretty formatting
    const jsonData = JSON.stringify(data, null, 2);
    await fs.writeFile(config.outputPath, jsonData, 'utf-8');
    
    const duration = Date.now() - startTime;
    const eventsCount = Array.isArray(data) ? data.length : (data.events?.length || 'unknown');
    
    console.log(`✅ ${config.slug}: Successfully saved ${eventsCount} events to ${config.outputPath} (${duration}ms)`);
    
    // Note: Community metadata will be updated by fetchAllMeetupData to avoid race conditions
    
    return {
      slug: config.slug,
      success: true,
      eventsCount: typeof eventsCount === 'number' ? eventsCount : undefined,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    console.error(`❌ ${config.slug}: Failed to fetch data - ${errorMessage} (${duration}ms)`);
    
    // Note: Community metadata will be updated by fetchAllMeetupData to avoid race conditions
    
    return {
      slug: config.slug,
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Fetch data for all meetup groups
 */
export async function fetchAllMeetupData(configs: FetchConfig[]): Promise<FetchResult[]> {
  console.log(`🚀 Starting to fetch data for ${configs.length} meetup groups...\n`);
  const startTime = Date.now();

  // Process all fetches concurrently for better performance
  const results = await Promise.all(
    configs.map(config => fetchMeetupData(config))
  );

  const duration = Date.now() - startTime;
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Successful: ${successful}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   ⏱️  Total time: ${duration}ms`);

  if (failed > 0) {
    console.log(`\n🔍 Failed groups:`);
    results
      .filter(r => !r.success)
      .forEach(r => console.log(`   - ${r.slug}: ${r.error}`));
  }

  // Update communities metadata with fetch results
  await updateAllCommunitiesMetadata(results);

  return results;
}
