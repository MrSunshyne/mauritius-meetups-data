import { FetchConfig } from './types';
import path from 'path';

/**
 * Configuration for all meetup groups to fetch
 */
export const MEETUP_GROUPS: FetchConfig[] = [
  {
    slug: 'frontendmu',
    endpoint: 'https://meetup.mu/api/v1/get/c/frontendmu',
    outputPath: path.join(process.cwd(), 'data', 'frontendmu', 'events.json'),
  },
  {
    slug: 'mscc',
    endpoint: 'https://meetup.mu/api/v1/get/c/mscc',
    outputPath: path.join(process.cwd(), 'data', 'mscc', 'events.json'),
  },
  {
    slug: 'pydata',
    endpoint: 'https://meetup.mu/api/v1/get/c/pydata',
    outputPath: path.join(process.cwd(), 'data', 'pydata', 'events.json'),
  },
  {
    slug: 'cloudnativemu',
    endpoint: 'https://meetup.mu/api/v1/get/c/cloudnativemu',
    outputPath: path.join(process.cwd(), 'data', 'cloudnativemu', 'events.json'),
  },
  {
    slug: 'nugm',
    endpoint: 'https://meetup.mu/api/v1/get/c/nugm',
    outputPath: path.join(process.cwd(), 'data', 'nugm', 'events.json'),
  },
  {
    slug: 'laravelmoris',
    endpoint: 'https://meetup.mu/api/v1/get/c/laravelmoris',
    outputPath: path.join(process.cwd(), 'data', 'laravelmoris', 'events.json'),
  },
  {
    slug: 'gophersmu',
    endpoint: 'https://meetup.mu/api/v1/get/c/gophersmu',
    outputPath: path.join(process.cwd(), 'data', 'gophersmu', 'events.json'),
  },
  {
    slug: 'mobilehorizon',
    endpoint: 'https://meetup.mu/api/v1/get/c/mobilehorizon',
    outputPath: path.join(process.cwd(), 'data', 'mobilehorizon', 'events.json'),
  },
  {
    slug: 'pymug',
    endpoint: 'https://meetup.mu/api/v1/get/c/pymug',
    outputPath: path.join(process.cwd(), 'data', 'pymug', 'events.json'),
  },
];

/**
 * Fetch configuration options
 */
export const FETCH_OPTIONS = {
  timeout: 30000, // 30 seconds
  retries: 3,
  retryDelay: 1000, // 1 second
} as const;
