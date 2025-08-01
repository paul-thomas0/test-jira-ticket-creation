# GitHub-Jira Two-Way Sync Setup Guide

This guide explains how to set up complete two-way synchronization between GitHub issues and Jira tickets using the provided GitHub workflow and Jira automation. The system uses a Node.js script for clean, maintainable Jira issue creation with proper ADF (Atlassian Document Format) support and **1-to-1 mapping** between GitHub issue types and Jira issue types.

## ✨ Key Features

- **1-to-1 Issue Type Mapping**: GitHub issue templates automatically map to corresponding Jira issue types
- **Automatic Priority Detection**: GitHub issue content determines Jira priority levels
- **Component Mapping**: Bug reports automatically assign affected platform components
- **Rich ADF Formatting**: GitHub content converted to Atlassian Document Format
- **Bidirectional Sync**: Comments and updates sync both ways
- **Configurable Mappings**: Easy-to-update JSON configuration for custom mappings

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
   - `map-issue-type.js` (Issue type mapping utilities)
   - `label-mapping.json` (Issue type mapping configuration)
   - `package.json` (Node.js dependencies)
3. Commit and push to your repository

### File Structure:

```
your-repo/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug-report.yml
│   │   ├── improvement.yml
│   │   └── technical-support.yml
│   └── workflows/
│       └── jira-sync.yml
├── create.js
├── adf-utils.js
├── map-issue-type.js
├── label-mapping.json
├── package.json
└── README.md
```

## 🏷️ Step 3: Configure Issue Type Mapping

### Understanding the Mapping System:

The system automatically maps GitHub issue template labels to Jira issue types using the `label-mapping.json` configuration file:

```json
{
  "mappings": {
    "Bug Report": "Bug",
    "Improvement": "Story",
    "Technical Support": "Task"
  },
  "defaultIssueType": "Task"
}
```

### Default Mappings:

| GitHub Issue Template            | GitHub Label        | Jira Issue Type     |
| -------------------------------- | ------------------- | ------------------- |
| 🐛 Report a Platform Issue / Bug | `Bug Report`        | `Bug Report`        |
| 💡 Suggest an Enhancement        | `Improvement`       | `Improvement`       |
| ❓ Request Support               | `Technical Support` | `Technical Support` |

### Customizing Mappings:

1. **Edit** `label-mapping.json` to match your Jira board's issue types
2. **Update** the mappings object with your specific issue types
3. **Commit** the changes to your repository

**Example for custom Jira board:**

```json
{
  "mappings": {
    "Bug Report": "Bug Report",
    "Improvement": "Improvement",
    "Technical Support": "Technical Support",
    "Feature Request": "New Feature"
  },
  "defaultIssueType": "Technical Support"
}
```

### Additional Automatic Mappings:

#### **Priority Mapping** (from bug reports):

- `High - Production system is down` → **Highest** priority
- `Medium - A non-critical feature` → **Medium** priority
- `Low - Minor issue or cosmetic` → **Low** priority
- Urgent keywords in title/body → **High** priority

#### **Component Mapping** (from bug reports):

- Automatically extracts affected platform area:
  - `REELS` → Component: REELS
  - `ALPHA` → Component: ALPHA
  - `TRINITY` → Component: TRINITY
  - `AI HUB` → Component: AI HUB

## 🎫 Step 4: Setup Complete!

No additional Jira configuration is needed! The GitHub issue URL and metadata will be automatically included in the Jira issue description body using rich ADF formatting with mapping information.

## 🤖 Step 5: Set Up Jira Automation (Jira → GitHub)

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

1. **Advanced compare condition**:
   - First value: `{{issue.description}}`
   - Condition: `contains`
   - Second value: `github.com`

2. **Advanced compare condition**:
   - First value: `{{comment.author.displayName}}`
   - Condition: `does not equal`
   - Second value: `GitHub Sync Bot`

#### C. Action - Send Web Request:

