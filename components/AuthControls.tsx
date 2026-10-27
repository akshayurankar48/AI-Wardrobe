"use client";

import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";

export function AuthControls() {
  return (
    <>
      <AuthLoading>
        <div aria-label="Checking sign-in status" className="h-9 w-32" />
      </AuthLoading>
      <Unauthenticated>
        <div className="flex items-center gap-3">
          <SignInButton>
            <button className="rounded-full px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800">
              Sign in
            </button>
          </SignInButton>
          <SignUpButton>
            <button className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200">
              Sign up
            </button>
          </SignUpButton>
        </div>
      </Unauthenticated>
      <Authenticated>
        <UserButton />
      </Authenticated>
    </>
  );
}
