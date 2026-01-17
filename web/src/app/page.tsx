"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const ThemeToggle = dynamic(() => import("@/components/ThemeToggle").then(mod => ({ default: mod.ThemeToggle })), {
  ssr: false,
  loading: () => <div className="w-10 h-10" />
});

export default function Home() {
  const { data: session, status } = useSession();

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-[var(--surface)] border-b border-[var(--border-light)] shadow-[var(--shadow-sm)] sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex justify-between items-center gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0 rounded-[var(--radius-md)] bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center">
                <span className="text-white font-bold text-lg sm:text-xl">N</span>
              </div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-[var(--text-primary)] m-0 truncate">NeuroKind</h1>
            </div>
            
            <div className="flex gap-2 sm:gap-3 items-center flex-shrink-0">
              <ThemeToggle />
              
              {status === "loading" ? (
                <div className="skeleton h-10 sm:h-11 w-20 sm:w-24"></div>
              ) : session ? (
                <>
                  <span className="text-[var(--text-secondary)] hidden md:inline text-sm truncate max-w-[120px] lg:max-w-none">
                    {session.user?.email}
                  </span>
                  <Link href="/settings" className="hidden sm:inline-block">
                    <Button variant="ghost" size="sm">Settings</Button>
                  </Link>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="text-xs sm:text-sm"
                  >
                    <span className="hidden sm:inline">Sign Out</span>
                    <span className="sm:hidden">Out</span>
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="text-xs sm:text-sm px-3 sm:px-4">Sign In</Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="primary" size="sm" className="text-xs sm:text-sm">
                      <span className="hidden sm:inline">Get Started</span>
                      <span className="sm:hidden">Join</span>
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[var(--primary-light)] text-[var(--primary)] px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold mb-4 sm:mb-6">
            <span className="w-2 h-2 bg-[var(--primary)] rounded-full animate-pulse"></span>
            A safe, sensory-friendly space
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--text-primary)] mb-4 sm:mb-6 leading-tight px-2 sm:px-0">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent">
              NeuroKind
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl text-[var(--text-secondary)] mb-8 sm:mb-10 leading-relaxed px-2 sm:px-0">
            A supportive community platform designed for neurodivergent individuals and their families
          </p>

          {!session && (
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12 px-4 sm:px-0">
              <Link href="/register" className="w-full sm:w-auto">
                <Button variant="primary" size="lg" className="w-full sm:w-auto">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  Sign In
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Decorative Elements */}
        <div className="relative mt-8 sm:mt-12">
          <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
            <div className="w-48 h-48 sm:w-64 sm:h-64 bg-[var(--primary)] rounded-full blur-3xl"></div>
          </div>
        </div>
      </section>

      {/* Getting Started Section (for logged-in users) */}
      {session && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <Card>
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-2">
              Welcome back! 👋
            </h2>
            <p className="text-[var(--text-secondary)] mb-6 sm:mb-8 text-sm sm:text-base">
              Here's how to get the most out of NeuroKind
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <div className="flex gap-3 sm:gap-4">
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-[var(--radius-md)] bg-[var(--primary-light)] flex items-center justify-center text-xl sm:text-2xl">
                  1️⃣
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-[var(--text-primary)] mb-1 sm:mb-2 text-sm sm:text-base">Complete Your Profile</h3>
                  <p className="text-[var(--text-secondary)] text-xs sm:text-sm mb-2">
                    Share a bit about yourself to connect with others
                  </p>
                  <Link href="/settings" className="text-[var(--primary)] hover:text-[var(--primary-hover)] text-xs sm:text-sm font-semibold">
                    Go to Settings →
                  </Link>
                </div>
              </div>
              
              <div className="flex gap-3 sm:gap-4">
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-[var(--radius-md)] bg-[var(--secondary-light)] flex items-center justify-center text-xl sm:text-2xl">
                  2️⃣
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-[var(--text-primary)] mb-1 sm:mb-2 text-sm sm:text-base">Join Discussions</h3>
                  <p className="text-[var(--text-secondary)] text-xs sm:text-sm">
                    Browse forums and share experiences with the community
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3 sm:gap-4">
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-[var(--radius-md)] bg-[var(--accent-light)] flex items-center justify-center text-xl sm:text-2xl">
                  3️⃣
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-[var(--text-primary)] mb-1 sm:mb-2 text-sm sm:text-base">Find Resources</h3>
                  <p className="text-[var(--text-secondary)] text-xs sm:text-sm">
                    Discover providers and resources to support your journey
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-[var(--info-light)] border border-[var(--border-light)] rounded-[var(--radius-md)]">
              <p className="text-[var(--text-primary)] text-sm sm:text-base break-all">
                <strong>Email:</strong> {session.user?.email}
              </p>
              {(session.user as any)?.roles && (
                <p className="text-[var(--text-primary)] mt-2 text-sm sm:text-base">
                  <strong>Roles:</strong> {(session.user as any).roles.join(", ")}
                </p>
              )}
            </div>
          </Card>
        </section>
      )}

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center mb-8 sm:mb-12 px-2 sm:px-0">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-3 sm:mb-4">
            Everything you need in one place
          </h2>
          <p className="text-base sm:text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            Thoughtfully designed features to support your neurodivergent journey
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card>
            <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">👥</div>
            <h3 className="font-bold text-[var(--text-primary)] text-lg sm:text-xl mb-2 sm:mb-3">Community</h3>
            <p className="text-[var(--text-secondary)] text-sm sm:text-base">
              Connect with others who understand your journey in a safe, moderated space
            </p>
          </Card>
          
          <Card>
            <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">🔍</div>
            <h3 className="font-bold text-[var(--text-primary)] text-lg sm:text-xl mb-2 sm:mb-3">Find Providers</h3>
            <p className="text-[var(--text-secondary)] text-sm sm:text-base">
              Search and review healthcare providers with real experiences from our community
            </p>
          </Card>
          
          <Card>
            <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">🤖</div>
            <h3 className="font-bold text-[var(--text-primary)] text-lg sm:text-xl mb-2 sm:mb-3">AI Support</h3>
            <p className="text-[var(--text-secondary)] text-sm sm:text-base">
              Chat with AI for personalized guidance and information
            </p>
          </Card>
          
          <Card>
            <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">📚</div>
            <h3 className="font-bold text-[var(--text-primary)] text-lg sm:text-xl mb-2 sm:mb-3">Resources</h3>
            <p className="text-[var(--text-secondary)] text-sm sm:text-base">
              Access curated educational content and helpful tools
            </p>
          </Card>
        </div>
      </section>

      {/* Why NeuroKind Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
          <div className="order-2 md:order-1">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4 sm:mb-6">
              Designed with sensory needs in mind
            </h2>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--success-light)] flex items-center justify-center">
                  <span className="text-[var(--success)] text-sm">✓</span>
                </div>
                <p className="text-[var(--text-secondary)] text-sm sm:text-base">
                  <strong className="text-[var(--text-primary)]">Calm colors:</strong> Muted, soothing palettes that reduce sensory overload
                </p>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--success-light)] flex items-center justify-center">
                  <span className="text-[var(--success)] text-sm">✓</span>
                </div>
                <p className="text-[var(--text-secondary)] text-sm sm:text-base">
                  <strong className="text-[var(--text-primary)]">Clean layout:</strong> Predictable structure with generous spacing
                </p>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--success-light)] flex items-center justify-center">
                  <span className="text-[var(--success)] text-sm">✓</span>
                </div>
                <p className="text-[var(--text-secondary)] text-sm sm:text-base">
                  <strong className="text-[var(--text-primary)]">Gentle animations:</strong> Subtle transitions that don't overwhelm
                </p>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--success-light)] flex items-center justify-center">
                  <span className="text-[var(--success)] text-sm">✓</span>
                </div>
                <p className="text-[var(--text-secondary)] text-sm sm:text-base">
                  <strong className="text-[var(--text-primary)]">Theme options:</strong> Choose what feels comfortable for you
                </p>
              </div>
            </div>
          </div>
          
          <Card className="bg-gradient-to-br from-[var(--primary-light)] to-[var(--accent-light)] order-1 md:order-2">
            <div className="text-center py-8 sm:py-12">
              <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">🌊</div>
              <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mb-2 sm:mb-3">
                Your comfort matters
              </h3>
              <p className="text-[var(--text-secondary)] text-sm sm:text-base max-w-sm mx-auto px-4 sm:px-0">
                Every design decision is made with neurodivergent sensory needs at the forefront
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border-light)] mt-16 sm:mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="text-center text-[var(--text-muted)] text-xs sm:text-sm">
            <p>© 2026 NeuroKind. Built with care for the neurodivergent community.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
