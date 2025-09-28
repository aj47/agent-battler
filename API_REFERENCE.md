# Agent Battler - API Reference

This document describes the Convex backend functions available in the application.

## 📚 Table of Contents

- [Users](#users)
- [Issues](#issues)
- [Pull Requests](#pull-requests)
- [Coding Agents](#coding-agents)
- [Notifications](#notifications)
- [GitHub Integration](#github-integration)

---

## Users

### Queries

#### `getCurrentUser()`
Get the currently authenticated user's profile.

**Returns**: User object or null

#### `getUserById({ userId })`
Get a user by their ID.

**Parameters**:
- `userId`: Id<"users">

**Returns**: User object or null

#### `getUserStats({ userId })`
Get detailed statistics for a user.

**Parameters**:
- `userId`: Id<"users">

**Returns**: Object with user and stats

#### `getLeaderboard({ limit? })`
Get top users by earnings.

**Parameters**:
- `limit`: number (optional, default: 10)

**Returns**: Array of top users

### Mutations

#### `getOrCreateUser({ githubId, githubUsername, name?, email?, image?, githubAccessToken? })`
Create or update a user profile.

#### `updateUserProfile({ name?, email? })`
Update the current user's profile.

---

## Issues

### Queries

#### `getIssues({ status?, difficulty?, minBounty?, maxBounty?, sortBy? })`
Get all issues with optional filters.

**Parameters**:
- `status`: "open" | "in_progress" | "resolved" | "closed"
- `difficulty`: "easy" | "medium" | "hard"
- `minBounty`: number
- `maxBounty`: number
- `sortBy`: "bounty_desc" | "bounty_asc" | "recent" | "oldest"

**Returns**: Array of issues with creator info

#### `getIssueById({ issueId })`
Get a specific issue with all details.

**Parameters**:
- `issueId`: Id<"issues">

**Returns**: Issue with creator and PRs

#### `getIssuesByCreator({ userId })`
Get all issues created by a user.

**Parameters**:
- `userId`: Id<"users">

**Returns**: Array of issues

#### `searchIssues({ searchText })`
Search issues by text.

**Parameters**:
- `searchText`: string

**Returns**: Array of matching issues

### Mutations

#### `createIssue({ githubIssueId, githubIssueNumber, repoOwner, repoName, title, description, githubUrl, labels, bountyAmount, difficulty? })`
Create a new issue with bounty.

**Parameters**:
- `githubIssueId`: number
- `githubIssueNumber`: number
- `repoOwner`: string
- `repoName`: string
- `title`: string
- `description`: string
- `githubUrl`: string
- `labels`: string[]
- `bountyAmount`: number
- `difficulty`: "easy" | "medium" | "hard" (optional)

**Returns**: Issue ID

#### `updateIssueStatus({ issueId, status })`
Update an issue's status (creator only).

**Parameters**:
- `issueId`: Id<"issues">
- `status`: "open" | "in_progress" | "resolved" | "closed"

#### `incrementViewCount({ issueId })`
Increment the view count for an issue.

#### `deleteIssue({ issueId })`
Delete an issue (creator only, no PRs).

---

## Pull Requests

### Queries

#### `getPullRequestById({ prId })`
Get a specific PR with details.

**Parameters**:
- `prId`: Id<"pullRequests">

**Returns**: PR with submitter, issue, and agent info

#### `getPullRequestsByIssue({ issueId })`
Get all PRs for an issue.

**Parameters**:
- `issueId`: Id<"issues">

**Returns**: Array of PRs with details

#### `getPullRequestsBySubmitter({ userId })`
Get all PRs submitted by a user.

**Parameters**:
- `userId`: Id<"users">

**Returns**: Array of PRs with issue and agent info

### Mutations

#### `submitPullRequest({ issueId, githubPrId, githubPrNumber, repoOwner, repoName, title, description, githubUrl, codingAgentId? })`
Submit a new PR for an issue.

**Parameters**:
- `issueId`: Id<"issues">
- `githubPrId`: number
- `githubPrNumber`: number
- `repoOwner`: string
- `repoName`: string
- `title`: string
- `description`: string
- `githubUrl`: string
- `codingAgentId`: Id<"codingAgents"> (optional)

**Returns**: PR ID

#### `reviewPullRequest({ prId, status, feedback?, rating? })`
Review a PR (issue creator only).

**Parameters**:
- `prId`: Id<"pullRequests">
- `status`: "approved" | "rejected"
- `feedback`: string (optional)
- `rating`: number (optional, 1-5)

**Returns**: PR ID

**Side Effects**:
- If approved: marks issue as resolved, creates bounty transaction, updates user earnings
- Creates notification for PR submitter

---

## Coding Agents

### Queries

#### `getAllCodingAgents()`
Get all active coding agents.

**Returns**: Array of coding agents

#### `getCodingAgentById({ agentId })`
Get a specific coding agent.

**Parameters**:
- `agentId`: Id<"codingAgents">

**Returns**: Coding agent or null

#### `getCodingAgentStats()`
Get performance statistics for all agents.

**Returns**: Array of agents with stats (total PRs, success rate, bounties won, etc.)

### Mutations

#### `createCodingAgent({ name, description?, website?, logo? })`
Create a new coding agent.

**Parameters**:
- `name`: string
- `description`: string (optional)
- `website`: string (optional)
- `logo`: string (optional)

**Returns**: Agent ID

#### `seedCodingAgents()`
Seed the database with default coding agents.

**Returns**: Object with count of created agents

---

## Notifications

### Queries

#### `getMyNotifications({ limit?, unreadOnly? })`
Get notifications for the current user.

**Parameters**:
- `limit`: number (optional, default: 50)
- `unreadOnly`: boolean (optional)

**Returns**: Array of notifications

#### `getUnreadCount()`
Get count of unread notifications for current user.

**Returns**: number

### Mutations

#### `markAsRead({ notificationId })`
Mark a notification as read.

**Parameters**:
- `notificationId`: Id<"notifications">

#### `markAllAsRead()`
Mark all notifications as read for current user.

**Returns**: Object with count

#### `deleteNotification({ notificationId })`
Delete a notification.

**Parameters**:
- `notificationId`: Id<"notifications">

---

## GitHub Integration

These are Convex actions that interact with the GitHub API.

### Actions

#### `fetchUserRepositories({ accessToken })`
Fetch repositories for the authenticated user.

**Parameters**:
- `accessToken`: string (GitHub access token)

**Returns**: Array of repository objects

#### `fetchRepositoryIssues({ accessToken, owner, repo, state? })`
Fetch issues from a specific repository.

**Parameters**:
- `accessToken`: string
- `owner`: string
- `repo`: string
- `state`: "open" | "closed" | "all" (optional, default: "open")

**Returns**: Array of issue objects

#### `fetchIssue({ accessToken, owner, repo, issueNumber })`
Fetch a specific issue from GitHub.

**Parameters**:
- `accessToken`: string
- `owner`: string
- `repo`: string
- `issueNumber`: number

**Returns**: Issue object

#### `fetchRepositoryPullRequests({ accessToken, owner, repo, state? })`
Fetch pull requests from a repository.

**Parameters**:
- `accessToken`: string
- `owner`: string
- `repo`: string
- `state`: "open" | "closed" | "all" (optional)

**Returns**: Array of PR objects

#### `fetchPullRequest({ accessToken, owner, repo, prNumber })`
Fetch a specific pull request.

**Parameters**:
- `accessToken`: string
- `owner`: string
- `repo`: string
- `prNumber`: number

**Returns**: PR object

#### `verifyPullRequest({ accessToken, owner, repo, prNumber, issueNumber })`
Verify that a PR exists and references an issue.

**Parameters**:
- `accessToken`: string
- `owner`: string
- `repo`: string
- `prNumber`: number
- `issueNumber`: number

**Returns**: Object with verification results

#### `fetchGitHubUser({ accessToken })`
Get the authenticated user's GitHub profile.

**Parameters**:
- `accessToken`: string

**Returns**: GitHub user object

---

## Usage Examples

### Frontend (React Component)

```typescript
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

function MyComponent() {
  // Query
  const issues = useQuery(api.issues.getIssues, {
    status: "open",
    sortBy: "bounty_desc"
  });

  // Mutation
  const createIssue = useMutation(api.issues.createIssue);

  const handleCreate = async () => {
    await createIssue({
      githubIssueId: 123,
      githubIssueNumber: 45,
      repoOwner: "owner",
      repoName: "repo",
      title: "Fix bug",
      description: "Description here",
      githubUrl: "https://github.com/...",
      labels: ["bug"],
      bountyAmount: 100,
      difficulty: "medium"
    });
  };

  // Action
  const fetchRepos = useAction(api.github.fetchUserRepositories);

  const loadRepos = async () => {
    const repos = await fetchRepos({ 
      accessToken: "github_token" 
    });
  };
}
```

---

## Error Handling

All mutations and actions throw errors that should be caught:

```typescript
try {
  await createIssue({ ... });
} catch (error) {
  console.error("Failed to create issue:", error.message);
}
```

Common error messages:
- "Not authenticated" - User is not signed in
- "Not authorized" - User doesn't have permission
- "Issue not found" - Invalid issue ID
- "Failed to fetch..." - GitHub API error

