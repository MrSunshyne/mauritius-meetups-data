import fs from 'fs/promises';
import path from 'path';
import { FetchConfig, FetchResult } from './types';
import { FETCH_OPTIONS } from './config';

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
    
    return {
      slug: config.slug,
      success: true,
      eventsCount: typeof eventsCount === 'number' ? eventsCount : undefined,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    console.error(`❌ ${config.slug}: Failed to fetch data - ${errorMessage} (${duration}ms)`);
    
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

  return results;
}
