# Webhook Integration Guide

Direct integration with GitHub's repository dispatch API to trigger meetup data fetching.


## 📚 Documentation Sections

- **🚀 Quick Start**: Token creation and testing
- **👥 Adding New Users**: Repository access and user management
- **📡 GitHub API Integration**: Direct API usage with examples
- **🔐 Security Features**: Best practices and troubleshooting
- **🛠️ CLI Tools**: Local testing and triggers
- **🏗️ Integration Options**: Various deployment scenarios
- **🔌 Language Examples**: Python, PHP, Go, JavaScript implementations

## 🚀 Quick Start

### 1. Repository Access Required

**Important:** You need **Write access** to the repository to trigger GitHub Actions via API.

- **Repository Owner:** Already has access
- **New Users:** Must be added as collaborators (see "Adding New Users" section below)

### 2. Create GitHub Personal Access Token

#### Step-by-Step Token Creation:

1. **Navigate to GitHub Token Settings:**
   - Go to **GitHub** and sign in
   - Click your **profile picture** (top right) → **Settings**
   - Left sidebar: **Developer settings** → **Personal access tokens** → **Fine-grained tokens**
   - *Direct link:* https://github.com/settings/personal-access-tokens/new

2. **Generate New Fine-Grained Token:**
   - Click **"Generate new token"**
   - **Token name:** `Mauritius Meetups Data - Webhook Trigger`
   - **Expiration:** Choose 30, 60, 90 days (recommended: 90 days)
   - **Description:** `Token for triggering meetup data fetch actions`

3. **Configure Repository Access:**
   - **Resource owner:** Select your account or organization
   - **Repository access:** Choose **"Selected repositories"**
   - Search and select: **`mauritius-meetups-data`**
   
4. **Configure Repository Permissions:**
   Under **Repository permissions**, set:
   - **Actions:** ✅ **Write** (required for repository dispatch)
   - **Contents:** ✅ **Write** (required for commits from GitHub Actions)
   - **Metadata:** ✅ **Read** (automatically selected)
   - Leave all other permissions as **No access**

5. **Generate and Save:**
   - Click **"Generate token"**
   - **⚠️ CRITICAL:** Copy the token immediately (only shown once!)
   - Token format: `github_pat_aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890`

### 3. Test the Integration

```bash
# Set your GitHub token (replace with actual token)
export GITHUB_TOKEN=ghp_your_personal_access_token

# Test trigger locally
pnpm run trigger

# Expected output:
# ✅ GitHub Action triggered successfully!
```

### 4. Provide Webhook URL to External Services

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

## 👥 Adding New Users

### For Repository Owner

To give someone else access to trigger the GitHub Action:

#### Option 1: Repository Collaborator (Recommended)

1. **Add as Collaborator:**
   - Go to: `https://github.com/MrSunshyne/mauritius-meetups-data/settings/access`
   - Click **"Add people"**
   - Enter their **GitHub username**
   - Select **"Write"** access (required for repository dispatch)
   - Click **"Add [username] to this repository"**

2. **Share Instructions:**
   Send them this information:

```markdown
# Mauritius Meetups Data - Access Instructions

## You now have access to trigger data fetches!

### Setup Steps:
1. Create your own GitHub Fine-Grained Personal Access Token:
   - Go to: https://github.com/settings/personal-access-tokens/new
   - Generate new fine-grained token
   - Name: "Mauritius Meetups Trigger"
   - Repository: mauritius-meetups-data only
   - Permissions: Actions (Write), Contents (Write), Metadata (Read)
   - Save the token securely

2. Test access:
   ```bash
   git clone https://github.com/MrSunshyne/mauritius-meetups-data.git
   cd mauritius-meetups-data
   pnpm install
   GITHUB_TOKEN=your_token pnpm run trigger
   ```

3. API Integration (for applications):
   - Endpoint: https://api.github.com/repos/MrSunshyne/mauritius-meetups-data/dispatches
   - Method: POST
   - Headers: Authorization: Bearer YOUR_TOKEN
   - Body: {"event_type": "fetch-meetup-data"}

See WEBHOOK.md for complete documentation.
```

