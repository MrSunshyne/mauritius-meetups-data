# Webhook Integration Guide

Direct integration with GitHub's repository dispatch API to trigger meetup data fetching.

## 🎯 Implementation Status

✅ **GitHub Action**: Supports `repository_dispatch` triggers  
✅ **Direct API Integration**: External services call GitHub API directly  
✅ **CLI Tool**: Test and trigger GitHub Actions locally  
✅ **Security**: GitHub token-based authentication  
✅ **Documentation**: Complete integration guide

## 🚀 Quick Start

### 1. Create GitHub Personal Access Token

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a descriptive name: "Mauritius Meetups Data Webhook"
4. Select scopes: **`repo`** (full repository access)
5. Click "Generate token" and save it securely

### 2. Test the Integration

```bash
# Set your GitHub token
export GITHUB_TOKEN=ghp_your_personal_access_token

# Test trigger locally
pnpm run trigger
```

### 3. Provide Webhook URL to External Services

Give your external services this information:

**Endpoint:** `https://api.github.com/repos/MrSunshyne/mauritius-meetups-data/dispatches`

**Method:** `POST`

**Headers:**
```
Authorization: Bearer YOUR_GITHUB_TOKEN
Accept: application/vnd.github.v3+json
Content-Type: application/json
X-GitHub-Api-Version: 2022-11-28
```

**Body:**
```json
{
  "event_type": "fetch-meetup-data"
}
```

## 📡 GitHub API Integration

### Direct API Call

External services trigger the GitHub Action by calling GitHub's repository dispatch API directly:

**cURL Example:**
```bash
curl -X POST https://api.github.com/repos/MrSunshyne/mauritius-meetups-data/dispatches \
  -H "Authorization: Bearer YOUR_GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  -d '{"event_type": "fetch-meetup-data"}'
```

**Response (Success):**
```
HTTP/1.1 204 No Content
```

**Response (Error):**
```json
{
  "message": "Not Found",
  "documentation_url": "https://docs.github.com/rest"
}
```

## 🔐 Security Features

### GitHub Token Authentication

- **Scope Required**: `repo` (full repository access)
- **Token Type**: Personal Access Token (classic) or Fine-grained token
- **Security**: Tokens should be stored securely and rotated regularly
- **Rate Limits**: GitHub API has rate limits (5000 requests/hour for authenticated requests)

## 🛠️ CLI Tools

### Trigger GitHub Action

```bash
# Set your GitHub token
export GITHUB_TOKEN=ghp_your_token

# Trigger GitHub Action
pnpm run trigger

# Or explicitly
bun src/trigger-webhook.ts trigger
```

### Help and Documentation

```bash
# Show usage help
bun src/trigger-webhook.ts help
```

## 🏗️ Integration Options

### 1. External Service Integration (Recommended)

Your external services call GitHub's API directly - no additional infrastructure needed:

```javascript
// Example: JavaScript/Node.js integration
async function triggerDataFetch() {
  const response = await fetch(
    'https://api.github.com/repos/MrSunshyne/mauritius-meetups-data/dispatches',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({
        event_type: 'fetch-meetup-data',
        client_payload: {
          source: 'monitoring-service',
          timestamp: new Date().toISOString(),
        },
      }),
    }
  );

  return response.status === 204;
}
```

### 2. CI/CD Pipeline Integration

Add to your CI/CD workflows:

```yaml
# Example: GitHub Actions workflow
- name: Trigger Meetup Data Fetch
  run: |
    curl -X POST https://api.github.com/repos/MrSunshyne/mauritius-meetups-data/dispatches \
      -H "Authorization: Bearer ${{ secrets.GITHUB_TOKEN }}" \
      -H "Accept: application/vnd.github.v3+json" \
      -H "Content-Type: application/json" \
      -d '{"event_type": "fetch-meetup-data"}'
```

### 3. Monitoring Service Integration

Most monitoring services support webhook/HTTP notifications:

```bash
# Example: Set up in your monitoring service
URL: https://api.github.com/repos/MrSunshyne/mauritius-meetups-data/dispatches
Method: POST
Headers:
  Authorization: Bearer YOUR_GITHUB_TOKEN
  Accept: application/vnd.github.v3+json  
  Content-Type: application/json
Body: {"event_type": "fetch-meetup-data"}
```

