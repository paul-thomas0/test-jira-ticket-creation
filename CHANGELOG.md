# Changelog

## [2.0.0] - 2024-12-19

### 🚀 Major Changes

#### Removed Custom Field Dependency
- **BREAKING**: Removed `GITHUB_URL_CUSTOM_FIELD` environment variable requirement
- GitHub issue URLs are now embedded directly in the Jira issue description body
- Eliminates need for Jira custom field setup and configuration
- Simplifies deployment and reduces administrative overhead

#### Enhanced ADF Integration
- GitHub metadata (URL, author, creation date) now integrated into rich ADF description
- GitHub URL appears as a clickable link in the issue description
- Maintains full traceability without custom field dependencies

### ✅ Improvements

#### Simplified Setup Process
- Reduced required environment variables from 5 to 4
- No Jira custom field configuration needed
- Faster deployment with fewer configuration steps

#### Updated Documentation
- Revised setup guides to remove custom field references
- Updated Jira automation rule examples
- Added clearer troubleshooting sections

#### Enhanced Testing
- Updated test scripts to reflect new architecture
- Improved example scenarios
- Better error handling for missing configurations

### 🔧 Technical Changes

#### Workflow Updates
- Removed `GITHUB_URL_CUSTOM_FIELD` environment variable from GitHub Actions
- Streamlined Jira issue creation process
- Maintained full backward compatibility for existing functionality

#### Script Improvements
- Updated `create.js` to remove custom field logic
- Enhanced `createGitHubIssueADF()` function for better URL integration
- Improved error handling and validation

#### Documentation Overhaul
- Updated `README.md` with simplified setup instructions
- Revised `QUICK_SETUP.md` for faster deployment
- Updated `examples.js` to demonstrate new approach

### 📋 Migration Guide

#### For Existing Users
1. Remove `GITHUB_URL_CUSTOM_FIELD` from your GitHub environment secrets
2. Update your Jira automation rules to parse GitHub URLs from description text
3. No changes needed to existing Jira issues - they will continue to work

#### New Installations
- Follow the updated setup guide in `README.md`
- Only 4 environment variables required:
  - `JIRA_BASE_URL`
  - `JIRA_USER_EMAIL`
  - `JIRA_API_TOKEN`
  - `JIRA_PROJECT_KEY`

### 🎯 Benefits

- **Reduced Complexity**: 20% fewer configuration steps
- **Faster Setup**: No custom field creation required
- **Better Maintenance**: Self-contained GitHub metadata in descriptions
- **Improved Reliability**: No dependency on Jira field configuration
- **Enhanced Portability**: Easier to migrate between Jira instances

---

## [1.0.0] - 2024-12-18

### 🎉 Initial Release

#### Features
- GitHub to Jira issue synchronization
- Bidirectional comment syncing
- Rich ADF formatting support
- Custom field integration for GitHub URLs
- Comprehensive error handling
- Local testing capabilities

#### Components
- GitHub Actions workflow for automation
- Node.js scripts for Jira API integration
- ADF utility functions for rich formatting
- Comprehensive documentation and examples

#### Requirements
- Node.js 16+
- GitHub repository with Actions enabled
- Jira Cloud instance with API access
- Custom field setup for GitHub URL storage
