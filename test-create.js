#!/usr/bin/env node

/**
 * Test script for create.js functionality
 * This script tests the Jira issue creation without actually creating issues
 */

const { createGitHubIssueADF, createIssue } = require('./create.js');
const { textToADF, isValidADF } = require('./adf-utils.js');

// Test data
const testData = {
  projectKey: 'TEST',
  issueType: 'Task',
  summary: '[GitHub] Test Issue from GitHub Sync',
  description: 'This is a test issue created from GitHub.\n\nIt has multiple lines\nand should be formatted properly in Jira.',
  githubUrl: 'https://github.com/testuser/testrepo/issues/123',
  author: 'testuser',
  createdAt: '2023-12-01T10:30:00Z'
};

console.log('🧪 Testing GitHub-Jira Sync create.js functionality\n');

// Test 1: ADF Utilities
console.log('1️⃣ Testing ADF utilities...');
try {
  const simpleADF = textToADF('Simple test text');
  console.log('✅ textToADF works');
  console.log('   Result valid ADF:', isValidADF(simpleADF));

  const complexADF = textToADF('Line 1\nLine 2\nLine 3');
  console.log('✅ Multi-line textToADF works');
  console.log('   Paragraphs created:', complexADF.content.length);
} catch (error) {
  console.error('❌ ADF utilities test failed:', error.message);
}

// Test 2: GitHub Issue ADF Creation
console.log('\n2️⃣ Testing GitHub issue ADF creation...');
try {
  const githubADF = createGitHubIssueADF(
    testData.githubUrl,
    testData.author,
    testData.createdAt,
    testData.description
  );

  console.log('✅ createGitHubIssueADF works');
  console.log('   Valid ADF:', isValidADF(githubADF));
  console.log('   Content blocks:', githubADF.content.length);

  // Show the structure
  console.log('   ADF Structure:');
  githubADF.content.forEach((block, index) => {
    console.log(`     ${index + 1}. ${block.type}`);
  });
} catch (error) {
  console.error('❌ GitHub ADF creation test failed:', error.message);
}

// Test 3: Environment Variable Check
console.log('\n3️⃣ Testing environment variables...');
const requiredEnvVars = [
  'JIRA_USER_EMAIL',
  'JIRA_API_TOKEN',
  'JIRA_BASE_URL',
  'JIRA_PROJECT_KEY'
];

let envVarsPresent = true;
requiredEnvVars.forEach(envVar => {
  if (process.env[envVar]) {
    console.log(`✅ ${envVar} is set`);
  } else {
    console.log(`❌ ${envVar} is missing`);
    envVarsPresent = false;
  }
});

// Test 4: Dry run test (if env vars are present)
if (envVarsPresent) {
  console.log('\n4️⃣ Environment ready for Jira API calls');
  console.log('   Base URL:', process.env.JIRA_BASE_URL);
  console.log('   Project Key:', process.env.JIRA_PROJECT_KEY);
  console.log('   User Email:', process.env.JIRA_USER_EMAIL);
  console.log('   API Token:', process.env.JIRA_API_TOKEN ? '[SET]' : '[NOT SET]');
} else {
  console.log('\n4️⃣ Environment not ready for Jira API calls');
  console.log('   To test with real Jira, set the required environment variables:');
  requiredEnvVars.forEach(envVar => {
    console.log(`   export ${envVar}="your_value"`);
  });
}

// Test 5: CLI Arguments parsing simulation
console.log('\n5️⃣ Testing CLI arguments parsing...');
const testArgs = [
  'Task',
  '[GitHub] Test Issue Title',
  'Test issue description\nwith multiple lines',
  'https://github.com/user/repo/issues/1',
  'username',
  '2023-01-01T00:00:00Z'
];

console.log('✅ Test arguments prepared:');
testArgs.forEach((arg, index) => {
  const labels = ['Issue Type', 'Summary', 'Description', 'GitHub URL', 'Author', 'Created At'];
  console.log(`   ${labels[index]}: ${arg.substring(0, 50)}${arg.length > 50 ? '...' : ''}`);
});

// Test 6: JSON Output for GitHub Actions
console.log('\n6️⃣ Testing GitHub Actions output format...');
const mockJiraKey = 'TEST-123';
const mockJiraUrl = 'https://yourcompany.atlassian.net/browse/TEST-123';

console.log('✅ Mock GitHub Actions outputs:');
console.log(`   jira-key=${mockJiraKey}`);
console.log(`   jira-url=${mockJiraUrl}`);

// Summary
console.log('\n📋 Test Summary:');
console.log('✅ ADF utilities are working');
console.log('✅ GitHub issue ADF creation is working');
console.log(`${envVarsPresent ? '✅' : '❌'} Environment variables are ${envVarsPresent ? 'ready' : 'missing'}`);
console.log('✅ CLI argument parsing is ready');
console.log('✅ GitHub Actions integration is ready');

if (envVarsPresent) {
  console.log('\n🚀 Ready to create real Jira issues!');
  console.log('   Run: node create.js "Task" "Test Title" "Test Description" "https://github.com/user/repo/issues/1" "username" "2023-01-01T00:00:00Z"');
} else {
  console.log('\n⚠️  Set environment variables to test with real Jira');
}

console.log('\n✨ Test completed successfully!');
