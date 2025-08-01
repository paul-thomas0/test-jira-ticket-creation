# Quick Start: GitHub-Jira 1-to-1 Issue Type Mapping

This guide gets you up and running with automatic 1-to-1 mapping between GitHub issue templates and Jira issue types in under 10 minutes.

## 🚀 Quick Setup (5 minutes)

### 1. Add GitHub Secrets

Go to **Settings** > **Environments** > Create `JIRA` environment and add:

- `JIRA_BASE_URL`: `https://yourcompany.atlassian.net`
- `JIRA_USER_EMAIL`: `your-email@company.com`
- `JIRA_API_TOKEN`: Get from [Atlassian Account Settings](https://id.atlassian.com/manage-profile/security/api-tokens)
- `JIRA_PROJECT_KEY`: Your Jira project key (e.g., `PROJ`)

### 2. Customize Mappings

Edit `label-mapping.json` to match your Jira board:

```json
{
  "mappings": {
    "Bug Report": "Bug Report",
    "Improvement": "Improvement",
    "Technical Support": "Technical Support"
  },
  "defaultIssueType": "Technical Support"
}
```

**Already configured for your JIRA board issue types!**

### 3. Test the Setup

```bash
npm test
```

### 4. Create a Test Issue

Use any GitHub issue template and watch the magic happen! ✨

## 📊 Default Mappings

| GitHub Template | Label               | Jira Issue Type     | Priority Logic                   |
| --------------- | ------------------- | ------------------- | -------------------------------- |
| 🐛 Bug Report   | `Bug Report`        | `Bug Report`        | High/Medium/Low based on urgency |
| 💡 Enhancement  | `Improvement`       | `Improvement`       | Medium (default)                 |
| ❓ Support      | `Technical Support` | `Technical Support` | Medium (default)                 |

## 🎯 What Happens Automatically

✅ **GitHub issue created** → **Jira ticket auto-created** with correct issue type
✅ **Bug reports** → **Priority set** based on urgency selection
✅ **Platform components** → **Auto-assigned** to Jira components
✅ **Comments sync** both ways automatically
✅ **Rich formatting** with GitHub metadata in Jira

## 🛠️ Common Customizations

### Adding New Feature Issue Type

If you want to add the "New Feature" issue type from your JIRA board:

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

Then create a new GitHub issue template with label "Feature Request".

### Custom Priority Logic

Edit `map-issue-type.js` → `mapPriority()` function to customize priority detection.

### Custom Components

Edit `map-issue-type.js` → `mapGitHubIssueToJiraFields()` function to customize component mapping.

## ⚡ Testing Commands

```bash
# Test the mapping system
npm test

# Test specific label mapping
node map-issue-type.js '["Bug Report"]'

# Create test Jira issue
node create.js "Bug Report" "Test Issue" "Description" "https://github.com/user/repo/issues/1" "user" "2023-01-01T00:00:00Z" '["Bug Report"]'
```

## 🚨 Troubleshooting

**Issue type doesn't exist in Jira?**

- Check your Jira project settings → Issue types
- Update `label-mapping.json` with exact names

**Wrong priority assigned?**

- Check the urgency selection in your bug report
- Keywords: "High - Production", "Medium - non-critical", "Low - Minor"

**No component assigned?**

- Bug reports need "Which part of the platform is affected?" answered
- Valid options: REELS, ALPHA, TRINITY, AI HUB

**Environment access denied?**

- Verify secrets are in the `JIRA` environment (not repository secrets)
- Check environment protection rules

## 📞 Need Help?

1. Run `npm test` to validate your configuration
2. Check GitHub Actions logs for detailed error messages
3. Review the full [README.md](./README.md) for complete documentation

Happy automating! 🎉
