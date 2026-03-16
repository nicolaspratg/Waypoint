"use client";

import Link from "next/link";
import { useAuth, SignInButton, UserButton } from "@clerk/nextjs";

export function NavAuth() {
  const { isSignedIn } = useAuth();

  return (
    <div className="flex items-center gap-4">
      {isSignedIn ? (
        <>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-gray-700 hover:text-black transition-colors"
          >
            Dashboard
          </Link>
          <UserButton />
        </>
      ) : (
        <>
          <SignInButton mode="modal">
            <button className="text-sm font-medium text-gray-700 hover:text-black transition-colors">
              Sign in
            </button>
          </SignInButton>
          <SignInButton mode="modal">
            <button className="bg-black text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
              Get started
            </button>
          </SignInButton>
        </>
      )}
    </div>
  );
}

export function HeroCTA() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return (
      <Link
        href="/dashboard"
        className="bg-black text-white font-semibold px-8 py-3 rounded-xl text-base hover:bg-gray-800 transition-colors"
      >
        Go to dashboard
      </Link>
    );
  }

  return (
    <SignInButton mode="modal">
      <button className="bg-black text-white font-semibold px-8 py-3 rounded-xl text-base hover:bg-gray-800 transition-colors">
        Start planning for free
      </button>
    </SignInButton>
  );
}
