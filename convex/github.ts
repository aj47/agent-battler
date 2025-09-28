import { action } from "./_generated/server";
import { v } from "convex/values";
import { Octokit } from "octokit";

/**
 * Fetch user's GitHub repositories
 */
export const fetchUserRepositories = action({
  args: {
    accessToken: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const octokit = new Octokit({ auth: args.accessToken });
      
      const { data } = await octokit.rest.repos.listForAuthenticatedUser({
        sort: "updated",
        per_page: 100,
      });

      return data.map((repo) => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        owner: repo.owner.login,
        description: repo.description,
        url: repo.html_url,
        isPrivate: repo.private,
        language: repo.language,
        stargazersCount: repo.stargazers_count,
        openIssuesCount: repo.open_issues_count,
      }));
    } catch (error: any) {
      console.error("Error fetching repositories:", error);
      throw new Error(`Failed to fetch repositories: ${error.message}`);
    }
  },
});

/**
 * Fetch issues from a specific repository
 */
export const fetchRepositoryIssues = action({
  args: {
    accessToken: v.string(),
    owner: v.string(),
    repo: v.string(),
    state: v.optional(v.union(v.literal("open"), v.literal("closed"), v.literal("all"))),
  },
  handler: async (ctx, args) => {
    try {
      const octokit = new Octokit({ auth: args.accessToken });
      
      const { data } = await octokit.rest.issues.listForRepo({
        owner: args.owner,
        repo: args.repo,
        state: args.state || "open",
        per_page: 100,
      });

      // Filter out pull requests (GitHub API returns PRs as issues)
      const issues = data.filter((issue) => !issue.pull_request);

      return issues.map((issue) => ({
        id: issue.id,
        number: issue.number,
        title: issue.title,
        body: issue.body || "",
        state: issue.state,
        url: issue.html_url,
        labels: issue.labels.map((label) => 
          typeof label === "string" ? label : label.name || ""
        ),
        createdAt: issue.created_at,
        updatedAt: issue.updated_at,
      }));
    } catch (error: any) {
      console.error("Error fetching issues:", error);
      throw new Error(`Failed to fetch issues: ${error.message}`);
    }
  },
});

/**
 * Fetch a specific issue from GitHub
 */
export const fetchIssue = action({
  args: {
    accessToken: v.string(),
    owner: v.string(),
    repo: v.string(),
    issueNumber: v.number(),
  },
  handler: async (ctx, args) => {
    try {
      const octokit = new Octokit({ auth: args.accessToken });
      
      const { data } = await octokit.rest.issues.get({
        owner: args.owner,
        repo: args.repo,
        issue_number: args.issueNumber,
      });

      return {
        id: data.id,
        number: data.number,
        title: data.title,
        body: data.body || "",
        state: data.state,
        url: data.html_url,
        labels: data.labels.map((label) => 
          typeof label === "string" ? label : label.name || ""
        ),
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error: any) {
      console.error("Error fetching issue:", error);
      throw new Error(`Failed to fetch issue: ${error.message}`);
    }
  },
});

/**
 * Fetch pull requests for a repository
 */
export const fetchRepositoryPullRequests = action({
  args: {
    accessToken: v.string(),
    owner: v.string(),
    repo: v.string(),
    state: v.optional(v.union(v.literal("open"), v.literal("closed"), v.literal("all"))),
  },
  handler: async (ctx, args) => {
    try {
      const octokit = new Octokit({ auth: args.accessToken });
      
      const { data } = await octokit.rest.pulls.list({
        owner: args.owner,
        repo: args.repo,
        state: args.state || "open",
        per_page: 100,
      });

      return data.map((pr) => ({
        id: pr.id,
        number: pr.number,
        title: pr.title,
        body: pr.body || "",
        state: pr.state,
        url: pr.html_url,
        merged: pr.merged_at !== null,
        createdAt: pr.created_at,
        updatedAt: pr.updated_at,
        mergedAt: pr.merged_at,
      }));
    } catch (error: any) {
      console.error("Error fetching pull requests:", error);
      throw new Error(`Failed to fetch pull requests: ${error.message}`);
    }
  },
});

/**
 * Fetch a specific pull request from GitHub
 */
export const fetchPullRequest = action({
  args: {
    accessToken: v.string(),
    owner: v.string(),
    repo: v.string(),
    prNumber: v.number(),
  },
  handler: async (ctx, args) => {
    try {
      const octokit = new Octokit({ auth: args.accessToken });
      
      const { data } = await octokit.rest.pulls.get({
        owner: args.owner,
        repo: args.repo,
        pull_number: args.prNumber,
      });

      return {
        id: data.id,
        number: data.number,
        title: data.title,
        body: data.body || "",
        state: data.state,
        url: data.html_url,
        merged: data.merged_at !== null,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        mergedAt: data.merged_at,
      };
    } catch (error: any) {
      console.error("Error fetching pull request:", error);
      throw new Error(`Failed to fetch pull request: ${error.message}`);
    }
  },
});

/**
 * Verify that a PR exists and is linked to an issue
 */
export const verifyPullRequest = action({
  args: {
    accessToken: v.string(),
    owner: v.string(),
    repo: v.string(),
    prNumber: v.number(),
    issueNumber: v.number(),
  },
  handler: async (ctx, args) => {
    try {
      const octokit = new Octokit({ auth: args.accessToken });
      
      // Fetch the PR
      const { data: pr } = await octokit.rest.pulls.get({
        owner: args.owner,
        repo: args.repo,
        pull_number: args.prNumber,
      });

      // Check if PR body or title mentions the issue
      const issueRef = `#${args.issueNumber}`;
      const mentionsIssue = 
        pr.body?.includes(issueRef) || 
        pr.title.includes(issueRef);

      return {
        exists: true,
        prId: pr.id,
        prNumber: pr.number,
        title: pr.title,
        state: pr.state,
        merged: pr.merged_at !== null,
        mentionsIssue,
        url: pr.html_url,
      };
    } catch (error: any) {
      console.error("Error verifying pull request:", error);
      return {
        exists: false,
        error: error.message,
      };
    }
  },
});

/**
 * Get authenticated user's GitHub profile
 */
export const fetchGitHubUser = action({
  args: {
    accessToken: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const octokit = new Octokit({ auth: args.accessToken });
      
      const { data } = await octokit.rest.users.getAuthenticated();

      return {
        id: data.id,
        login: data.login,
        name: data.name,
        email: data.email,
        avatarUrl: data.avatar_url,
        bio: data.bio,
        publicRepos: data.public_repos,
      };
    } catch (error: any) {
      console.error("Error fetching GitHub user:", error);
      throw new Error(`Failed to fetch GitHub user: ${error.message}`);
    }
  },
});

