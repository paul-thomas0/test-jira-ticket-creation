# Quick Setup Guide - GitHub-Jira Sync (Fixed)

## 🚀 What's Fixed

The GitHub Actions workflow has been updated to use a clean Node.js script (`create.js`) instead of complex curl commands. This provides:

✅ **Better error handling**
✅ **Rich ADF formatting** for Jira descriptions
✅ **Proper dependency management** with package-lock.json
✅ **Local testing capabilities**
✅ **Cleaner, maintainable code**

## ⚡ Quick Start (5 minutes)

### 1. Add Required Files to Your Repository

Make sure these files are in your repository root:
- `.github/workflows/jira-sync.yml` ✅ (Updated workflow)
- `create.js` ✅ (New Node.js script)
- `adf-utils.js` ✅ (ADF formatting utilities)
- `package.json` ✅ (Dependencies)
- `package-lock.json` ✅ (Lock file for reliable installs)

### 2. Set Up GitHub Environment Secrets

Go to **Repository Settings > Environments** and create an environment named `JIRA`:

| Secret Name | Value | Example |
|-------------|-------|---------|
| `JIRA_BASE_URL` | Your Jira URL | `https://yourcompany.atlassian.net` |
| `JIRA_USER_EMAIL` | Jira user email | `automation@yourcompany.com` |
| `JIRA_API_TOKEN` | Jira API token | `ATATT3xFfGF0...` |
| `JIRA_PROJECT_KEY` | Project key | `PROJ` |
| `GITHUB_URL_CUSTOM_FIELD` | Custom field ID | `customfield_10000` |

### 3. Test the Setup

```bash
# Clone your repository
git clone https://github.com/yourusername/your-repo.git
cd your-repo

# Install dependencies
npm install

# Test the setup (without creating real issues)
node test-create.js

# Test with real Jira (set env vars first)
export JIRA_USER_EMAIL="your-email@company.com"
export JIRA_API_TOKEN="your-api-token"
export JIRA_BASE_URL="https://yourcompany.atlassian.net"
export JIRA_PROJECT_KEY="PROJ"

node create.js "Task" "Test Issue" "Test description from CLI"
```

### 4. Create a Test GitHub Issue

1. Go to your repository
2. Click **Issues** > **New issue**
3. Create any issue
4. Watch the **Actions** tab for the workflow execution
5. Check that a Jira ticket is created and linked back to the GitHub issue

## 🔧 Troubleshooting

### "Dependencies lock file is not found" Error

**Fixed!** The workflow now handles this gracefully:
- If `package-lock.json` exists → uses `npm ci` (faster, reliable)
- If not → falls back to `npm install`

### Environment Variables Not Working

Check that:
1. Environment is named exactly `JIRA` (case-sensitive)
2. Secrets are added to the environment, not repository secrets
3. All required variables are set

### Custom Field Issues

1. Go to **Jira Settings** > **Issues** > **Custom fields**
2. Find your "GitHub Issue URL" field
3. Note the ID (e.g., `customfield_10001`)
4. Update `GITHUB_URL_CUSTOM_FIELD` secret with this value

### Script Errors

```bash
# Check Node.js version (needs 16+)
node --version

# Test ADF utilities
node -e "console.log(require('./adf-utils').textToADF('test'))"

# Check dependencies
npm list

# Run examples
node examples.js
```

## 📊 What Happens Now

When you create a GitHub issue:

1. **GitHub Actions triggers** the workflow
2. **Node.js environment** is set up automatically
3. **Dependencies are installed** (axios for API calls)
4. **`create.js` script runs** with issue data
5. **Rich ADF content** is created with GitHub metadata
6. **Jira issue is created** via REST API
7. **GitHub issue gets commented** with Jira link

The created Jira issue will have:
- ✅ Title: `[GitHub] Original Issue Title`
- ✅ Rich description with GitHub link, author, date
- ✅ Custom field populated with GitHub URL
- ✅ Proper ADF formatting for links and structure

## 🎯 Key Improvements

| Before (curl) | After (Node.js) |
|---------------|-----------------|
| Complex YAML with embedded JSON | Clean script calls |
| Hard to debug | Detailed error messages |
| Basic text descriptions | Rich ADF formatting |
| No local testing | Full local testing |
| Fragile string escaping | Proper argument handling |

## 📚 Additional Resources

- **Full setup guide**: See `README.md`
- **Test your setup**: Run `node test-create.js`
- **See examples**: Run `node examples.js`
- **ADF documentation**: Check `adf-utils.js` for formatting options

## 🆘 Still Having Issues?

1. **Check GitHub Actions logs** in the Actions tab
2. **Test locally** with the test script
3. **Verify Jira API access** manually
4. **Check environment variable names** (case-sensitive)

The system is now much more reliable and easier to debug! 🎉