#### Option 2: Shared Token (Less Secure)

If you prefer to share your token:

1. **Share your token securely** (encrypted message, password manager)
2. **They use the same API details** without needing repository access
3. **⚠️ Security risks:** Single point of failure, harder to audit

#### Option 3: Organization Teams

For multiple users in an organization:

1. **Create GitHub Organization** (if not already)
2. **Create team** with repository access
3. **Add users to team** instead of individual collaborators
4. **Users follow same token creation process**

### For New Users

If someone gave you access to trigger this webhook:

#### Setup Process:

1. **Verify Repository Access:**
   - Check you can access: https://github.com/MrSunshyne/mauritius-meetups-data
   - You should see "Write" permissions

2. **Create Your Own Token:**
   - Follow the "Create GitHub Personal Access Token" section above
   - Use **your own GitHub account** (more secure than shared tokens)

3. **Test Integration:**
   ```bash
   # Clone repository  
   git clone https://github.com/MrSunshyne/mauritius-meetups-data.git
   cd mauritius-meetups-data
   pnpm install
   
   # Test with your token
   GITHUB_TOKEN=ghp_your_token pnpm run trigger
   ```

4. **Integrate into Your Service:**
   - Use the API details from the "GitHub API Integration" section
   - Replace `YOUR_GITHUB_TOKEN` with your actual token
   - Test in your application/monitoring service

#### Verification:

- ✅ **Action triggers successfully** without errors
- ✅ **GitHub Actions tab** shows your username as trigger source
- ✅ **Repository data updates** after action completes

## 🔐 Security Features

### GitHub Token Authentication

- **Token Type**: Fine-grained Personal Access Token (recommended)
- **Repository Access**: Selected repositories only (mauritius-meetups-data)
- **Permissions Required**: 
  - Actions: **Write** (for repository dispatch)
  - Contents: **Write** (for GitHub Actions to commit)
  - Metadata: **Read** (automatically included)
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
- Verify your GitHub token is correct and hasn't expired
- Check fine-grained token has required permissions:
  - Actions: **Write** (for repository dispatch)
  - Contents: **Write** (for GitHub Actions to commit)
  - Metadata: **Read** (automatically included)
- Ensure token has access to the specific repository
- Verify user has repository collaborator access

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
```

---

## 📋 Quick Reference

### For Repository Owners

**Adding a new user:**
1. Go to: https://github.com/MrSunshyne/mauritius-meetups-data/settings/access
2. Add people → Enter username → Write access
3. Send them the setup instructions from the "Adding New Users" section

**Emergency token revocation:**
1. Go to: https://github.com/settings/tokens  
2. Find the token → Delete
3. User loses access immediately

### For New Users

**Token creation checklist:**
- ✅ Fine-grained GitHub token created with Actions (Write), Contents (Write) permissions
- ✅ Token has access to mauritius-meetups-data repository specifically
- ✅ Repository access verified (can see the repo)
- ✅ Local test successful: `GITHUB_TOKEN=token pnpm run trigger`
- ✅ GitHub Actions tab shows successful run

**API Integration template:**
```bash
curl -X POST https://api.github.com/repos/MrSunshyne/mauritius-meetups-data/dispatches \
  -H "Authorization: Bearer github_pat_YOUR_TOKEN_HERE" \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Content-Type: application/json" \
  -d '{"event_type": "fetch-meetup-data"}'
```

**Local testing:**
```bash
git clone https://github.com/MrSunshyne/mauritius-meetups-data.git
cd mauritius-meetups-data
pnpm install
GITHUB_TOKEN=github_pat_YOUR_TOKEN_HERE pnpm run trigger
```

### Common URLs
- **Fine-grained token creation**: https://github.com/settings/personal-access-tokens/new
- **Repository access**: https://github.com/MrSunshyne/mauritius-meetups-data/settings/access
- **Actions tab**: https://github.com/MrSunshyne/mauritius-meetups-data/actions
- **API endpoint**: https://api.github.com/repos/MrSunshyne/mauritius-meetups-data/dispatches
