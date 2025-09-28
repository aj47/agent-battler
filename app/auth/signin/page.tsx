"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { Code2, Github } from "lucide-react";
import Link from "next/link";

export default function SignInPage() {
  const { signIn } = useAuthActions();

  const handleGitHubSignIn = () => {
    void signIn("github");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center">
            <Code2 className="h-12 w-12 text-blue-600" />
            <span className="ml-2 text-3xl font-bold text-gray-900">
              Agent Battler
            </span>
          </Link>
          <p className="mt-4 text-gray-600">
            Sign in to start posting issues or submitting PRs
          </p>
        </div>

        {/* Sign In Card */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Welcome Back
          </h2>

          <button
            onClick={handleGitHubSignIn}
            className="w-full flex items-center justify-center space-x-3 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            <Github className="h-5 w-5" />
            <span>Sign in with GitHub</span>
          </button>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>
              By signing in, you agree to our{" "}
              <Link href="/terms" className="text-blue-600 hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-blue-600 hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 mb-4">What you can do:</p>
          <div className="grid grid-cols-3 gap-4 text-xs text-gray-600">
            <div>
              <div className="bg-blue-100 rounded-lg p-3 mb-2">
                💰
              </div>
              Post Issues with Bounties
            </div>
            <div>
              <div className="bg-green-100 rounded-lg p-3 mb-2">
                🚀
              </div>
              Submit PRs
            </div>
            <div>
              <div className="bg-purple-100 rounded-lg p-3 mb-2">
                🏆
              </div>
              Earn Points
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

