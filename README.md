# GitHub-Jira Two-Way Sync Setup Guide

This guide explains how to set up complete two-way synchronization between GitHub issues and Jira tickets using the provided GitHub workflow and Jira automation. The system uses a Node.js script for clean, maintainable Jira issue creation with proper ADF (Atlassian Document Format) support.

## 📋 Prerequisites

- GitHub repository with admin access
- Jira instance with admin access
- Jira API token
- GitHub Personal Access Token (for Jira → GitHub sync)

## 🔧 Step 1: Configure GitHub Environment and Secrets

### Create Environment:

1. Go to your GitHub repository **Settings > Environments**
2. Click **New environment**
3. Name it `jira-integration`
4. Click **Configure environment**
5. (Optional) Add protection rules if needed

### Add Environment Secrets:

In the `jira-integration` environment, add the following secrets:

| Secret Name        | Description                                   | Example                             |
| ------------------ | --------------------------------------------- | ----------------------------------- |
| `JIRA_BASE_URL`    | Your Jira instance URL                        | `https://yourcompany.atlassian.net` |
| `JIRA_USER_EMAIL`  | Email of Jira user for API access             | `automation@yourcompany.com`        |
| `JIRA_API_TOKEN`   | Jira API token                                | `ATATT3xFfGF0...`                   |
| `JIRA_PROJECT_KEY` | Jira project key where issues will be created | `PROJ`                              |

### How to get Jira API Token:

