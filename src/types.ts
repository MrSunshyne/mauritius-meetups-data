/**
 * Types for the Mauritius Meetups Data Fetcher
 */

export interface MeetupEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  location?: string;
  organizer?: string;
  attendees?: number;
  [key: string]: any; // Allow for additional fields that may exist in the API
}

export interface MeetupGroup {
  id: string;
  name: string;
  slug: string;
  description?: string;
  events: MeetupEvent[];
  [key: string]: any; // Allow for additional fields that may exist in the API
}

export interface FetchConfig {
  slug: string;
  endpoint: string;
  outputPath: string;
}

export interface FetchResult {
  slug: string;
  success: boolean;
  error?: string;
  eventsCount?: number;
}
