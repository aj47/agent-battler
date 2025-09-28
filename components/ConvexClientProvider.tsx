"use client";

import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  // Use the Convex deployment URL with .site domain for OAuth storage namespace
  // This ensures localStorage keys match the OAuth callback domain
  const storageNamespace = process.env.NEXT_PUBLIC_CONVEX_URL!.replace('.cloud', '.site');

  return (
    <ConvexAuthProvider
      client={convex}
      storageNamespace={storageNamespace}
    >
      {children}
    </ConvexAuthProvider>
  );
}

