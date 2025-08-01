/**
 * Atlassian Document Format (ADF) Utility Functions
 *
 * This module provides helper functions to convert plain text and other formats
 * to Atlassian Document Format (ADF) required by JIRA Cloud REST API v3.
 *
 * ADF is a JSON-based document format used by Atlassian products.
 * Learn more: https://developer.atlassian.com/cloud/jira/platform/apis/document/structure/
 */

/**
 * Converts plain text to ADF format
 * @param {string} text - Plain text to convert
 * @returns {object} ADF document object
 */
function textToADF(text) {
  if (!text || typeof text !== "string") {
    return {
      type: "doc",
      version: 1,
      content: [],
    };
  }

  // Split text by line breaks to create separate paragraphs
  const paragraphs = text.split("\n").filter((line) => line.trim() !== "");

  const content = paragraphs.map((paragraph) => ({
    type: "paragraph",
    content: [
      {
        type: "text",
        text: paragraph.trim(),
      },
    ],
  }));

  return {
    type: "doc",
    version: 1,
    content:
      content.length > 0
        ? content
        : [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: text,
                },
              ],
            },
          ],
  };
}

/**
 * Creates an ADF document with formatted text (bold, italic, etc.)
 * @param {Array} textNodes - Array of text node objects with format: {text: string, marks?: Array}
 * @returns {object} ADF document object
 *
 * Example textNodes:
 * [
 *   {text: "Normal text "},
 *   {text: "bold text", marks: [{type: "strong"}]},
 *   {text: " and "},
 *   {text: "italic text", marks: [{type: "em"}]}
 * ]
 */
function createFormattedADF(textNodes) {
  return {
    type: "doc",
    version: 1,
    content: [
      {
        type: "paragraph",
        content: textNodes.map((node) => ({
          type: "text",
          text: node.text,
          ...(node.marks && { marks: node.marks }),
        })),
      },
    ],
  };
}

/**
 * Creates an ADF document with a bulleted list
 * @param {Array<string>} items - Array of list items
 * @returns {object} ADF document object
 */
function createBulletListADF(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return textToADF("");
  }

  return {
    type: "doc",
    version: 1,
    content: [
      {
        type: "bulletList",
        content: items.map((item) => ({
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: item,
                },
              ],
            },
          ],
        })),
      },
    ],
  };
}

/**
 * Creates an ADF document with a numbered list
 * @param {Array<string>} items - Array of list items
 * @returns {object} ADF document object
 */
function createOrderedListADF(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return textToADF("");
  }

  return {
    type: "doc",
    version: 1,
    content: [
      {
        type: "orderedList",
        content: items.map((item) => ({
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: item,
                },
              ],
            },
          ],
        })),
      },
    ],
  };
}

/**
 * Creates an ADF document with a heading and content
 * @param {string} headingText - The heading text
 * @param {number} level - Heading level (1-6)
 * @param {string} content - Content text below the heading
 * @returns {object} ADF document object
 */
function createHeadingWithContentADF(headingText, level = 1, content = "") {
  const validLevel = Math.max(1, Math.min(6, level)); // Ensure level is between 1-6

  const adfContent = [
    {
      type: "heading",
      attrs: {
        level: validLevel,
      },
      content: [
        {
          type: "text",
          text: headingText,
        },
      ],
    },
  ];

  if (content) {
    adfContent.push({
      type: "paragraph",
      content: [
        {
          type: "text",
          text: content,
        },
      ],
    });
  }

  return {
    type: "doc",
    version: 1,
    content: adfContent,
  };
}

/**
 * Creates an ADF document with a code block
 * @param {string} code - Code content
 * @param {string} language - Programming language (optional)
 * @returns {object} ADF document object
 */
function createCodeBlockADF(code, language = "") {
  return {
    type: "doc",
    version: 1,
    content: [
      {
        type: "codeBlock",
        attrs: language ? { language } : {},
        content: [
          {
            type: "text",
            text: code,
          },
        ],
      },
    ],
  };
}

/**
 * Creates an ADF document with a link
 * @param {string} text - Link text
 * @param {string} url - URL
 * @returns {object} ADF document object
 */
function createLinkADF(text, url) {
  return {
    type: "doc",
    version: 1,
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: text,
            marks: [
              {
                type: "link",
                attrs: {
                  href: url,
                },
              },
            ],
          },
        ],
      },
    ],
  };
}

/**
 * Combines multiple ADF content blocks into a single document
 * @param {Array<object>} contentBlocks - Array of ADF content objects (not full documents)
 * @returns {object} Combined ADF document object
 */
function combineADFContent(contentBlocks) {
  return {
    type: "doc",
    version: 1,
    content: contentBlocks.filter((block) => block != null),
  };
}

/**
 * Validates if an object is a valid ADF document structure
 * @param {object} adf - Object to validate
 * @returns {boolean} True if valid ADF structure
 */
function isValidADF(adf) {
  return (
    adf &&
    typeof adf === "object" &&
    adf.type === "doc" &&
    adf.version === 1 &&
    Array.isArray(adf.content)
  );
}

module.exports = {
  textToADF,
  createFormattedADF,
  createBulletListADF,
  createOrderedListADF,
  createHeadingWithContentADF,
  createCodeBlockADF,
  createLinkADF,
  combineADFContent,
  isValidADF,
};
