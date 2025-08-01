const axios = require("axios");
const { textToADF, isValidADF } = require("./adf-utils");

// Get environment variables (GitHub workflow style)
const username = process.env.JIRA_USER_EMAIL;
const password = process.env.JIRA_API_TOKEN;
const baseUrl = process.env.JIRA_BASE_URL;
const projectKey = process.env.JIRA_PROJECT_KEY;

const auth = {
  username: username,
  password: password,
};

/**
 * Creates an issue in Jira Cloud using REST API
 * @param {string} projectKey - Jira project key
 * @param {string} issueType - Issue type (e.g., "Task", "Bug", "Story")
 * @param {string} summary - Issue title/summary
 * @param {string|object} description - Issue description (plain text or ADF object)
 * @param {string} githubUrl - GitHub issue URL (optional)
 * @returns {Promise<string>} - Jira issue key
 */
async function createIssue(projectKey, issueType, summary, description, githubUrl = null) {
  try {
    // Handle description: convert plain text to ADF or use existing ADF
    let adfDescription;
    if (typeof description === "string") {
      // Plain text - convert to ADF
      adfDescription = textToADF(description);
    } else if (description && typeof description === "object" && isValidADF(description)) {
      // Already in ADF format - use as is
      adfDescription = description;
    } else if (description && typeof description === "object") {
      // Object but not valid ADF - try to convert to string first
      adfDescription = textToADF(JSON.stringify(description));
    } else {
      // Null, undefined, or other - create empty ADF
      adfDescription = textToADF("");
    }

    const data = {
      fields: {
        project: { key: projectKey },
        summary: summary,
        description: adfDescription,
        issuetype: { name: issueType },
      },
    };

    // Add GitHub URL to custom field if provided
    if (githubUrl && process.env.GITHUB_URL_CUSTOM_FIELD) {
      data.fields[process.env.GITHUB_URL_CUSTOM_FIELD] = githubUrl;
    }

    const config = {
      headers: { "Content-Type": "application/json" },
      auth: auth,
    };

    const response = await axios.post(`${baseUrl}/rest/api/3/issue`, data, config);
    return response.data.key;
  } catch (error) {
    console.error("Error creating Jira issue:");
    if (error.response && error.response.data && error.response.data.errors) {
      console.error(JSON.stringify(error.response.data.errors, null, 2));
    } else {
      console.error(error.message);
    }
    throw error;
  }
}

/**
 * Creates a complex ADF description with GitHub metadata
 * @param {string} githubUrl - GitHub issue URL
 * @param {string} author - GitHub issue author
 * @param {string} createdAt - Creation timestamp
 * @param {string} body - Issue body
 * @returns {object} - ADF formatted description
 */
function createGitHubIssueADF(githubUrl, author, createdAt, body) {
  const content = [
    // GitHub issue link
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Original GitHub Issue: ",
        },
        {
          type: "text",
          text: githubUrl,
          marks: [
            {
              type: "link",
              attrs: {
                href: githubUrl,
              },
            },
          ],
        },
      ],
    },
    // Author info
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: `Created by: ${author}`,
        },
      ],
    },
    // Created date
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: `Created at: ${createdAt}`,
        },
      ],
    },
    // Separator
    {
      type: "rule",
    },
  ];

  // Add issue body if provided
  if (body && body.trim()) {
    // Split body into paragraphs
    const paragraphs = body.split("\n").filter((line) => line.trim() !== "");

    paragraphs.forEach((paragraph) => {
      content.push({
        type: "paragraph",
        content: [
          {
            type: "text",
            text: paragraph.trim(),
          },
        ],
      });
    });
  }

  return {
    type: "doc",
    version: 1,
    content: content,
  };
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length < 3) {
    console.error(
      "Usage: node create.js <issueType> <summary> <description> [githubUrl] [author] [createdAt]",
    );
    console.error(
      "Example: node create.js 'Task' 'Issue title' 'Issue description' 'https://github.com/user/repo/issues/1' 'username' '2023-01-01T00:00:00Z'",
    );
    process.exit(1);
  }

  const [issueType, summary, description, githubUrl, author, createdAt] = args;

  // Validate required environment variables
  if (!username || !password || !baseUrl || !projectKey) {
    console.error("Missing required environment variables:");
    console.error("- JIRA_USER_EMAIL");
    console.error("- JIRA_API_TOKEN");
    console.error("- JIRA_BASE_URL");
    console.error("- JIRA_PROJECT_KEY");
    process.exit(1);
  }

  // Create issue
  (async () => {
    try {
      let finalDescription;

      // If GitHub metadata is provided, create rich ADF description
      if (githubUrl && author && createdAt) {
        finalDescription = createGitHubIssueADF(githubUrl, author, createdAt, description);
      } else {
        // Use plain description
        finalDescription = description;
      }

      const issueKey = await createIssue(
        projectKey,
        issueType,
        summary,
        finalDescription,
        githubUrl,
      );
      console.log(`✅ Successfully created Jira issue: ${issueKey}`);
      console.log(`🔗 Issue URL: ${baseUrl}/browse/${issueKey}`);

      // Output for GitHub workflow
      if (process.env.GITHUB_OUTPUT) {
        require("fs").appendFileSync(process.env.GITHUB_OUTPUT, `jira-key=${issueKey}\n`);
        require("fs").appendFileSync(
          process.env.GITHUB_OUTPUT,
          `jira-url=${baseUrl}/browse/${issueKey}\n`,
        );
      }
    } catch (error) {
      console.error("❌ Failed to create Jira issue");
      process.exit(1);
    }
  })();
}

module.exports = {
  createIssue,
  createGitHubIssueADF,
};
