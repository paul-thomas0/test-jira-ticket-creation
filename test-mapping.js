#!/usr/bin/env node

/**
 * Test script for GitHub to Jira issue type mapping system
 * Run this to validate your mapping configuration before deployment
 */

const { mapGitHubIssueToJiraFields, mapGitHubLabelsToJiraIssueType } = require("./map-issue-type");
const fs = require("fs");

console.log("🧪 GitHub-Jira Mapping Test Suite\n");

// Test cases based on GitHub issue templates
const testCases = [
  {
    name: "Bug Report - High Priority Production Issue",
    githubIssue: {
      title: "Production system down - REELS not loading",
      labels: [{ name: "Bug Report" }],
      body: `Which part of the platform is affected?
REELS

Urgency / Impact
High - Production system is down or severely impacted.

Issue Description
Users cannot access REELS functionality. Getting 500 errors.`,
    },
    expectedMapping: {
      issueType: "Bug Report",
      priority: "Highest",
      components: ["REELS"],
    },
  },
  {
    name: "Bug Report - Medium Priority ALPHA Issue",
    githubIssue: {
      title: "Search function not working in ALPHA",
      labels: [{ name: "Bug Report" }],
      body: `Which part of the platform is affected?
ALPHA

Urgency / Impact
Medium - A non-critical feature is not working.

Issue Description
Search results are not displaying correctly in ALPHA module.`,
    },
    expectedMapping: {
      issueType: "Bug Report",
      priority: "Medium",
      components: ["ALPHA"],
    },
  },
  {
    name: "Bug Report - Low Priority Cosmetic Issue",
    githubIssue: {
      title: "Minor UI styling issue in TRINITY",
      labels: [{ name: "Bug Report" }],
      body: `Which part of the platform is affected?
TRINITY

Urgency / Impact
Low - Minor issue or cosmetic bug.

Issue Description
Button alignment is slightly off on the dashboard.`,
    },
    expectedMapping: {
      issueType: "Bug Report",
      priority: "Low",
      components: ["TRINITY"],
    },
  },
  {
    name: "Enhancement Request",
    githubIssue: {
      title: "Add dark mode support",
      labels: [{ name: "Improvement" }],
      body: `What problem would this enhancement solve?
Users want a dark mode option for better viewing in low light.

Describe your proposed solution
Add a toggle in user settings to switch between light and dark themes.`,
    },
    expectedMapping: {
      issueType: "Improvement",
      priority: "Medium",
      components: [],
    },
  },
  {
    name: "Technical Support Request",
    githubIssue: {
      title: "How to configure API webhooks?",
      labels: [{ name: "Technical Support" }],
      body: `What is your question?
I need help setting up webhooks for our API integration.

What have you already tried or checked?
I have already read the documentation on page X but still confused about the authentication part.`,
    },
    expectedMapping: {
      issueType: "Technical Support",
      priority: "Medium",
      components: [],
    },
  },
  {
    name: "No Labels (Default)",
    githubIssue: {
      title: "Untitled issue",
      labels: [],
      body: "Some generic issue without template",
    },
    expectedMapping: {
      issueType: "Technical Support",
      priority: "Medium",
      components: [],
    },
  },
  {
    name: "Unknown Label",
    githubIssue: {
      title: "Custom issue type",
      labels: [{ name: "Custom Label" }],
      body: "Issue with unknown label type",
    },
    expectedMapping: {
      issueType: "Technical Support",
      priority: "Medium",
      components: [],
    },
  },
];

// Test the mapping configuration file
function testMappingConfig() {
  console.log("📋 Testing Mapping Configuration...");

  try {
    const config = JSON.parse(fs.readFileSync("./label-mapping.json", "utf8"));
    console.log("✅ Configuration file loaded successfully");
    console.log("📊 Current mappings:");

    Object.entries(config.mappings).forEach(([label, issueType]) => {
      console.log(`   ${label} → ${issueType}`);
    });

    console.log(`📌 Default issue type: ${config.defaultIssueType}`);
    console.log("");

    return true;
  } catch (error) {
    console.error("❌ Error loading mapping configuration:", error.message);
    return false;
  }
}

// Test individual label mapping
function testLabelMapping() {
  console.log("🏷️  Testing Label Mapping Function...");

  const labelTests = [
    { input: ["Bug Report"], expected: "Bug Report" },
    { input: ["Improvement"], expected: "Improvement" },
    { input: ["Technical Support"], expected: "Technical Support" },
    { input: [], expected: "Technical Support" },
    { input: ["Unknown Label"], expected: "Technical Support" },
  ];

  let passed = 0;
  let failed = 0;

  labelTests.forEach((test) => {
    try {
      const result = mapGitHubLabelsToJiraIssueType(test.input);
      if (result === test.expected) {
        console.log(`✅ [${test.input.join(", ") || "empty"}] → ${result}`);
        passed++;
      } else {
        console.log(
          `❌ [${test.input.join(", ") || "empty"}] → Expected: ${test.expected}, Got: ${result}`,
        );
        failed++;
      }
    } catch (error) {
      console.log(`❌ [${test.input.join(", ") || "empty"}] → Error: ${error.message}`);
      failed++;
    }
  });

  console.log(`\n📊 Label Mapping Results: ${passed} passed, ${failed} failed\n`);
  return failed === 0;
}

