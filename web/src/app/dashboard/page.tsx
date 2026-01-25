"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { 
  Users, Stethoscope, Brain, ClipboardCheck, ArrowRight, 
  Heart, Wind, ClipboardList, Sparkles, Quote, ShoppingBag, Mail
} from "lucide-react";

const QUOTES = [
  { text: "Every child is gifted. They just unwrap their packages at different times.", author: "Unknown" },
  { text: "Different, not less.", author: "Temple Grandin" },
  { text: "Autism is not a tragedy. Ignorance is the tragedy.", author: "Kerry Magro" },
  { text: "The way we talk to our children becomes their inner voice.", author: "Peggy O'Mara" },
  { text: "In a world where you can be anything, be kind.", author: "Jennifer Dukes Lee" },
  { text: "The only disability in life is a bad attitude.", author: "Scott Hamilton" },
  { text: "Your child is not broken. They just see the world differently.", author: "Unknown" },
  { text: "Progress, not perfection.", author: "Unknown" },
  { text: "Embrace the unique spark in every child.", author: "Unknown" },
  { text: "Small steps lead to big changes.", author: "Unknown" },
  { text: "You are your child's best advocate.", author: "Unknown" },
  { text: "Neurodiversity is a strength, not a weakness.", author: "Unknown" },
  { text: "Patience and love can move mountains.", author: "Unknown" },
  { text: "Celebrate every milestone, no matter how small.", author: "Unknown" },
  { text: "Your love is their greatest therapy.", author: "Unknown" },
];

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  const [notifications, setNotifications] = useState({ unreadConnectionRequests: 0, unreadMessages: 0, totalUnread: 0 });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      const fetchNotifications = async () => {
        try {
          const res = await fetch("/api/notifications");
          if (res.ok) {
            const data = await res.json();
            setNotifications(data);
          }
        } catch (error) {
          console.error("Error fetching notifications:", error);
        }
      };
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [status]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <div className="text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
          <p className="mt-4 text-[var(--muted)]">Loading your dashboard...</p>
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
      description: "Connect with parents who understand your journey.",
      href: "/community",
      icon: <Users className="w-7 h-7" />,
      gradient: "from-emerald-500 to-teal-500",
      shadowColor: "shadow-emerald-500/20",
    },
    {
      id: "providers",
      title: "Find Care",
      description: "Locate verified specialists in neurodiverse care.",
      href: "/providers",
      icon: <Stethoscope className="w-7 h-7" />,
      gradient: "from-rose-500 to-pink-500",
      shadowColor: "shadow-rose-500/20",
    },
    {
      id: "ai-support",
      title: "AI Companion",
      description: "24/7 guidance, resources, and quick answers.",
      href: "/ai-support",
      icon: <Brain className="w-7 h-7" />,
      gradient: "from-purple-500 to-violet-500",
      shadowColor: "shadow-purple-500/20",
    },
    {
      id: "screening",
      title: "M-CHAT Screening",
      description: "Validated developmental milestone assessment.",
      href: "/screening",
      icon: <ClipboardCheck className="w-7 h-7" />,
      gradient: "from-blue-500 to-cyan-500",
      shadowColor: "shadow-blue-500/20",
    },
  ];

  const supportTools = [
    { href: "/calm", icon: Wind, label: "Breathe & Calm", color: "text-emerald-500 bg-emerald-500/10" },
    { href: "/screening", icon: ClipboardCheck, label: "Screening", color: "text-blue-500 bg-blue-500/10" },
    { href: "/therapy-log", icon: ClipboardList, label: "Therapy Log", color: "text-purple-500 bg-purple-500/10" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--background)] via-[var(--surface)] to-[var(--background)]">
      {/* Hero Header */}
      <div className="relative overflow-hidden pt-8 pb-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-teal-500/10 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4" />
              Your Safe Space
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[var(--text)] tracking-tight mb-4">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">{session?.user?.name || "Friend"}</span>
            </h1>
            <p className="text-lg text-[var(--muted)] max-w-2xl mx-auto">
              Your journey matters. Explore resources, connect with community, or find support today.
            </p>
          </div>

          {/* Inspirational Quote Card - Compact */}
          <div className="max-w-xl mx-auto mb-10">
            <div className="relative bg-[var(--surface)] rounded-2xl border border-[var(--border)] px-6 py-5 shadow-md">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/20">
                  <Quote className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base font-medium text-[var(--text)] leading-relaxed italic">
                    "{quote.text}"
                  </p>
                  <p className="mt-2 text-xs text-[var(--muted)] font-semibold">
                    — {quote.author}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Modules Grid - 3D Cards */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-12">
            {modules.map((module) => (
              <Link key={module.id} href={module.href} className="group">
                <div className={`relative h-full rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-6 shadow-lg ${module.shadowColor} transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:border-transparent overflow-hidden`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${module.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                  
                  <div className={`relative z-10 w-14 h-14 rounded-2xl bg-gradient-to-br ${module.gradient} text-white flex items-center justify-center shadow-lg ${module.shadowColor} mb-5 group-hover:scale-110 transition-transform duration-300`}>
                    {module.icon}
                  </div>
                  
                  <h3 className="relative z-10 text-xl font-bold text-[var(--text)] mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-emerald-500 group-hover:to-teal-500 transition-all">
                    {module.title}
                  </h3>
                  <p className="relative z-10 text-sm text-[var(--muted)] leading-relaxed mb-4">
                    {module.description}
                  </p>
                  
                  <div className="relative z-10 flex items-center text-sm font-semibold text-[var(--primary)] group-hover:gap-2 transition-all">
                    <span>Explore</span>
                    <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Premium Messages Card - Full Width */}
          <Link href="/messages" className="group block mb-6">
            <div className="relative rounded-3xl border border-[var(--border)] p-8 sm:p-10 shadow-xl bg-gradient-to-br from-[var(--surface)] via-indigo-50/50 to-violet-50/50 dark:via-indigo-950/20 dark:to-violet-950/20 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 hover:border-indigo-300/50 dark:hover:border-indigo-500/30">
              {/* Animated background glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-violet-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/10 to-violet-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:scale-110 transition-transform duration-700"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-500/10 to-indigo-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 group-hover:scale-110 transition-transform duration-700"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-8">
                {/* Icon Section */}
                <div className="relative flex-shrink-0">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/30 group-hover:scale-110 group-hover:shadow-indigo-500/50 transition-all duration-500">
                    <Mail className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                  </div>
                  {/* Notification Badge */}
                  {notifications.totalUnread > 0 && (
                    <div className="absolute -top-2 -right-2 min-w-[28px] h-7 px-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white text-sm font-bold flex items-center justify-center shadow-lg shadow-rose-500/40 animate-pulse">
                      {notifications.totalUnread > 99 ? "99+" : notifications.totalUnread}
                    </div>
                  )}
                  {/* Decorative ring */}
                  <div className="absolute inset-0 w-20 h-20 sm:w-24 sm:h-24 rounded-3xl border-2 border-indigo-400/30 animate-ping opacity-20"></div>
                </div>
                
                {/* Content Section */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 dark:from-indigo-400 dark:via-violet-400 dark:to-purple-400">
                      Messages
                    </h2>
                    {notifications.totalUnread > 0 && (
                      <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
                        {notifications.unreadConnectionRequests > 0 && `${notifications.unreadConnectionRequests} request${notifications.unreadConnectionRequests > 1 ? 's' : ''}`}
                        {notifications.unreadConnectionRequests > 0 && notifications.unreadMessages > 0 && ' • '}
                        {notifications.unreadMessages > 0 && `${notifications.unreadMessages} new`}
                      </span>
                    )}
                  </div>
                  <p className="text-[var(--muted)] text-base sm:text-lg leading-relaxed max-w-xl">
                    Connect with other parents through private, secure conversations. Share experiences, offer support, and build meaningful connections within our community.
                  </p>
                </div>
                
                {/* CTA Section */}
                <div className="flex-shrink-0">
                  <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 text-white font-bold shadow-xl shadow-indigo-500/25 group-hover:shadow-indigo-500/50 group-hover:scale-105 transition-all duration-300">
                    <span>Open Messages</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Support Tools & Marketplace - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Support Tools */}
            <div className="bg-[var(--surface)] rounded-3xl border border-[var(--border)] p-6 sm:p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[var(--text)]">Support Tools</h2>
                  <p className="text-sm text-[var(--muted)]">Free wellness resources</p>
                </div>
              </div>
              
              <div className="flex flex-col gap-3">
                {supportTools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <Link key={tool.href} href={tool.href} className="group">
                      <div className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--surface2)] border border-transparent hover:border-[var(--primary)]/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                        <div className={`w-12 h-12 rounded-xl ${tool.color} flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-semibold text-[var(--text)]">{tool.label}</span>
                        <ArrowRight className="w-4 h-4 ml-auto text-[var(--muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right: Marketplace */}
            <div className="bg-gradient-to-br from-[var(--surface)] to-amber-50/30 dark:to-amber-950/10 rounded-3xl border border-[var(--border)] p-6 sm:p-8 shadow-lg flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <ShoppingBag className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[var(--text)]">Marketplace</h2>
                  <p className="text-sm text-[var(--muted)]">Curated products for your family</p>
                </div>
              </div>
              
              <p className="text-[var(--muted)] mb-6 leading-relaxed flex-1">
                Discover 150+ carefully selected items including sensory toys, weighted blankets, communication tools, adaptive clothing, and more. All products available via Amazon for easy purchasing.
              </p>
              
              <Link href="/marketplace" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:-translate-y-0.5 transition-all">
                Browse Collection
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Disclaimer */}
      <footer className="border-t border-[var(--border)] bg-[var(--surface)] py-8">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <p className="text-[9px] text-[var(--muted)] opacity-50 leading-relaxed max-w-3xl mx-auto">
            NeuroKid provides general information and resources for educational purposes only. Content is not a substitute for professional medical advice, diagnosis, or treatment. Always consult qualified healthcare providers with questions about medical conditions.
          </p>
          <p className="mt-2 text-[9px] text-[var(--muted)] opacity-30">
            © 2026 NeuroKid
          </p>
        </div>
      </footer>
    </div>
  );
}
