# Forum-Style Comments Feature

## Overview

The Agent Battler platform now includes a comprehensive forum-style commenting system that allows users to discuss issues, ask questions, and provide updates. The system supports nested replies (threaded discussions) similar to popular platforms like Reddit, GitHub Discussions, and Stack Overflow.

## Features

### 1. **Top-Level Comments**
- Users can post comments directly on any issue
- Comments are displayed in reverse chronological order (newest first)
- Each comment shows:
  - Author's name and avatar
  - Timestamp (with relative time display: "just now", "5m ago", "2h ago", etc.)
  - "Author" badge if the commenter is the issue creator
  - Edit indicator if the comment has been modified

### 2. **Nested Replies**
- Users can reply to any top-level comment
- Replies are visually indented to show the thread hierarchy
- Reply count is displayed on parent comments
- Replies can be shown/hidden with a toggle button
- Replies are displayed in chronological order (oldest first)

### 3. **Comment Management**
- **Edit**: Comment authors can edit their own comments
  - Edited comments are marked with an "edited" indicator
  - Edit history is tracked via `updatedAt` timestamp
- **Delete**: Comments can be deleted by:
  - The comment author
  - The issue creator (moderator capability)
  - Deleting a parent comment also deletes all its replies
  - Confirmation dialog prevents accidental deletions

### 4. **Real-Time Updates**
- Comments use Convex's reactive queries
- New comments appear automatically without page refresh
- Reply counts update in real-time
- Comment count in the header updates automatically

### 5. **User Experience**
- Clean, modern UI with hover effects
- Responsive design works on all screen sizes
- Loading states for async operations
- Error handling with user-friendly messages
- Textarea auto-resize for better UX

## Database Schema

### Comments Table

```typescript
comments: defineTable({
  issueId: v.id("issues"),           // The issue this comment belongs to
  userId: v.id("users"),             // The author of the comment
  content: v.string(),               // The comment text
  parentCommentId: v.optional(v.id("comments")), // For nested replies
  isEdited: v.boolean(),             // Track if comment was edited
  replyCount: v.number(),            // Number of direct replies
  createdAt: v.number(),             // Creation timestamp
  updatedAt: v.number(),             // Last update timestamp
})
  .index("by_issue", ["issueId"])
  .index("by_user", ["userId"])
  .index("by_parent", ["parentCommentId"])
  .index("by_issue_and_parent", ["issueId", "parentCommentId"])
```

### Key Indexes
- `by_issue`: Efficiently query all comments for an issue
- `by_user`: Find all comments by a specific user
- `by_parent`: Get all replies to a comment
- `by_issue_and_parent`: Optimized for fetching top-level comments

## API Functions

### Mutations (Write Operations)

#### `createComment`
Create a new top-level comment on an issue.

```typescript
await createComment({
  issueId: Id<"issues">,
  content: string,
});
```

**Features:**
- Validates user authentication
- Verifies issue exists
- Trims whitespace from content
- Creates notification for issue creator (if different from commenter)

#### `createReply`
Create a reply to an existing comment.

```typescript
await createReply({
  issueId: Id<"issues">,
  parentCommentId: Id<"comments">,
  content: string,
});
```

**Features:**
- Validates parent comment exists and belongs to the issue
- Increments parent comment's reply count
- Creates notification for parent comment author

#### `updateComment`
Edit an existing comment.

```typescript
await updateComment({
  commentId: Id<"comments">,
  content: string,
});
```

**Features:**
- Only the comment author can edit
- Marks comment as edited
- Updates the `updatedAt` timestamp

#### `deleteComment`
Delete a comment and all its replies.

```typescript
await deleteComment({
  commentId: Id<"comments">,
});
```

**Features:**
- Can be deleted by comment author or issue creator
- Cascading delete: removes all replies
- Updates parent comment's reply count if it's a reply

### Queries (Read Operations)

#### `getCommentsByIssue`
Get all top-level comments for an issue with user information.