// Test complete issue mapping
function testCompleteMapping() {
  console.log("🔄 Testing Complete Issue Mapping...");

  let passed = 0;
  let failed = 0;

  testCases.forEach((testCase, index) => {
    console.log(`\n🧪 Test ${index + 1}: ${testCase.name}`);
    console.log(`   Title: "${testCase.githubIssue.title}"`);
    console.log(`   Labels: [${testCase.githubIssue.labels.map((l) => l.name).join(", ")}]`);

    try {
      const result = mapGitHubIssueToJiraFields(testCase.githubIssue);

      // Check issue type
      const issueTypeMatch = result.issueType === testCase.expectedMapping.issueType;
      console.log(`   Issue Type: ${result.issueType} ${issueTypeMatch ? "✅" : "❌"}`);

      // Check priority
      const priorityMatch = result.priority === testCase.expectedMapping.priority;
      console.log(`   Priority: ${result.priority} ${priorityMatch ? "✅" : "❌"}`);

      // Check components
      const componentsMatch =
        JSON.stringify(result.components.sort()) ===
        JSON.stringify(testCase.expectedMapping.components.sort());
      console.log(
        `   Components: [${result.components.join(", ")}] ${componentsMatch ? "✅" : "❌"}`,
      );

      if (issueTypeMatch && priorityMatch && componentsMatch) {
        console.log("   ✅ Test PASSED");
        passed++;
      } else {
        console.log("   ❌ Test FAILED");
        console.log(
          `   Expected: Issue Type: ${testCase.expectedMapping.issueType}, Priority: ${testCase.expectedMapping.priority}, Components: [${testCase.expectedMapping.components.join(", ")}]`,
        );
        failed++;
      }
    } catch (error) {
      console.log(`   ❌ Test ERROR: ${error.message}`);
      failed++;
    }
  });

  console.log(`\n📊 Complete Mapping Results: ${passed} passed, ${failed} failed\n`);
  return failed === 0;
}

// Test CLI functionality
function testCLI() {
  console.log("⚡ Testing CLI Functionality...");

  try {
    const { spawn } = require("child_process");

    // Test the CLI script
    const testLabels = '["Bug Report"]';
    console.log(`   Running: node map-issue-type.js '${testLabels}'`);

    const child = spawn("node", ["map-issue-type.js", testLabels], {
      stdio: "pipe",
      cwd: process.cwd(),
    });

    let output = "";
    child.stdout.on("data", (data) => {
      output += data.toString();
    });

    child.stderr.on("data", (data) => {
      output += data.toString();
    });

    child.on("close", (code) => {
      if (code === 0) {
        console.log("   ✅ CLI test passed");
        if (output.includes("Bug Report")) {
          console.log("   ✅ Correct mapping output detected");
        } else {
          console.log("   ⚠️  Unexpected mapping output");
        }
      } else {
        console.log(`   ❌ CLI test failed with exit code ${code}`);
        console.log(`   Output: ${output}`);
      }
    });

    return true;
  } catch (error) {
    console.log(`   ❌ CLI test error: ${error.message}`);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log("🚀 Starting mapping system tests...\n");

  const results = {
    config: testMappingConfig(),
    labelMapping: testLabelMapping(),
    completeMapping: testCompleteMapping(),
    cli: testCLI(),
  };

  console.log("📋 Test Summary:");
  console.log(`   Configuration: ${results.config ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`   Label Mapping: ${results.labelMapping ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`   Complete Mapping: ${results.completeMapping ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`   CLI Functionality: ${results.cli ? "✅ PASS" : "❌ FAIL"}`);

  const allPassed = Object.values(results).every((result) => result);

  if (allPassed) {
    console.log("\n🎉 All tests passed! Your mapping system is ready to use.");
    console.log("\n💡 Next steps:");
    console.log("   1. Commit your changes to the repository");
    console.log("   2. Create a test GitHub issue using one of the templates");
    console.log("   3. Check that the correct Jira issue type is created");
    process.exit(0);
  } else {
    console.log("\n⚠️  Some tests failed. Please review the configuration and try again.");
    console.log("\n🔧 Troubleshooting:");
    console.log("   1. Check that label-mapping.json exists and is valid JSON");
    console.log("   2. Verify your Jira issue type names match exactly");
    console.log("   3. Ensure all required files are present");
    process.exit(1);
  }
}

// Run tests when script is executed directly
if (require.main === module) {
  runTests().catch((error) => {
    console.error("❌ Test runner error:", error);
    process.exit(1);
  });
}

module.exports = {
  testMappingConfig,
  testLabelMapping,
  testCompleteMapping,
  runTests,
};
