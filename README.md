# Mauritius Meetups Data

Consider this repository to be a cache layer for meetup.mu API.

## 📁 Data Structure

The fetcher retrieves data from the meetup.mu api endpoints and stores them in organized JSON files.

```
data/
├── communities.json           # Community metadata & last updated timestamps
├── frontendmu/events.json
├── mscc/events.json
├── pydata/events.json
├── cloudnativemu/events.json
├── nugm/events.json
├── laravelmoris/events.json
├── gophersmu/events.json
├── mobilehorizon/events.json
└── pymug/events.json
```

### Community Metadata

The `data/communities.json` file tracks when each community was last run and successfully updated:

```json
{
  "frontendmu": {
    "lastRun": "2025-09-23T19:27:30.470Z",
    "lastUpdated": "2025-09-23T19:27:30.470Z",
    "meta": {}
  },
  "mscc": {
    "lastRun": "2025-09-23T19:27:30.470Z",
    "lastUpdated": "2025-09-23T19:27:30.470Z", 
    "meta": {}
  }
}
```

- **`lastRun`**: ISO timestamp of last fetch attempt (updated regardless of success/failure)
- **`lastUpdated`**: ISO timestamp of last successful data fetch (null if never successful)
- **`meta`**: Object for additional community-specific metadata (empty by default)

## 🤖 Automated Data Updates

The repository includes a GitHub Action that automatically fetches and updates meetup data daily.

### Trigger from external services with Webhook Support

External services can trigger data fetches by calling GitHub's repository dispatch API directly:

```bash
curl -X POST https://api.github.com/repos/MrSunshyne/mauritius-meetups-data/dispatches \
  -H "Authorization: Bearer YOUR_GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Content-Type: application/json" \
  -d '{"event_type": "fetch-meetup-data"}'
```

See [`WEBHOOK.md`](WEBHOOK.md) for complete integration guide with examples in multiple languages.


### Manual Trigger

You can manually trigger the data fetch from GitHub:

1. Go to the "Actions" tab in the repository
2. Select "Fetch Meetup Data" workflow
3. Click "Run workflow"
4. The action will fetch data and commit any changes

## 🔧 Configuration

The fetcher is configured in `src/config.ts`. You can:

- Add new meetup groups
- Modify API endpoints
- Change output paths
- Adjust timeout and retry settings

### Adding a New Meetup Group

```typescript
// In src/config.ts
export const MEETUP_GROUPS: FetchConfig[] = [
  // ... existing groups
  {
    slug: 'newgroup',
    endpoint: 'https://meetup.mu/api/v1/get/c/newgroup',
    outputPath: path.join(process.cwd(), 'data', 'newgroup', 'events.json'),
  },
];
```

## 🙏 Acknowledgments

- Thanks to the [meetup.mu](https://meetup.mu) platform for providing the API
- All the amazing Mauritian tech communities for organizing these meetups