```typescript
const comments = await getCommentsByIssue({
  issueId: Id<"issues">,
});
```

**Returns:**
```typescript
Array<{
  ...comment,
  user: {
    _id: Id<"users">,
    name: string,
    githubUsername: string,
    image: string,
  }
}>
```

#### `getRepliesByComment`
Get all replies to a specific comment with user information.

```typescript
const replies = await getRepliesByComment({
  commentId: Id<"comments">,
});
```

#### `getCommentCount`
Get the total number of comments (including replies) for an issue.

```typescript
const count = await getCommentCount({
  issueId: Id<"issues">,
});
```

## React Components

### `CommentSection`
Main component that displays the entire comment section.

**Props:**
```typescript
{
  issueId: Id<"issues">,
  currentUserId?: Id<"users">,
  issueCreatorId: Id<"users">,
}
```

**Features:**
- New comment form (only for authenticated users)
- Comment count display
- List of all top-level comments
- Loading and empty states

### `Comment`
Individual comment component with reply functionality.

**Features:**
- User avatar and name display
- "Author" badge for issue creator
- Relative timestamp display
- Edit/delete buttons (with permission checks)
- Reply form (collapsible)
- Nested replies display (collapsible)
- Edit mode with save/cancel

## Notifications

The comment system integrates with the existing notification system:

1. **New Comment**: Issue creator receives notification when someone comments
2. **New Reply**: Comment author receives notification when someone replies

Notifications include:
- Type: `"comment"`
- Title and message with context
- Link to the related issue
- Unread status tracking

## Usage Example

### In an Issue Detail Page

```tsx
import { CommentSection } from "@/components/CommentSection";

export default function IssueDetailPage() {
  const issue = useQuery(api.issues.getIssueById, { issueId });
  const currentUser = useQuery(api.users.getCurrentUser);

  return (
    <div>
      {/* Issue details */}
      
      {/* Comments Section */}
      <CommentSection
        issueId={issueId}
        currentUserId={currentUser?._id}
        issueCreatorId={issue.creatorId}
      />
    </div>
  );
}
```

## Security & Permissions

### Authentication
- All write operations require authentication
- Unauthenticated users can view comments but cannot post

### Authorization
- **Create**: Any authenticated user can comment
- **Edit**: Only the comment author can edit their comments
- **Delete**: Comment author OR issue creator can delete
  - This gives issue creators moderator capabilities

### Data Validation
- Content cannot be empty (after trimming whitespace)
- Parent comment must belong to the same issue
- All IDs are validated for existence

## Future Enhancements

Potential improvements for the comment system:

1. **Rich Text Editor**: Support for markdown formatting
2. **Mentions**: @mention other users in comments
3. **Reactions**: Like/upvote comments
4. **Comment Sorting**: Sort by newest, oldest, most replies
5. **Search**: Search within comments
6. **Moderation**: Flag inappropriate comments
7. **Edit History**: View previous versions of edited comments
8. **Pagination**: Load comments in batches for performance
9. **Real-time Indicators**: Show when someone is typing
10. **File Attachments**: Attach images or files to comments

## Performance Considerations

- **Indexes**: Optimized database indexes for fast queries
- **Lazy Loading**: Replies are only loaded when expanded
- **Reactive Queries**: Convex handles real-time updates efficiently
- **Batch Operations**: Multiple comments loaded in single query
- **Cascading Deletes**: Handled efficiently in a single transaction

## Testing

To test the comment system:

1. Create or navigate to an issue
2. Post a top-level comment
3. Reply to the comment
4. Edit your comment
5. Delete a comment
6. Verify notifications are created
7. Test as different users (author vs. non-author)
8. Test as issue creator (moderator permissions)

## Conclusion

The forum-style comment system provides a robust, user-friendly way for the Agent Battler community to discuss issues, share insights, and collaborate on solutions. The nested reply structure encourages organized discussions while the real-time updates keep everyone in sync.

