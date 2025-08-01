const fs = require("fs");
const path = require("path");

/**
 * Maps GitHub issue labels to Jira issue types based on configuration
 * @param {string[]} githubLabels - Array of GitHub issue labels
 * @param {string} configPath - Path to the mapping configuration file
 * @returns {string} - Mapped Jira issue type
 */
function mapGitHubLabelsToJiraIssueType(githubLabels, configPath = "./label-mapping.json") {
  try {
    // Read the mapping configuration
    const configFile = fs.readFileSync(configPath, "utf8");
    const config = JSON.parse(configFile);

    const { mappings, defaultIssueType } = config;

    // Check each label against the mappings
    for (const label of githubLabels) {
      if (mappings[label]) {
        return mappings[label];
      }
    }

    // If no mapping found, use default
    console.log(defaultIssueType);
    return defaultIssueType;
  } catch (error) {
    console.error("❌ Error reading mapping configuration:", error.message);
    console.log('ℹ️  Falling back to default issue type: "Task"');
    return "Task";
  }
}

/**
 * Validates that the mapped issue type exists in Jira
 * @param {string} issueType - The issue type to validate
 * @param {string[]} validIssueTypes - Array of valid Jira issue types for the project
 * @returns {boolean} - Whether the issue type is valid
 */
function validateJiraIssueType(issueType, validIssueTypes = []) {
  if (validIssueTypes.length === 0) {
    // If no validation list provided, assume it's valid
    return true;
  }

  const isValid = validIssueTypes.includes(issueType);
  if (!isValid) {
    console.warn(
      `⚠️  Issue type "${issueType}" may not exist in your Jira project. Valid types: [${validIssueTypes.join(", ")}]`,
    );
  }

  return isValid;
}

/**
 * Gets the priority mapping based on GitHub issue content
 * @param {object} issueData - GitHub issue data
 * @returns {string} - Jira priority level
 */
function mapPriority(issueData) {
  const body = (issueData.body || "").toLowerCase();
  const title = (issueData.title || "").toLowerCase();

  // Check for urgency indicators in bug reports
  if (body.includes("high - production system") || body.includes("production down")) {
    return "Highest";
  } else if (body.includes("medium - a non-critical feature")) {
    return "Medium";
  } else if (body.includes("low - minor issue") || body.includes("cosmetic")) {
    return "Low";
  }

  // Check for priority keywords in title or body
  if (title.includes("urgent") || title.includes("critical") || body.includes("urgent")) {
    return "High";
  }

  // Default priority
  return "Medium";
}

/**
 * Enhanced mapping function that includes additional Jira field mappings
 * @param {object} githubIssue - Complete GitHub issue object
 * @param {string} configPath - Path to the mapping configuration file
 * @returns {object} - Object with Jira field mappings
 */
function mapGitHubIssueToJiraFields(githubIssue, configPath = "./label-mapping.json") {
  const labels = githubIssue.labels
    ? githubIssue.labels.map((label) => (typeof label === "string" ? label : label.name))
    : [];

  const issueType = mapGitHubLabelsToJiraIssueType(labels, configPath);
  const priority = mapPriority(githubIssue);

  // Extract affected area from bug reports
  let components = [];
  const body = githubIssue.body || "";

  // Look for platform areas in the body text
  const platformAreas = ["REELS", "ALPHA", "TRINITY", "AI HUB"];
  platformAreas.forEach((area) => {
    // Check if area appears on its own line (common in form responses)
    const areaRegex = new RegExp(`^\\s*${area}\\s*$`, "mi");
    if (areaRegex.test(body)) {
      components.push(area);
    }
  });

  return {
    issueType,
    priority,
    components,
    labels: labels,
    originalLabels: githubIssue.labels,
  };
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.error("Usage: node map-issue-type.js <github-labels-json> [config-path]");
    console.error("Example: node map-issue-type.js '[\"Bug Report\"]' ./label-mapping.json");
    process.exit(1);
  }

  try {
    const githubLabels = JSON.parse(args[0]);
    const configPath = args[1] || "./label-mapping.json";

    const jiraIssueType = mapGitHubLabelsToJiraIssueType(githubLabels, configPath);

    // Output for GitHub workflow
    if (process.env.GITHUB_OUTPUT) {
      fs.appendFileSync(process.env.GITHUB_OUTPUT, `jira-issue-type=${jiraIssueType}\n`);
    }
  } catch (error) {
    console.error("❌ Error parsing GitHub labels:", error.message);
    process.exit(1);
  }
}

module.exports = {
  mapGitHubLabelsToJiraIssueType,
  validateJiraIssueType,
  mapPriority,
  mapGitHubIssueToJiraFields,
};
