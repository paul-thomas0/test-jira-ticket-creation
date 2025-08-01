#!/usr/bin/env node

/**
 * Examples of using the GitHub-Jira sync system
 * This file demonstrates various usage scenarios for the create.js script
 */

const { createIssue, createGitHubIssueADF } = require('./create.js');
const {
  textToADF,
  createFormattedADF,
  createBulletListADF,
  createCodeBlockADF,
  createHeadingWithContentADF,
  combineADFContent
} = require('./adf-utils.js');

// Example 1: Simple issue creation with plain text
async function example1_SimpleIssue() {
  console.log('\n📝 Example 1: Creating a simple issue with plain text');

  try {
    // This would create an actual Jira issue if environment is configured
    console.log('Would create issue with:');
    console.log('  Project: TEST');
    console.log('  Type: Bug');
    console.log('  Summary: Simple bug report');
    console.log('  Description: Plain text description');

    // Uncomment to create real issue:
    // const issueKey = await createIssue('TEST', 'Bug', 'Simple bug report', 'This is a plain text description');
    // console.log(`Created issue: ${issueKey}`);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Example 2: GitHub issue sync (what the workflow does)
async function example2_GitHubSync() {
  console.log('\n🔄 Example 2: GitHub issue synchronization');

  const githubData = {
    title: 'User login fails on mobile devices',
    body: 'When users try to login on mobile devices, the authentication fails.\n\nSteps to reproduce:\n1. Open app on mobile\n2. Enter credentials\n3. Tap login button\n\nExpected: User should be logged in\nActual: Error message appears',
    url: 'https://github.com/company/app/issues/42',
    author: 'user123',
    createdAt: '2023-12-01T14:30:00Z'
  };

  // Create rich ADF description with GitHub metadata
  const adfDescription = createGitHubIssueADF(
    githubData.url,
    githubData.author,
    githubData.createdAt,
    githubData.body
  );

  console.log('GitHub sync would create:');
  console.log(`  Summary: [GitHub] ${githubData.title}`);
  console.log(`  Author: ${githubData.author}`);
  console.log(`  GitHub URL: ${githubData.url}`);
  console.log('  Rich ADF description with metadata');

  // Show ADF structure
  console.log('\n  ADF Content Structure:');
  adfDescription.content.forEach((block, index) => {
    console.log(`    ${index + 1}. ${block.type}`);
  });
}

// Example 3: Rich formatted content
async function example3_RichContent() {
  console.log('\n🎨 Example 3: Creating issues with rich content');

  // Create a complex ADF document
  const heading = createHeadingWithContentADF('Bug Report: API Error', 2);
  const description = textToADF('The API is returning unexpected errors when processing user requests.');

  const stepsList = createBulletListADF([
    'Reproduce the error by calling /api/users endpoint',
    'Check server logs for error details',
    'Verify database connection is stable',
    'Test with different user accounts'
  ]);

  const codeBlock = createCodeBlockADF(`
// Error response
{
  "error": "Internal Server Error",
  "code": 500,
  "timestamp": "2023-12-01T14:30:00Z"
}`, 'json');

  // Combine all content
  const richContent = combineADFContent([
    ...heading.content,
    ...description.content,
    ...stepsList.content,
    ...codeBlock.content
  ]);

  console.log('Rich content issue would include:');
  console.log('  ✅ Formatted heading');
  console.log('  ✅ Description paragraphs');
  console.log('  ✅ Bulleted list of steps');
  console.log('  ✅ Code block with syntax highlighting');
  console.log(`  ✅ Total content blocks: ${richContent.content.length}`);
}

// Example 4: Batch issue creation
async function example4_BatchCreation() {
  console.log('\n📦 Example 4: Batch issue creation from GitHub issues');

  const githubIssues = [
    {
      title: 'Fix mobile responsive design',
      body: 'The mobile layout is broken on screens smaller than 768px',
      type: 'Bug',
      author: 'designer1'
    },
    {
      title: 'Add user profile page',
      body: 'Users need a dedicated profile page to manage their account settings',
      type: 'Story',
      author: 'productowner'
    },
    {
      title: 'Optimize database queries',
      body: 'Some queries are taking too long and affecting performance',
      type: 'Task',
      author: 'backend-dev'
    }
  ];

  console.log(`Would create ${githubIssues.length} Jira issues:`);

  githubIssues.forEach((issue, index) => {
    console.log(`\n  ${index + 1}. ${issue.type}: ${issue.title}`);
    console.log(`     Author: ${issue.author}`);
    console.log(`     Description: ${issue.body.substring(0, 50)}...`);
  });

  // In real scenario, you would loop and create each issue:
  // for (const issue of githubIssues) {
  //   const issueKey = await createIssue('TEST', issue.type, issue.title, issue.body);
  //   console.log(`Created: ${issueKey}`);
  // }
}

// Example 5: Environment validation
function example5_EnvironmentCheck() {
  console.log('\n🔧 Example 5: Environment validation');

  const requiredVars = [
    'JIRA_USER_EMAIL',
    'JIRA_API_TOKEN',
    'JIRA_BASE_URL',
    'JIRA_PROJECT_KEY'
  ];

  const optionalVars = [
    'GITHUB_URL_CUSTOM_FIELD'
  ];

  console.log('Required environment variables:');
  let allPresent = true;
  requiredVars.forEach(envVar => {
    const isSet = !!process.env[envVar];
    console.log(`  ${isSet ? '✅' : '❌'} ${envVar}: ${isSet ? '[SET]' : '[MISSING]'}`);
    if (!isSet) allPresent = false;
  });

  console.log('\nOptional environment variables:');
  optionalVars.forEach(envVar => {
    const isSet = !!process.env[envVar];
    console.log(`  ${isSet ? '✅' : '⚪'} ${envVar}: ${isSet ? process.env[envVar] : '[NOT SET]'}`);
  });

  if (allPresent) {
    console.log('\n🚀 Environment ready for Jira integration!');
    console.log(`   Target: ${process.env.JIRA_BASE_URL}`);
    console.log(`   Project: ${process.env.JIRA_PROJECT_KEY}`);
  } else {
    console.log('\n⚠️  Set missing environment variables to enable Jira integration');
  }
}

// Example 6: CLI usage examples
function example6_CLIUsage() {
  console.log('\n💻 Example 6: Command-line usage examples');

  const examples = [
    {
      name: 'Simple issue',
      command: 'node create.js "Bug" "Login error" "Users cannot login"'
    },
    {
      name: 'GitHub sync issue',
      command: 'node create.js "Task" "[GitHub] Fix mobile bug" "Description here" "https://github.com/user/repo/issues/1" "username" "2023-01-01T00:00:00Z"'
    },
    {
      name: 'Story with multiline description',
      command: 'node create.js "Story" "User dashboard" "Create a user dashboard\\nwith analytics\\nand user data"'
    }
  ];

  examples.forEach((example, index) => {
    console.log(`\n  ${index + 1}. ${example.name}:`);
    console.log(`     ${example.command}`);
  });

  console.log('\n  Environment variables needed:');
  console.log('     export JIRA_USER_EMAIL="your-email@company.com"');
  console.log('     export JIRA_API_TOKEN="your-api-token"');
  console.log('     export JIRA_BASE_URL="https://company.atlassian.net"');
  console.log('     export JIRA_PROJECT_KEY="PROJ"');
}

// Example 7: Error handling
async function example7_ErrorHandling() {
  console.log('\n⚠️  Example 7: Error handling scenarios');

  const errorScenarios = [
    'Invalid project key',
    'Missing authentication',
    'Invalid issue type',
    'Network connectivity issues',
    'Malformed ADF content'
  ];

  console.log('Common error scenarios handled:');
  errorScenarios.forEach((scenario, index) => {
    console.log(`  ${index + 1}. ${scenario}`);
  });

  console.log('\nError handling features:');
  console.log('  ✅ Comprehensive error logging');
  console.log('  ✅ HTTP status code checking');
  console.log('  ✅ ADF validation');
  console.log('  ✅ Environment variable validation');
  console.log('  ✅ Graceful failure with exit codes');
}

// Main execution
async function runExamples() {
  console.log('🚀 GitHub-Jira Sync Examples\n');
  console.log('This script demonstrates various usage scenarios for the sync system.');

  // Run all examples
  await example1_SimpleIssue();
  await example2_GitHubSync();
  await example3_RichContent();
  await example4_BatchCreation();
  example5_EnvironmentCheck();
  example6_CLIUsage();
  await example7_ErrorHandling();

  console.log('\n✨ Examples completed!');
  console.log('\n📚 To learn more:');
  console.log('   - Read the README.md for setup instructions');
  console.log('   - Run "node test-create.js" to test your environment');
  console.log('   - Check the GitHub workflow in .github/workflows/jira-sync.yml');
  console.log('   - Explore adf-utils.js for ADF formatting options');
}

// Run examples if called directly
if (require.main === module) {
  runExamples().catch(console.error);
}

module.exports = {
  example1_SimpleIssue,
  example2_GitHubSync,
  example3_RichContent,
  example4_BatchCreation,
  example5_EnvironmentCheck,
  example6_CLIUsage,
  example7_ErrorHandling
};