1. Go to [Atlassian Account Settings](https://id.atlassian.com/manage-profile/security/api-tokens)
2. Click **Create API token**
3. Give it a name (e.g., "GitHub Sync")
4. Copy the generated token

### Additional Environment Variable (Optional):

| Secret Name               | Description                             | Example             |
| ------------------------- | --------------------------------------- | ------------------- |
| `GITHUB_URL_CUSTOM_FIELD` | Custom field ID for storing GitHub URLs | `customfield_10000` |

### 💡 Benefits of Environment Secrets:

- **Reusability**: Share secrets across multiple repositories
- **Environment-specific configs**: Different settings for dev/staging/prod
- **Better organization**: Centralized secret management
- **Access control**: Fine-grained permissions per environment

> **Alternative**: If you prefer, you can use repository secrets instead by removing the `environment: jira-integration` lines from the workflow and adding secrets to **Settings > Secrets and variables > Actions**.

## 📁 Step 2: Add Project Files

1. Create `.github/workflows/` directory in your repository if it doesn't exist
2. Add the following files to your repository:
   - `.github/workflows/jira-sync.yml` (GitHub workflow)
   - `create.js` (Node.js Jira creation script)
   - `adf-utils.js` (ADF utility functions)
   - `package.json` (Node.js dependencies)
3. Commit and push to your repository

### File Structure:

```
your-repo/
├── .github/
│   └── workflows/
│       └── jira-sync.yml
├── create.js
├── adf-utils.js
├── package.json
└── README.md
```

## 🎫 Step 3: Configure Jira Custom Fields

### Create GitHub Issue URL Field:

1. Go to **Jira Settings** (⚙️) > **Issues** > **Custom fields**
2. Click **Create custom field**
3. Select **URL Field**
4. Name: `GitHub Issue URL`
5. Add to relevant screens for your project

### Update Field ID in Environment:

The workflow uses `customfield_10000` as an example. Update this with your actual custom field ID:

1. Go to **Jira Settings** > **Issues** > **Custom fields**
2. Find your "GitHub Issue URL" field
3. Note the ID (e.g., `customfield_10001`)
4. Add `GITHUB_URL_CUSTOM_FIELD` to your environment secrets with the correct field ID

## 🤖 Step 4: Set Up Jira Automation (Jira → GitHub)

### Create GitHub Personal Access Token:

1. Go to GitHub **Settings** > **Developer settings** > **Personal access tokens** > **Tokens (classic)**
2. Click **Generate new token (classic)**
3. Name: `Jira-Comment-Sync`
4. Scopes: Check `repo`
5. Copy the token immediately

### Create Jira Automation Rule:

1. In Jira project: **Project settings** > **Automation**
2. Click **Create rule**

#### A. Trigger:

- Select: **Issue commented**

#### B. Conditions:

1. **Issue fields condition**:
   - Field: `GitHub Issue URL`
   - Condition: `is not empty`

2. **Advanced compare condition**:
   - First value: `{{comment.author.displayName}}`
   - Condition: `does not equal`
   - Second value: `GitHub Sync Bot`

#### C. Action - Send Web Request:

- **URL**:

  ```
  https://api.github.com/repos/{{issue.GitHub Issue URL.split("/").get(3)}}/{{issue.GitHub Issue URL.split("/").get(4)}}/issues/{{issue.GitHub Issue URL.split("/").get(6)}}/comments
  ```

- **Headers**:

  ```
  Authorization: Bearer YOUR_GITHUB_PAT_HERE
  Accept: application/vnd.github.v3+json
  Content-Type: application/json
  ```

- **HTTP Method**: `POST`

- **Request Body** (Custom data):
  ```json
  {
    "body": "💬 **Comment from Jira by {{comment.author.displayName}}:**\n\n{{comment.body}}\n\n---\n*Synced from [{{issue.key}}]({{baseUrl}}/browse/{{issue.key}})*"
  }
  ```

#### D. Name and Activate:

- Name: `Sync Jira comments to GitHub`
- Turn it on

## 🔄 Step 5: Alternative Jira → GitHub Sync (Using Repository Dispatch)

If you prefer to use GitHub's repository dispatch instead of direct API calls from Jira:

### Jira Automation Webhook Action:

Instead of the web request above, use:

- **URL**: `https://api.github.com/repos/OWNER/REPO/dispatches`
- **Headers**:
  ```
  Authorization: Bearer YOUR_GITHUB_PAT_HERE
  Accept: application/vnd.github.v3+json
  Content-Type: application/json
  ```
- **Request Body**:
  ```json
  {
    "event_type": "jira-comment-sync",
    "client_payload": {
      "issue_number": "{{issue.GitHub Issue URL.split("/").get(6)}}",
      "comment_body": "{{comment.body}}",
      "author": "{{comment.author.displayName}}",
      "jira_url": "{{baseUrl}}/browse/{{issue.key}}"
    }
  }
  ```

## 📊 Step 6: Test the Integration

### Local Testing (Optional):

You can test the Node.js script locally before deploying:

```bash
# Set environment variables
export JIRA_USER_EMAIL="your-email@company.com"
export JIRA_API_TOKEN="your-api-token"
export JIRA_BASE_URL="https://yourcompany.atlassian.net"
export JIRA_PROJECT_KEY="PROJ"

# Run test script
node test-create.js

# Create a test issue
node create.js "Task" "Test Issue" "Test description" "https://github.com/user/repo/issues/1" "username" "2023-01-01T00:00:00Z"
```

### Integration Testing:

#### Test GitHub → Jira:

1. Create a new GitHub issue
2. Check GitHub Actions logs for successful execution
3. Verify a Jira ticket is created with proper formatting
4. Confirm the GitHub issue gets a comment with the Jira link

#### Test GitHub Comments → Jira:

1. Add a comment to the GitHub issue
2. Check that the comment appears in the Jira ticket

#### Test Jira Comments → GitHub:

1. Add a comment to the Jira ticket
2. Check that the comment appears in the GitHub issue

## 🛠️ Troubleshooting

### Common Issues:

1. **Jira ticket not created**:
   - Check GitHub Actions logs for Node.js errors
   - Verify Jira API credentials in environment secrets
   - Ensure project key exists
   - Confirm environment `JIRA` is configured
   - Test locally with `node test-create.js`

2. **Environment access denied**:
   - Check environment protection rules
   - Verify the workflow has access to the environment
   - Ensure secrets are added to the correct environment

3. **Custom field not populated**:
   - Verify field ID in workflow
   - Check field is on create screen

4. **Jira automation not triggered**:
   - Check automation rule is enabled
   - Verify conditions are met
   - Check Jira automation audit log

5. **GitHub API errors from Jira**:
   - Verify GitHub PAT has `repo` scope
   - Check URL template in automation rule
   - Ensure repository exists and is accessible

6. **Node.js script errors**:
   - Check if dependencies are installed (`npm ci`)
   - Verify Node.js version (16+ required)
   - Test ADF utilities with `node test-create.js`
   - Check environment variable names match exactly

### Debugging:

- Check GitHub Actions logs: **Actions** tab in your repository
- Check Jira automation logs: **Project settings** > **Automation** > **Audit log**
- Test locally: Run `node test-create.js` to verify setup
- Test Jira API calls manually using curl or Postman
- Debug ADF format: Use `node -e "console.log(JSON.stringify(require('./adf-utils').textToADF('test'), null, 2))"`

## 🔒 Security Notes

- Store all tokens as environment secrets, never in code
- Use dedicated service accounts with minimal required permissions
- Configure environment protection rules for production environments
- Regularly rotate API tokens
- Monitor automation logs for suspicious activity
- Consider requiring reviews for deployments to protected environments

## 🎯 What This Setup Provides

✅ **GitHub Issue** → **Jira Ticket** (automatic, with rich ADF formatting)
✅ **GitHub Comments** → **Jira Comments** (automatic)
✅ **Jira Comments** → **GitHub Comments** (automatic)
✅ **GitHub Issue Updates** → **Jira Ticket Updates** (automatic)
✅ **Bidirectional linking and attribution**
✅ **Prevention of infinite loops**
✅ **Clean Node.js architecture** with proper error handling
✅ **ADF support** for rich text formatting in Jira
✅ **Local testing capabilities** for development

## 🛠️ Technical Features

- **Modular Design**: Separate utilities for ADF conversion and issue creation
- **Environment Variables**: Secure credential management
- **Error Handling**: Comprehensive error reporting and logging
- **ADF Support**: Full Atlassian Document Format support for rich content
- **CLI Interface**: Command-line interface for testing and automation
- **GitHub Actions Integration**: Seamless CI/CD integration

Your GitHub-Jira integration is now complete with full two-way synchronization using modern Node.js architecture!
