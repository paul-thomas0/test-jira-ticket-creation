# GitHub-Jira Two-Way Sync Setup Guide

This guide explains how to set up complete two-way synchronization between GitHub issues and Jira tickets using the provided GitHub workflow and Jira automation.

## 📋 Prerequisites

- GitHub repository with admin access
- Jira instance with admin access
- Jira API token
- GitHub Personal Access Token (for Jira → GitHub sync)

## 🔧 Step 1: Configure GitHub Repository Secrets

Add the following secrets to your GitHub repository (**Settings > Secrets and variables > Actions**):

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

## 📁 Step 2: Add GitHub Workflow

1. Create `.github/workflows/` directory in your repository if it doesn't exist
2. Save the provided workflow as `.github/workflows/jira-sync.yml`
3. Commit and push to your repository

## 🎫 Step 3: Configure Jira Custom Fields

### Create GitHub Issue URL Field:

1. Go to **Jira Settings** (⚙️) > **Issues** > **Custom fields**
2. Click **Create custom field**
3. Select **URL Field**
4. Name: `GitHub Issue URL`
5. Add to relevant screens for your project

### Update Field ID in Workflow:

The workflow uses `customfield_10000` as an example. Update this with your actual custom field ID:

1. Go to **Jira Settings** > **Issues** > **Custom fields**
2. Find your "GitHub Issue URL" field
3. Note the ID (e.g., `customfield_10001`)
4. Update the workflow file where you see `customfield_10000`

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

### Test GitHub → Jira:

1. Create a new GitHub issue
2. Check that a Jira ticket is created
3. Verify the GitHub issue gets a comment with the Jira link

### Test GitHub Comments → Jira:

1. Add a comment to the GitHub issue
2. Check that the comment appears in the Jira ticket

### Test Jira Comments → GitHub:

1. Add a comment to the Jira ticket
2. Check that the comment appears in the GitHub issue

## 🛠️ Troubleshooting

### Common Issues:

1. **Jira ticket not created**:
   - Check GitHub Actions logs
   - Verify Jira API credentials
   - Ensure project key exists

2. **Custom field not populated**:
   - Verify field ID in workflow
   - Check field is on create screen

3. **Jira automation not triggered**:
   - Check automation rule is enabled
   - Verify conditions are met
   - Check Jira automation audit log

4. **GitHub API errors from Jira**:
   - Verify GitHub PAT has `repo` scope
   - Check URL template in automation rule
   - Ensure repository exists and is accessible

### Debugging:

- Check GitHub Actions logs: **Actions** tab in your repository
- Check Jira automation logs: **Project settings** > **Automation** > **Audit log**
- Test Jira API calls manually using curl or Postman

## 🔒 Security Notes

- Store all tokens as secrets, never in code
- Use dedicated service accounts with minimal required permissions
- Regularly rotate API tokens
- Monitor automation logs for suspicious activity

## 🎯 What This Setup Provides

**GitHub Issue** → **Jira Ticket** (automatic)
**GitHub Comments** → **Jira Comments** (automatic)
**Jira Comments** → **GitHub Comments** (automatic)
**GitHub Issue Updates** → **Jira Ticket Updates** (automatic)
**Bidirectional linking and attribution**
**Prevention of infinite loops**

Your GitHub-Jira integration is now complete with full two-way synchronization!
