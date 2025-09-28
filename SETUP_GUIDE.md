# Agent Battler - Complete Setup Guide

## 🎯 What You've Built

A full-stack web application where developers can:
- Post GitHub issues with bounty rewards
- Browse and solve issues using AI coding agents
- Submit PRs and track which AI agent was used
- Earn points and compete on leaderboards
- Track AI agent performance metrics

## 🏗️ Architecture

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

### Backend
- **Database & Backend**: Convex (serverless, real-time)
- **Authentication**: Convex Auth with GitHub OAuth
- **API Integration**: GitHub API via Octokit

## 📁 Project Structure

```
AgentBattler2/
├── app/                          # Next.js app directory
│   ├── auth/signin/             # Sign-in page
│   ├── dashboard/               # User dashboard
│   ├── issues/                  # Issue-related pages
│   │   ├── [id]/               # Issue detail & PR submission
│   │   ├── create/             # Create new issue
│   │   └── page.tsx            # Browse issues
│   ├── leaderboard/            # Leaderboard page
│   ├── layout.tsx              # Root layout with providers
│   └── page.tsx                # Home page
├── components/                  # React components
│   ├── Button.tsx              # Reusable button
│   ├── ConvexClientProvider.tsx # Convex provider
│   ├── IssueCard.tsx           # Issue display card
│   └── Navbar.tsx              # Navigation bar
├── convex/                      # Convex backend
│   ├── schema.ts               # Database schema
│   ├── auth.ts                 # Auth configuration
│   ├── github.ts               # GitHub API actions
│   ├── users.ts                # User management
│   ├── issues.ts               # Issue management
│   ├── pullRequests.ts         # PR management
│   ├── codingAgents.ts         # Agent tracking
│   ├── notifications.ts        # Notifications
│   └── http.ts                 # HTTP routes
└── .env.local                  # Environment variables
```

## 🚀 Setup Instructions

### 1. Prerequisites
- Node.js 18+ installed
- A GitHub account
- Git installed

### 2. Initial Setup

```bash
# The project is already initialized, but if starting fresh:
npm install

# Start Convex dev server (in one terminal)
npx convex dev

# Start Next.js dev server (in another terminal)
npm run dev
```

### 3. Configure GitHub OAuth

**IMPORTANT**: You need to set up GitHub OAuth for authentication to work.

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)

2. Click **"New OAuth App"**

3. Fill in the application details:
   - **Application name**: Agent Battler (or your preferred name)
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: Check your `.env.local` file for the `NEXT_PUBLIC_CONVEX_URL` value, then use:
     ```
     https://[your-convex-deployment].convex.site/api/auth/callback/github
     ```
     Example: `https://savory-bobcat-193.convex.site/api/auth/callback/github`

4. Click **"Register application"**

5. Copy the **Client ID**

6. Click **"Generate a new client secret"** and copy it

7. Update your `.env.local` file:
   ```env
   AUTH_GITHUB_ID=your_github_client_id_here
   AUTH_GITHUB_SECRET=your_github_client_secret_here
   ```

8. Restart both the Convex and Next.js dev servers

### 4. Seed the Database

The coding agents have already been seeded, but if you need to re-seed:

```bash
npx convex run codingAgents:seedCodingAgents
```

This creates entries for:
- Augment
- Cursor
- GitHub Copilot
- Codeium
- Tabnine
- Amazon CodeWhisperer
- Replit AI
- Claude
- ChatGPT
- Other

### 5. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## 🎮 How to Use

### For Issue Creators

1. **Sign in** with your GitHub account
2. Click **"Post Issue"** in the navigation
3. **Select a repository** from your GitHub repos
4. **Choose an issue** from that repository
5. **Set a bounty amount** and difficulty level
6. **Submit** - your issue is now live!

### For Contributors

1. **Sign in** with your GitHub account
2. **Browse issues** on the main issues page
3. **Filter** by status, difficulty, or bounty amount
4. **Click on an issue** to view details
5. **Create a PR** on GitHub to solve the issue
6. **Submit your PR** on the platform, specifying which AI agent you used
7. **Wait for approval** to earn the bounty!

