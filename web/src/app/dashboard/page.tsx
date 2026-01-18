"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  const modules = [
    {
      id: "community",
      title: "Community",
      description: "Connect with others, share experiences, and find support",
      href: "/community",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      emoji: "👥",
    },
    {
      id: "providers",
      title: "Healthcare Providers",
      description: "Find and connect with specialized healthcare professionals",
      href: "/providers",
      color: "from-rose-500 to-rose-600",
      bgColor: "bg-rose-50",
      emoji: "⚕️",
    },
    {
      id: "ai-support",
      title: "AI Support",
      description: "Get personalized guidance and support anytime",
      href: "/ai-support",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      emoji: "🧠",
    },
    {
      id: "screening",
      title: "Autism Screening",
      description: "Parent-friendly screening flow with a credit-score style result",
      href: "/screening",
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50",
      emoji: "🧩",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {session?.user?.name || session?.user?.email?.split("@")[0] || "Friend"}!
              </h1>
              <p className="mt-1 text-gray-500">Choose a module to get started</p>
            </div>
            <button
              onClick={() => signOut({ redirect: true, callbackUrl: "/login" })}
              className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Modules Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {modules.map((module) => (
            <Link key={module.id} href={module.href}>
              <div className="group h-full transform cursor-pointer transition-all hover:scale-105">
                <div
                  className={`flex h-full flex-col rounded-2xl border border-gray-200 ${module.bgColor} p-6 shadow-sm transition-shadow hover:shadow-lg`}
                >
                  {/* Icon */}
                  <div
                    className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${module.color}`}
                  >
                    <span className="text-2xl">{module.emoji}</span>
                  </div>

                  {/* Title */}
                  <h2 className="mb-2 text-xl font-bold text-gray-900">
                    {module.title}
                  </h2>

                  {/* Description */}
                  <p className="mb-4 flex-1 text-sm text-gray-600">
                    {module.description}
                  </p>

                  {/* CTA */}
                  <div className="inline-flex items-center text-sm font-semibold text-gray-900 transition-transform group-hover:translate-x-1">
                    Explore
                    <span className="ml-2">→</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-16 rounded-2xl border border-gray-200 bg-white p-8">
          <h3 className="mb-6 text-lg font-bold text-gray-900">
            Your NeuroKind Journey
          </h3>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">4</div>
              <p className="mt-2 text-sm text-gray-600">Available Modules</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">24/7</div>
              <p className="mt-2 text-sm text-gray-600">AI Support Available</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">∞</div>
              <p className="mt-2 text-sm text-gray-600">Community Connections</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 p-8 text-center text-white">
          <h3 className="mb-2 text-2xl font-bold">Ready to Connect?</h3>
          <p className="mb-6 opacity-90">
            Start with the Community to meet others and share your story.
          </p>
          <Link
            href="/community"
            className="inline-block rounded-lg bg-white px-6 py-3 font-semibold text-blue-600 transition-transform hover:scale-105"
          >
            Go to Community
          </Link>
        </div>
      </div>
    </div>
  );
}
