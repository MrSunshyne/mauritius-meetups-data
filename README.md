# Mauritius Meetups Data

Consider this repository to be a cache layer for meetup.mu API.

## ⚡ Why Bun?

This project uses [Bun](https://bun.sh) for TypeScript execution, which provides:

- **Native TypeScript support** - No compilation step needed
- **Blazing fast performance** - Significantly faster than Node.js
- **Built-in fetch** - No additional dependencies required
- **Zero configuration** - Works out of the box with TypeScript

## 📁 Data Structure

The fetcher retrieves data from the meetup.mu api endpoints and stores them in organized JSON files.

```
data/
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

## 🛠️ Installation

This project uses `pnpm` for package management and Bun for native TypeScript execution.

### Prerequisites

- [Bun](https://bun.sh) 1.0.0 or higher

```bash
# Clone the repository
git clone <your-repo-url>
cd mauritius-meetups-data

# Install dependencies
pnpm install
```

## 📖 Usage

### Fetch All Meetup Data

```bash
# Using pnpm scripts
pnpm start

# Or directly with Bun
bun src/index.ts

# Or alternatively
pnpm fetch
pnpm run dev
```

### Available Scripts

- `pnpm start` - Fetch all meetup data (uses Bun for TypeScript execution)
- `pnpm fetch` - Alias for start  
- `pnpm dev` - Development mode (same as start)
- `pnpm run trigger` - Trigger GitHub Action (requires GITHUB_TOKEN)

## 🤖 Automated Data Updates

The repository includes a GitHub Action that automatically fetches and updates meetup data daily.

### How It Works

The GitHub Action (`.github/workflows/fetch-meetup-data.yml`):

1. **Runs daily at 8 AM UTC** - Ensures fresh data every day
2. **Can be triggered manually** - Via GitHub's "Actions" tab
3. **Fetches all meetup data** - Using the same Bun-powered script
4. **Smart commits** - Only commits when data actually changes
5. **Clean logging** - Shows exactly what was updated

### Manual Trigger

You can manually trigger the data fetch from GitHub:

1. Go to the "Actions" tab in the repository
2. Select "Fetch Meetup Data" workflow
3. Click "Run workflow"
4. The action will fetch data and commit any changes

### Webhook Support

External services can trigger data fetches by calling GitHub's repository dispatch API directly:

**Webhook URL:** `https://api.github.com/repos/MrSunshyne/mauritius-meetups-data/dispatches`

**Required Headers:**
```
Authorization: Bearer YOUR_GITHUB_TOKEN
Accept: application/vnd.github.v3+json
Content-Type: application/json
```

**Body:** `{"event_type": "fetch-meetup-data"}`

See [`WEBHOOK.md`](WEBHOOK.md) for complete integration guide with examples in multiple languages.

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
