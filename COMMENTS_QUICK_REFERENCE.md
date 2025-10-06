# Comments System - Quick Reference Guide

## For Developers

### Adding Comments to a Page

```tsx
import { CommentSection } from "@/components/CommentSection";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

function YourPage() {
  const currentUser = useQuery(api.users.getCurrentUser);
  const issue = useQuery(api.issues.getIssueById, { issueId });

  return (
    <div>
      {/* Your page content */}
      
      <CommentSection
        issueId={issueId}
        currentUserId={currentUser?._id}
        issueCreatorId={issue.creatorId}
      />
    </div>
  );
}
```

### Using Comment Functions Directly

#### Create a Comment
```tsx
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const createComment = useMutation(api.comments.createComment);

await createComment({
  issueId: "kd73j0fy8crrc3414r8kfs6a097rf765",
  content: "This is my comment",
});
```

#### Create a Reply
```tsx
const createReply = useMutation(api.comments.createReply);

await createReply({
  issueId: "kd73j0fy8crrc3414r8kfs6a097rf765",
  parentCommentId: "kn79pz2kxt9zjagmvtszzeaafx7rfxfh",
  content: "This is my reply",
});
```

#### Get Comments
```tsx
const comments = useQuery(api.comments.getCommentsByIssue, {
  issueId: "kd73j0fy8crrc3414r8kfs6a097rf765",
});

// comments is an array of top-level comments with user info
comments?.forEach(comment => {
  console.log(comment.content);
  console.log(comment.user.name);
  console.log(comment.replyCount);
});
```

#### Get Replies
```tsx
const replies = useQuery(api.comments.getRepliesByComment, {
  commentId: "kn79pz2kxt9zjagmvtszzeaafx7rfxfh",
});

// replies is an array of nested comments
```

#### Edit a Comment
```tsx
const updateComment = useMutation(api.comments.updateComment);

await updateComment({
  commentId: "kn79pz2kxt9zjagmvtszzeaafx7rfxfh",
  content: "Updated content",
});
```

#### Delete a Comment
```tsx
const deleteComment = useMutation(api.comments.deleteComment);

await deleteComment({
  commentId: "kn79pz2kxt9zjagmvtszzeaafx7rfxfh",
});
// This will also delete all replies
```

#### Get Comment Count
```tsx
const count = useQuery(api.comments.getCommentCount, {
  issueId: "kd73j0fy8crrc3414r8kfs6a097rf765",
});

console.log(`Total comments: ${count}`);
```

## Database Schema Reference

```typescript
{
  _id: Id<"comments">,
  issueId: Id<"issues">,
  userId: Id<"users">,
  content: string,
  parentCommentId?: Id<"comments">, // undefined for top-level
  isEdited: boolean,
  replyCount: number,
  createdAt: number,
  updatedAt: number,
  _creationTime: number,
}
```

## Permission Rules

| Action | Who Can Do It |
|--------|---------------|
| View comments | Everyone (including unauthenticated) |
| Create comment | Authenticated users only |
| Create reply | Authenticated users only |
| Edit comment | Comment author only |
| Delete comment | Comment author OR issue creator |

## Common Patterns

### Display Comment with Relative Time
```tsx
function formatRelativeTime(timestamp: number) {
  const now = Date.now();
  const diff = Math.floor((now - timestamp) / 1000);
  
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  
  return new Date(timestamp).toLocaleDateString();
}
```

### Check if User Can Edit
```tsx
const canEdit = currentUser?._id === comment.userId;
```

### Check if User Can Delete
```tsx
const canDelete = 
  currentUser?._id === comment.userId || 
  currentUser?._id === issueCreatorId;
```

### Handle Comment Submission
```tsx
const [content, setContent] = useState("");
const [isSubmitting, setIsSubmitting] = useState(false);
const createComment = useMutation(api.comments.createComment);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!content.trim()) return;
  
  setIsSubmitting(true);
  try {
    await createComment({ issueId, content });
    setContent("");
  } catch (error) {
    console.error("Failed to create comment:", error);
    alert("Failed to post comment. Please try again.");
  } finally {
    setIsSubmitting(false);
  }
};
```

## Error Handling

All mutations can throw errors. Common errors:

```typescript
try {
  await createComment({ issueId, content });
} catch (error) {
  // Possible errors:
  // - "Not authenticated"
  // - "Issue not found"
  // - "Comment content cannot be empty"
}

try {
  await updateComment({ commentId, content });
} catch (error) {
  // Possible errors:
  // - "Not authenticated"
  // - "Comment not found"
  // - "You can only edit your own comments"
  // - "Comment content cannot be empty"
}

try {
  await deleteComment({ commentId });
} catch (error) {
  // Possible errors:
  // - "Not authenticated"
  // - "Comment not found"
  // - "You can only delete your own comments or comments on your issues"
}
```

## Styling Reference

The CommentSection component uses Tailwind CSS. Key classes:

```css
/* Comment container */
.border.border-gray-200.rounded-lg.p-4

/* Reply indentation */
.ml-12

/* Author badge */
.px-2.py-0.5.bg-blue-100.text-blue-800.text-xs.rounded-full

/* Edited indicator */
.text-sm.text-gray-500

/* Action buttons */
.text-gray-500.hover:text-blue-600.p-1
```

## Testing Checklist

- [ ] Create a top-level comment
- [ ] Create a reply to a comment
- [ ] Edit your own comment
- [ ] Try to edit someone else's comment (should fail)
- [ ] Delete your own comment
- [ ] Delete a comment as issue creator
- [ ] Try to delete someone else's comment (should fail if not issue creator)
- [ ] Verify reply count updates
- [ ] Verify notifications are created
- [ ] Test with unauthenticated user (should only see comments)
- [ ] Test cascading delete (delete parent with replies)
- [ ] Verify "edited" indicator appears
- [ ] Test empty comment validation
- [ ] Test real-time updates (open in two browsers)

## Performance Tips

1. **Lazy Load Replies**: Only fetch replies when user expands them
   ```tsx
   const replies = useQuery(
     api.comments.getRepliesByComment,
     showReplies ? { commentId } : "skip"
   );
   ```

2. **Pagination**: For issues with many comments, implement pagination
   ```tsx
   // Future enhancement - not yet implemented
   const comments = useQuery(api.comments.getCommentsByIssue, {
     issueId,
     limit: 20,
     cursor: lastCommentId,
   });
   ```

3. **Optimistic Updates**: Show comment immediately, then sync with server
   ```tsx
   // Future enhancement - not yet implemented
   const optimisticComment = {
     _id: "temp-id",
     content,
     user: currentUser,
     createdAt: Date.now(),
     isEdited: false,
     replyCount: 0,
   };
   ```

## Troubleshooting

### Comments not appearing
- Check if user is authenticated
- Verify issueId is correct
- Check browser console for errors
- Verify Convex deployment is running

### Can't edit/delete comments
- Verify user is authenticated
- Check if user is the comment author
- For delete: check if user is issue creator

### Replies not showing
- Verify `showReplies` state is true
- Check if `getRepliesByComment` query is being called
- Verify parentCommentId is correct

### Notifications not working
- Check notifications table in Convex dashboard
- Verify notification creation in comment functions
- Check if recipient user exists

## Additional Resources

- [Convex Documentation](https://docs.convex.dev/)
- [React Query Hooks](https://docs.convex.dev/client/react)
- [Convex Auth](https://docs.convex.dev/auth)
- [Full Feature Documentation](./COMMENTS_FEATURE.md)
- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)