## 🔌 Language-Specific Examples

### Python

```python
import requests
import os

def trigger_data_fetch():
    url = "https://api.github.com/repos/MrSunshyne/mauritius-meetups-data/dispatches"
    headers = {
        "Authorization": f"Bearer {os.getenv('GITHUB_TOKEN')}",
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28"
    }
    payload = {"event_type": "fetch-meetup-data"}
    
    response = requests.post(url, json=payload, headers=headers)
    return response.status_code == 204
```

### PHP

```php
<?php
function triggerDataFetch() {
    $url = 'https://api.github.com/repos/MrSunshyne/mauritius-meetups-data/dispatches';
    $headers = [
        'Authorization: Bearer ' . $_ENV['GITHUB_TOKEN'],
        'Accept: application/vnd.github.v3+json',
        'Content-Type: application/json',
        'X-GitHub-Api-Version: 2022-11-28'
    ];
    $payload = json_encode(['event_type' => 'fetch-meetup-data']);
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    return $httpCode === 204;
}
?>
```

### Go

```go
package main

import (
    "bytes"
    "encoding/json"
    "net/http"
    "os"
)

func triggerDataFetch() bool {
    url := "https://api.github.com/repos/MrSunshyne/mauritius-meetups-data/dispatches"
    payload := map[string]string{"event_type": "fetch-meetup-data"}
    jsonPayload, _ := json.Marshal(payload)
    
    req, _ := http.NewRequest("POST", url, bytes.NewBuffer(jsonPayload))
    req.Header.Set("Authorization", "Bearer "+os.Getenv("GITHUB_TOKEN"))
    req.Header.Set("Accept", "application/vnd.github.v3+json")
    req.Header.Set("Content-Type", "application/json")
    req.Header.Set("X-GitHub-Api-Version", "2022-11-28")
    
    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        return false
    }
    defer resp.Body.Close()
    
    return resp.StatusCode == 204
}
```

## 🐛 Troubleshooting

### Common Issues

**❌ "Bad credentials" / 401 Unauthorized**
- Verify your GitHub token is correct
- Ensure token has `repo` scope permissions
- Check if token has expired

**❌ "Not Found" / 404**  
- Verify repository name format: `owner/repo`
- Ensure the repository exists and token has access
- Check if repository is private and token has appropriate permissions

**❌ "API rate limit exceeded" / 403**
- GitHub has rate limits: 5000 requests/hour for authenticated requests
- Wait for rate limit reset or use multiple tokens

**❌ GitHub Action not running**
- Check that the workflow file contains `repository_dispatch` trigger
- Verify the `event_type` matches exactly: `fetch-meetup-data`
- Check the Actions tab for workflow run status

### Testing

Test your integration:
```bash
# Local test
GITHUB_TOKEN=your_token pnpm run trigger

# Check if action ran
# Go to GitHub → Actions tab to see workflow runs
```

## 📊 Monitoring & Best Practices

### Monitoring GitHub Actions

- **Actions Tab**: Check workflow run history in GitHub
- **Status API**: Use GitHub's status API to monitor runs programmatically
- **Notifications**: Configure GitHub notifications for failed workflows

### Best Practices

1. **Token Security**: Store GitHub tokens securely (environment variables, secrets management)
2. **Error Handling**: Implement retry logic for transient failures
3. **Rate Limiting**: Respect GitHub API rate limits
4. **Logging**: Log webhook calls for debugging and audit purposes
5. **Token Rotation**: Regularly rotate GitHub personal access tokens

### Example with Error Handling

```javascript
async function triggerWithRetry(maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(
        'https://api.github.com/repos/MrSunshyne/mauritius-meetups-data/dispatches',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ event_type: 'fetch-meetup-data' }),
        }
      );

      if (response.status === 204) {
        console.log('✅ GitHub Action triggered successfully');
        return true;
      } else if (response.status === 403) {
        console.error('❌ Rate limit exceeded, waiting...');
        await new Promise(resolve => setTimeout(resolve, 60000));
        continue;
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error(`❌ Attempt ${attempt} failed:`, error.message);
      if (attempt === maxRetries) {
        console.error('💥 All attempts failed');
        return false;
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}
