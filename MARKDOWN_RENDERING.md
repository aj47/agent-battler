# Markdown Rendering Feature

## Overview

Agent Battler now supports **GitHub-flavored markdown** rendering for issue descriptions, pull request descriptions, and comments. This allows users to format their content with rich text, code blocks, images, tables, and more - similar to GitHub's native markdown support.

## Features

### Supported Markdown Elements

- **Headers**: `# H1`, `## H2`, `### H3`, etc.
- **Text Formatting**: 
  - **Bold**: `**text**`
  - *Italic*: `*text*`
  - ~~Strikethrough~~: `~~text~~`
- **Code**:
  - Inline code: `` `code` ``
  - Code blocks with syntax highlighting: ` ```language\ncode\n``` `
- **Lists**:
  - Unordered: `- item`
  - Ordered: `1. item`
  - Nested lists supported
- **Links**: `[text](url)`
- **Images**: `![alt](url)`
- **Tables**: GitHub-flavored markdown tables
- **Blockquotes**: `> quote`
- **Horizontal Rules**: `---`
- **Line Breaks**: Automatic line break handling

## Implementation

### Dependencies

The feature uses the following npm packages:

- **react-markdown** (^3.0.0): Core markdown rendering library
- **remark-gfm**: GitHub-flavored markdown support
- **remark-breaks**: Automatic line break handling

Install with:
```bash
npm install react-markdown remark-gfm remark-breaks
```

### Components

#### MarkdownRenderer Component

**Location**: `components/MarkdownRenderer.tsx`

A reusable React component that renders markdown content with proper styling.

**Props**:
- `content` (string): The markdown content to render
- `className` (string, optional): Additional CSS classes

**Usage**:
```tsx
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

export function MyComponent() {
  return (
    <MarkdownRenderer 
      content="# Hello\n\nThis is **markdown**"
      className="custom-class"
    />
  );
}
```

**Styling**:
The component includes comprehensive Tailwind CSS styling for all markdown elements:
- Headers with appropriate sizing and spacing
- Code blocks with dark background and syntax highlighting
- Tables with borders and proper alignment
- Links with hover effects
- Images with rounded corners and borders
- Blockquotes with left border and background

### Integration Points

#### 1. Issue Descriptions
**File**: `app/issues/[id]/page.tsx`

Issue descriptions now render as markdown instead of plain text:
```tsx
<div className="mb-6">
  <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
  <div className="text-gray-700">
    <MarkdownRenderer content={issue.description} />
  </div>
</div>
```

#### 2. Pull Request Descriptions
**File**: `app/issues/[id]/page.tsx`

PR descriptions are rendered as markdown:
```tsx
<div className="text-sm text-gray-600 mb-3">
  <MarkdownRenderer content={pr.description} />
</div>
```

#### 3. Comments
**File**: `components/CommentSection.tsx`

Comments and replies support markdown formatting:
```tsx
<div className="text-gray-700 mb-3">
  <MarkdownRenderer content={comment.content} />
</div>
```

## Testing

### Test Issue

A test issue with comprehensive markdown examples has been created:

**ID**: `kd7emp92cpemrexn5jnvv0wae57sb0qb`

**Content includes**:
- Headers (H1-H6)
- Text formatting (bold, italic, strikethrough)
- Code blocks with syntax highlighting
- Lists (ordered and unordered)
- Blockquotes
- Links
- Images
- Tables

**To view**: Navigate to `/issues/kd7emp92cpemrexn5jnvv0wae57sb0qb`

### Creating Test Issues

Use the dev helper to create test issues with markdown:

```bash
npx convex run dev:insertIssue '{
  "creatorId": "USER_ID",
  "githubIssueId": 1,
  "githubIssueNumber": 1,
  "repoOwner": "test",
  "repoName": "repo",
  "title": "Test Issue",
  "description": "# Markdown Content\n\n**Bold** and *italic* text",
  "githubUrl": "https://github.com/test/repo/issues/1",
  "labels": ["test"],
  "bountyAmount": 100,
  "difficulty": "easy"
}'
```

## Styling Details

### Color Scheme

- **Headers**: Dark gray (`text-gray-900`)
- **Body text**: Medium gray (`text-gray-700`)
- **Code blocks**: Dark background (`bg-gray-900`) with light text
- **Links**: Blue (`text-blue-600`) with hover effect
- **Blockquotes**: Blue left border with light blue background
- **Tables**: Gray borders with light gray header background

### Responsive Design

All markdown elements are responsive and work well on mobile devices:
- Images scale to fit container width
- Tables have horizontal scroll on small screens
- Code blocks have horizontal scroll for long lines
- Text wraps appropriately

## Future Enhancements

Potential improvements for the markdown system:

1. **Syntax Highlighting**: Add language-specific syntax highlighting for code blocks
2. **Mentions**: Support @mentions with user links
3. **Emoji**: Add emoji support
4. **Custom Components**: Allow custom React components in markdown
5. **Markdown Editor**: Add a visual markdown editor with preview
6. **Sanitization**: Enhanced HTML sanitization for security
7. **Mermaid Diagrams**: Support for diagram rendering
8. **Math**: LaTeX/MathML support for equations

## Security Considerations

The `react-markdown` library automatically sanitizes HTML to prevent XSS attacks. Only safe HTML tags are rendered, and potentially dangerous attributes are stripped.

## Performance

The markdown rendering is optimized for performance:
- Markdown parsing happens client-side
- No external API calls required
- Efficient re-rendering with React memoization
- Minimal bundle size impact

## Troubleshooting

### Images Not Loading

Ensure image URLs are absolute and accessible. Relative URLs won't work.

### Code Block Language Not Recognized

The language identifier must be valid. Common ones: `javascript`, `python`, `bash`, `json`, `html`, `css`, etc.

### Styling Issues

If markdown elements don't appear styled correctly, ensure Tailwind CSS is properly configured and the prose classes are available.

## References

- [react-markdown Documentation](https://github.com/remarkjs/react-markdown)
- [GitHub Flavored Markdown Spec](https://github.github.com/gfm/)
- [Remark Plugins](https://github.com/remarkjs/remark/blob/main/doc/plugins.md)