- **URL**:

  Since the GitHub URL is embedded in the issue description, you'll need to extract it. Here's a simpler approach using smart values:

  ```
  https://api.github.com/repos/OWNER/REPO/issues/ISSUE_NUMBER/comments
  ```

  Replace `OWNER`, `REPO`, and `ISSUE_NUMBER` with the actual values from your GitHub URL pattern, or use this dynamic approach:

  ```
  {{#issue.description}}{{#contains "github.com"}}https://api.github.com/repos/{{issue.description.substringAfter("github.com/").substringBefore("/issues")}}/issues/{{issue.description.substringAfter("/issues/").substringBefore(")").substringBefore(" ")}}/comments{{/contains}}{{/issue.description}}
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

> **💡 Note**: Since the GitHub URL is now embedded in the description, the Jira automation needs to parse it from the text. The above examples show how to extract the repository and issue number. You may need to adjust the smart value expressions based on your exact URL format.

## 🔄 Step 6: Alternative Jira → GitHub Sync (Using Repository Dispatch)

If you prefer to use GitHub's repository dispatch instead of direct API calls from Jira:

### Jira Automation Webhook Action:

Instead of the web request above, use:

- **URL**: `https://api.github.com/repos/OWNER/REPO/dispatches` (replace OWNER/REPO with your actual repository)
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
      "issue_number": "{{issue.description.substringAfter('/issues/').substringBefore(')').substringBefore(' ')}}",
      "comment_body": "{{comment.body}}",
      "author": "{{comment.author.displayName}}",
      "jira_url": "{{baseUrl}}/browse/{{issue.key}}"
    }
  }
  ```

## 📊 Step 7: Test the Integration

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

# Test the mapping system
node map-issue-type.js '["Bug Report"]'

# Create a test issue with mapping
node create.js "Bug" "Test Issue" "Test description" "https://github.com/user/repo/issues/1" "username" "2023-01-01T00:00:00Z" '["Bug Report"]'
```

### Integration Testing:

#### Test GitHub → Jira Mapping:

1. **Test Bug Report**:
   - Create GitHub issue using "🐛 Report a Platform Issue / Bug" template
   - Fill out "Which part of the platform is affected?" → `REELS`
   - Set urgency → `High - Production system is down`
   - Verify Jira ticket created with:
     - Issue Type: `Bug Report`
     - Priority: `Highest`
     - Component: `REELS`

2. **Test Enhancement**:
   - Create GitHub issue using "💡 Suggest an Enhancement" template
   - Verify Jira ticket created with Issue Type: `Improvement`

3. **Test Support Request**:
   - Create GitHub issue using "❓ Request Support" template
   - Verify Jira ticket created with Issue Type: `Technical Support`

4. **Check Logs**:
   - Check GitHub Actions logs for mapping output
   - Verify correct issue type was detected and used
   - Confirm the GitHub issue gets a comment with the Jira link

#### Test GitHub Comments → Jira:

1. Add a comment to the GitHub issue
2. Check that the comment appears in the Jira ticket

#### Test Jira Comments → GitHub:

1. Add a comment to the Jira ticket
2. Check that the comment appears in the GitHub issue

## 🛠️ Step 8: Troubleshooting

### Common Issues:

1. **Jira ticket not created**:
   - Check GitHub Actions logs for Node.js errors
   - Verify Jira API credentials in environment secrets
   - Ensure project key exists
   - Confirm environment `JIRA` is configured
   - Test locally with `node test-create.js`

2. **Wrong issue type created**:
   - Check `label-mapping.json` configuration
   - Verify GitHub issue template labels match mapping keys exactly
   - Test mapping locally: `node map-issue-type.js '["Bug Report"]'`
   - Check GitHub Actions logs for mapping output

3. **Issue type doesn't exist in Jira**:
   - Verify your Jira project has the mapped issue types
   - Update `label-mapping.json` with correct Jira issue type names
   - Check Jira project settings → Issue types

4. **Environment access denied**:
   - Check environment protection rules
   - Verify the workflow has access to the environment
   - Ensure secrets are added to the correct environment

5. **GitHub URL not found in Jira**:
   - Verify the issue description contains the GitHub URL
   - Check the ADF formatting is working correctly

6. **Jira automation not triggered**:
   - Check automation rule is enabled
   - Verify conditions are met
   - Check Jira automation audit log

