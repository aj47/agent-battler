# Builder Community 🔨

A platform where developers submit their projects and help each other build. Earn points by contributing to community projects and unlock exclusive rewards!

## Features

- **GitHub OAuth Authentication**: Seamless sign-in with GitHub
- **Project Submissions**: Submit your GitHub projects seeking community help
- **Contribution Tracking**: Track and verify community contributions
- **Points & Tiers System**: Earn points for verified contributions
  - PR Merged: 50 points
  - Issue Resolved: 30 points
  - Feedback Accepted: 20 points
- **Tier Progression**: Advance through Builder → Contributor → Core → Architect
- **Rewards System**: Redeem points for Discord roles, shoutouts, and stream features
- **Leaderboard**: Track top contributors by week, month, or all-time
- **Real-time Updates**: Built with Convex for real-time data synchronization

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Convex (serverless backend with real-time database)
- **Authentication**: Convex Auth with GitHub OAuth
- **API Integration**: GitHub API via Octokit
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A GitHub account
- A Convex account (free tier available)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd agent-battler
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Convex**
   ```bash
   npx convex dev
   ```
   This will:
   - Create a new Convex project
   - Generate environment variables in `.env.local`
   - Start the Convex development server

4. **Configure GitHub OAuth**

   a. Go to [GitHub Developer Settings](https://github.com/settings/developers)

   b. Click "New OAuth App"

   c. Fill in the details:
      - **Application name**: Builder Community (or your preferred name)
      - **Homepage URL**: `http://localhost:3000`
      - **Authorization callback URL**: `https://your-deployment.convex.site/api/auth/callback/github`
        (Replace `your-deployment` with your actual Convex deployment URL from `.env.local`)

   d. Copy the Client ID and generate a Client Secret

   e. Add them to your `.env.local`:
      ```
      AUTH_GITHUB_ID=your_github_client_id
      AUTH_GITHUB_SECRET=your_github_client_secret
      ```

5. **Seed the rewards database**

   Open the Convex dashboard and run:
   ```bash
   npx convex run rewards:triggerSeedRewards
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── auth/              # Authentication pages
│   ├── projects/          # Project-related pages
│   ├── dashboard/         # User dashboard
│   ├── leaderboard/       # Contributor leaderboard
│   ├── rewards/           # Rewards redemption
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── Navbar.tsx         # Navigation component
│   ├── ProjectCard.tsx    # Project display card
│   ├── ContributionForm.tsx # Contribution submission form
│   ├── PointsBadge.tsx    # Points and tier display
│   ├── RewardCard.tsx     # Reward display card
│   └── CommentSection.tsx # Project discussions
├── convex/                # Convex backend
│   ├── schema.ts          # Database schema
│   ├── auth.ts            # Authentication config
│   ├── github.ts          # GitHub API integration
│   ├── users.ts           # User management
│   ├── projects.ts        # Project management
│   ├── contributions.ts   # Contribution tracking
│   ├── rewards.ts         # Rewards system
│   ├── comments.ts        # Comment system
│   └── notifications.ts   # Notification system
└── public/                # Static assets
```

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# Convex
CONVEX_DEPLOYMENT=dev:your-deployment-name
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# GitHub OAuth
AUTH_GITHUB_ID=your_github_client_id
AUTH_GITHUB_SECRET=your_github_client_secret
```

## Usage

### For Project Owners

1. Sign in with GitHub
2. Click "Submit Project"
3. Enter your GitHub repository URL
4. Describe what kind of help you need
5. Add relevant tags
6. Review and verify contributions from the community

### For Contributors

1. Sign in with GitHub
2. Browse available projects
3. Pick a project and contribute (fix issues, submit PRs, provide feedback)
4. Submit your contribution with a link to your GitHub PR/issue
5. Wait for the project owner to verify
6. Earn points and unlock rewards!

### Tier System

| Tier | Points Required |
|------|-----------------|
| Builder | 0+ |
| Contributor | 100+ |
| Core | 500+ |
| Architect | 1000+ |

### Available Rewards

- Discord Builder Role (50 pts)
- Discord Contributor Role (100 pts)
- Discord Core Role (500 pts)
- Social Media Shoutout (200 pts)
- 15-min Stream Feature (500 pts)
- Full Dedicated Stream (1000 pts)

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Deploy Convex to Production

```bash
npx convex deploy
```

Update your GitHub OAuth callback URL to use your production Convex URL.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for your own purposes.

## Support

For issues and questions, please open an issue on GitHub.
