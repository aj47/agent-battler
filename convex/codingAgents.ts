import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Get all active coding agents
 */
export const getAllCodingAgents = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("codingAgents")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

/**
 * Get coding agent by ID
 */
export const getCodingAgentById = query({
  args: { agentId: v.id("codingAgents") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.agentId);
  },
});

/**
 * Get coding agent by name
 */
export const getCodingAgentByName = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("codingAgents")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();
  },
});

/**
 * Create a new coding agent (admin function)
 */
export const createCodingAgent = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    website: v.optional(v.string()),
    logo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if agent already exists
    const existing = await ctx.db
      .query("codingAgents")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();

    if (existing) {
      throw new Error("Coding agent with this name already exists");
    }

    const agentId = await ctx.db.insert("codingAgents", {
      name: args.name,
      description: args.description,
      website: args.website,
      logo: args.logo,
      isActive: true,
      createdAt: Date.now(),
    });

    return agentId;
  },
});

/**
 * Get statistics for each coding agent
 */
export const getCodingAgentStats = query({
  args: {},
  handler: async (ctx) => {
    const agents = await ctx.db
      .query("codingAgents")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const stats = await Promise.all(
      agents.map(async (agent) => {
        // Get all PRs using this agent
        const prs = await ctx.db
          .query("pullRequests")
          .withIndex("by_coding_agent", (q) => q.eq("codingAgentId", agent._id))
          .collect();

        // Calculate success metrics
        const approvedPRs = prs.filter((pr) => pr.status === "approved");
        const mergedPRs = prs.filter((pr) => pr.status === "merged");
        const rejectedPRs = prs.filter((pr) => pr.status === "rejected");

        // Calculate total bounties won
        const wonBounties = await Promise.all(
          mergedPRs.map(async (pr) => {
            const transaction = await ctx.db
              .query("bountyTransactions")
              .withIndex("by_issue", (q) => q.eq("issueId", pr.issueId))
              .filter((q) => 
                q.and(
                  q.eq(q.field("pullRequestId"), pr._id),
                  q.eq(q.field("status"), "completed")
                )
              )
              .first();
            return transaction?.amount || 0;
          })
        );

        const totalBountiesWon = wonBounties.reduce((sum, amount) => sum + amount, 0);

        return {
          agent,
          stats: {
            totalPRs: prs.length,
            approvedPRs: approvedPRs.length,
            mergedPRs: mergedPRs.length,
            rejectedPRs: rejectedPRs.length,
            successRate: prs.length > 0 
              ? ((mergedPRs.length / prs.length) * 100).toFixed(1)
              : "0.0",
            totalBountiesWon,
          },
        };
      })
    );

    return stats.sort((a, b) => b.stats.totalPRs - a.stats.totalPRs);
  },
});

/**
 * Seed initial coding agents
 */
export const seedCodingAgents = mutation({
  args: {},
  handler: async (ctx) => {
    const agents = [
      {
        name: "Augment",
        description: "AI-powered code completion and generation",
        website: "https://augmentcode.com",
      },
      {
        name: "Cursor",
        description: "AI-first code editor",
        website: "https://cursor.sh",
      },
      {
        name: "OpenAI Codex",
        description: "OpenAI's code generation model",
        website: "https://openai.com/blog/openai-codex",
      },
      {
        name: "GitHub Copilot",
        description: "Your AI pair programmer",
        website: "https://github.com/features/copilot",
      },
      {
        name: "Codeium",
        description: "Free AI-powered code completion",
        website: "https://codeium.com",
      },
      {
        name: "Tabnine",
        description: "AI assistant for software developers",
        website: "https://www.tabnine.com",
      },
      {
        name: "Amazon CodeWhisperer",
        description: "AI coding companion",
        website: "https://aws.amazon.com/codewhisperer",
      },
      {
        name: "Replit AI",
        description: "AI-powered coding in the browser",
        website: "https://replit.com",
      },
      {
        name: "Claude",
        description: "Anthropic's AI assistant",
        website: "https://claude.ai",
      },
      {
        name: "ChatGPT",
        description: "OpenAI's conversational AI",
        website: "https://chat.openai.com",
      },
      {
        name: "Other",
        description: "Other AI coding tools",
      },
    ];

    const createdAgents = [];
    for (const agent of agents) {
      // Check if already exists
      const existing = await ctx.db
        .query("codingAgents")
        .withIndex("by_name", (q) => q.eq("name", agent.name))
        .first();

      if (!existing) {
        const agentId = await ctx.db.insert("codingAgents", {
          ...agent,
          isActive: true,
          createdAt: Date.now(),
        });
        createdAgents.push(agentId);
      }
    }

    return { created: createdAgents.length };
  },
});