7. **GitHub API errors from Jira**:
   - Verify GitHub PAT has `repo` scope
   - Check URL template in automation rule
   - Ensure repository exists and is accessible

8. **Node.js script errors**:
   - Check if dependencies are installed (`npm ci`)
   - Verify Node.js version (16+ required)
   - Test ADF utilities with `node test-create.js`
   - Check environment variable names match exactly

9. **Priority/Component not set**:
   - Check bug report template responses contain expected keywords
   - Verify `mapPriority()` function logic in `map-issue-type.js`
   - Test priority mapping locally

### Debugging:

- Check GitHub Actions logs: **Actions** tab in your repository
- Check Jira automation logs: **Project settings** > **Automation** > **Audit log**
- Test mapping locally: `node map-issue-type.js '["Bug Report"]'`
- Test issue creation: `node create.js "Bug" "Test" "Description" "url" "user" "date" '["Bug Report"]'`
- Debug ADF format: Use `node -e "console.log(JSON.stringify(require('./adf-utils').textToADF('test'), null, 2))"`
- Verify label-mapping.json: `node -e "console.log(JSON.stringify(require('./label-mapping.json'), null, 2))"`

## 🔒 Security Notes

- Store all tokens as environment secrets, never in code
- Use dedicated service accounts with minimal required permissions
- Configure environment protection rules for production environments
- Regularly rotate API tokens
- Monitor automation logs for suspicious activity
- Consider requiring reviews for deployments to protected environments

## 🎯 What This Setup Provides

✅ **GitHub Issue** → **Jira Ticket** (automatic, with 1-to-1 issue type mapping)
✅ **GitHub Comments** → **Jira Comments** (automatic)
✅ **Jira Comments** → **GitHub Comments** (automatic)
✅ **GitHub Issue Updates** → **Jira Ticket Updates** (automatic)
✅ **1-to-1 Issue Type Mapping** - Bug reports → Bug Report, Improvements → Improvement
✅ **Automatic Priority Assignment** - Based on urgency indicators in bug reports
✅ **Component Auto-Assignment** - Platform areas automatically mapped to Jira components
✅ **Bidirectional linking and attribution**
✅ **Prevention of infinite loops**
✅ **Clean Node.js architecture** with proper error handling
✅ **ADF support** for rich text formatting in Jira
✅ **Configurable mappings** via JSON configuration
✅ **Local testing capabilities** for development
✅ **No custom field setup required** - GitHub URL included in description

## 🛠️ Technical Features

- **Modular Design**: Separate utilities for ADF conversion, issue creation, and mapping
- **Configurable Mapping System**: JSON-based configuration for easy customization
- **Smart Issue Type Detection**: Automatic mapping based on GitHub issue template labels
- **Priority Intelligence**: Analyzes issue content to determine appropriate Jira priority
- **Component Recognition**: Extracts platform components from bug report forms
- **Environment Variables**: Secure credential management
- **Error Handling**: Comprehensive error reporting and logging
- **ADF Support**: Full Atlassian Document Format support for rich content
- **CLI Interface**: Command-line interface for testing and automation
- **GitHub Actions Integration**: Seamless CI/CD integration
- **Validation**: Built-in validation for issue types and mappings

## 🎯 Mapping Examples

### Example 1: Bug Report

**GitHub Issue Template**: 🐛 Report a Platform Issue / Bug

- **Label**: `Bug Report`
- **Affected Area**: `REELS`
- **Urgency**: `High - Production system is down`

**Jira Ticket Created**:

- **Issue Type**: `Bug Report`
- **Priority**: `Highest`
- **Component**: `REELS`

### Example 2: Enhancement Request

**GitHub Issue Template**: 💡 Suggest an Enhancement

- **Label**: `Improvement`

**Jira Ticket Created**:

- **Issue Type**: `Improvement`
- **Priority**: `Medium` (default)

### Example 3: Support Request

**GitHub Issue Template**: ❓ Request Support

- **Label**: `Technical Support`

**Jira Ticket Created**:

- **Issue Type**: `Technical Support`
- **Priority**: `Medium` (default)

Your GitHub-Jira integration is now complete with full two-way synchronization and intelligent 1-to-1 issue type mapping!