### For Issue Creators (Reviewing PRs)

1. Go to your **Dashboard**
2. View your posted issues
3. Click on an issue to see submitted PRs
4. **Review and approve** the best PR
5. The bounty is automatically awarded!

## 📊 Database Schema

### Key Tables

- **users**: User profiles with GitHub info and earnings
- **issues**: Posted issues with bounties
- **pullRequests**: Submitted PRs linked to issues
- **codingAgents**: AI coding tools (Augment, Cursor, etc.)
- **bountyTransactions**: Bounty payment records
- **notifications**: User notifications
- **comments**: Issue comments
- **favorites**: Bookmarked issues

## 🔧 Key Features Implemented

### ✅ Authentication
- GitHub OAuth integration
- Automatic user profile creation
- Session management

### ✅ Issue Management
- Create issues from GitHub repos
- Set bounty amounts
- Difficulty levels (easy, medium, hard)
- Status tracking (open, in_progress, resolved, closed)
- View counts and PR counts

### ✅ PR Submission
- Link GitHub PRs to platform issues
- Specify AI coding agent used
- Status tracking (pending, approved, rejected, merged)
- Feedback and ratings

### ✅ Bounty System
- Point-based rewards
- Automatic bounty distribution
- Transaction history
- User earnings tracking

### ✅ Leaderboards
- Top contributors by earnings
- AI agent performance metrics
- Success rates and statistics

### ✅ User Dashboard
- Personal statistics
- Posted issues overview
- Submitted PRs tracking
- Earnings summary

## 🔐 Environment Variables

Your `.env.local` should contain:

```env
# Convex (auto-generated)
CONVEX_DEPLOYMENT=dev:your-deployment-name
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# GitHub OAuth (you need to add these)
AUTH_GITHUB_ID=your_github_client_id
AUTH_GITHUB_SECRET=your_github_client_secret
```

## 🐛 Troubleshooting

### "Not authenticated" errors
- Make sure you've set up GitHub OAuth correctly
- Check that AUTH_GITHUB_ID and AUTH_GITHUB_SECRET are in .env.local
- Restart both Convex and Next.js servers after adding env vars

### "Failed to fetch repositories"
- Ensure you're signed in with GitHub
- Check that your GitHub token has the necessary permissions
- Try signing out and signing in again

### Convex deployment issues
- Make sure `npx convex dev` is running
- Check that NEXT_PUBLIC_CONVEX_URL matches your Convex deployment
- Try running `npx convex dev --once` to reset

### GitHub OAuth callback errors
- Verify the callback URL in your GitHub OAuth app settings
- It should match: `https://[your-convex-url].convex.site/api/auth/callback/github`
- Make sure there are no trailing slashes

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Deploy Convex to Production

```bash
npx convex deploy
```

This will:
- Create a production deployment
- Generate new environment variables
- Update your `.env.local` with production URLs

**Important**: After deploying Convex to production:
1. Update your GitHub OAuth app callback URL to use the production Convex URL
2. Update environment variables in Vercel to use production Convex URL

## 📝 Next Steps

### Recommended Enhancements

1. **GitHub Webhook Integration**
   - Automatically update PR status when merged on GitHub
   - Sync issue status changes

2. **Enhanced PR Verification**
   - Fetch actual PR data from GitHub API
   - Verify PR references the correct issue

3. **Notifications System**
   - Email notifications for PR submissions
   - In-app notification center (already scaffolded)

4. **Advanced Filtering**
   - Filter by programming language
   - Filter by repository
   - Save filter preferences

5. **Social Features**
   - Comments on issues
   - User profiles
   - Follow other users

6. **Analytics Dashboard**
   - Detailed agent performance charts
   - Earnings over time graphs
   - Repository statistics

## 🎉 You're All Set!

Your Agent Battler platform is ready to use. Start by:
1. Setting up GitHub OAuth (if not done)
2. Signing in with your GitHub account
3. Posting your first issue or browsing existing ones

Happy coding! 🚀

