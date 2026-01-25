"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  Plus, 
  Calendar, 
  Star,
  Smile, 
  Trash2, 
  X,
  Sparkles,
  ChevronDown,
  Tag
} from "lucide-react";

interface DailyWin {
  id: string;
  date: string;
  content: string;
  mood: number | null;
  category: string | null;
  createdAt: string;
}

const MOODS = [
  { value: 1, emoji: "😢", label: "Tough Day" },
  { value: 2, emoji: "😕", label: "Challenging" },
  { value: 3, emoji: "😐", label: "Okay" },
  { value: 4, emoji: "🙂", label: "Good" },
  { value: 5, emoji: "😊", label: "Amazing!" },
];

const CATEGORIES = [
  { value: "therapy", label: "Therapy Progress", color: "bg-purple-500" },
  { value: "school", label: "School Success", color: "bg-blue-500" },
  { value: "social", label: "Social Win", color: "bg-pink-500" },
  { value: "communication", label: "Communication", color: "bg-teal-500" },
  { value: "behavior", label: "Behavior", color: "bg-amber-500" },
  { value: "daily-life", label: "Daily Life", color: "bg-emerald-500" },
  { value: "milestone", label: "Milestone", color: "bg-orange-500" },
  { value: "other", label: "Other", color: "bg-gray-500" },
];

export default function DailyWinsPage() {
  const router = useRouter();
  const { status } = useSession();
  const [wins, setWins] = useState<DailyWin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    content: "",
    mood: 4,
    category: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/daily-wins");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchWins();
    }
  }, [status]);

  const fetchWins = async () => {
    try {
      const res = await fetch("/api/daily-wins");
      if (res.ok) {
        const data = await res.json();
        setWins(data.wins);
      }
    } catch (error) {
      console.error("Error fetching wins:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.content.trim()) return;
    
    setSaving(true);

    try {
      const res = await fetch("/api/daily-wins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        await fetchWins();
        setShowForm(false);
        setForm({
          date: new Date().toISOString().split("T")[0],
          content: "",
          mood: 4,
          category: "",
        });
      }
    } catch (error) {
      console.error("Error creating win:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this win?")) return;

    try {
      const res = await fetch(`/api/daily-wins/${id}`, { method: "DELETE" });
      if (res.ok) {
        setWins(wins.filter((w) => w.id !== id));
      }
    } catch (error) {
      console.error("Error deleting win:", error);
    }
  };

  const getMoodInfo = (mood: number | null) => {
    return MOODS.find((m) => m.value === mood) || MOODS[3];
  };

  const getCategoryInfo = (category: string | null) => {
    return CATEGORIES.find((c) => c.value === category) || null;
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--background)]">
        <div className="w-12 h-12 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pt-16">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-sm font-semibold mb-2">
              <Sparkles className="w-4 h-4" />
              Celebrate Progress
            </div>
            <h1 className="text-3xl font-bold text-[var(--text)]">What Worked Today</h1>
            <p className="text-[var(--muted)] mt-1">Capture the wins, big and small</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:-translate-y-0.5 transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Win
          </button>
        </div>

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-2xl">
              <div className="sticky top-0 flex items-center justify-between p-5 border-b border-[var(--border)] bg-[var(--surface)]">
                <h2 className="text-xl font-bold text-[var(--text)]">Log a Win</h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-2 rounded-lg hover:bg-[var(--surface2)] text-[var(--muted)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[var(--text)] mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Date
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-[var(--surface2)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text)] mb-2">
                    <Smile className="w-4 h-4 inline mr-2" />
                    How was your day?
                  </label>
                  <div className="flex justify-between gap-2">
                    {MOODS.map((mood) => (
                      <button
                        key={mood.value}
                        type="button"
                        onClick={() => setForm({ ...form, mood: mood.value })}
                        className={`flex-1 py-3 rounded-xl text-2xl transition-all ${
                          form.mood === mood.value
                            ? "bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg scale-105"
                            : "bg-[var(--surface2)] hover:bg-[var(--surface2)]/80"
                        }`}
                        title={mood.label}
                      >
                        {mood.emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text)] mb-2">
                    <Tag className="w-4 h-4 inline mr-2" />
                    Category (optional)
                  </label>
                  <div className="relative">
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[var(--surface2)] border border-[var(--border)] text-[var(--text)] appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="">Select a category...</option>
                      {CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)] pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text)] mb-2">
                    <Star className="w-4 h-4 inline mr-2" />
                    What worked today?
                  </label>
                  <textarea
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    required
                    rows={4}
                    maxLength={2000}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--surface2)] border border-[var(--border)] text-[var(--text)] resize-none focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Today we celebrated when... A small win was... I'm proud that..."
                  />
                  <p className="text-xs text-[var(--muted)] mt-1 text-right">
                    {form.content.length}/2000
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 px-5 py-3 rounded-xl bg-[var(--surface2)] text-[var(--text)] font-medium hover:bg-[var(--surface2)]/80 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving || !form.content.trim()}
                    className="flex-1 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 disabled:opacity-50 transition-all"
                  >
                    {saving ? "Saving..." : "Save Win"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {wins.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-amber-500" />
            </div>
            <h3 className="text-xl font-bold text-[var(--text)] mb-2">No wins logged yet</h3>
            <p className="text-[var(--muted)] mb-6">Start celebrating your daily victories</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all"
            >
              <Plus className="w-5 h-5" />
              Log Your First Win
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {wins.map((win) => {
              const moodInfo = getMoodInfo(win.mood);
              const categoryInfo = getCategoryInfo(win.category);
              const date = new Date(win.date);

              return (
                <div
                  key={win.id}
                  className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-5 shadow-premium hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-xl">
                        {moodInfo.emoji}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-[var(--text)]">
                            {date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                          </span>
                          {categoryInfo && (
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium text-white ${categoryInfo.color}`}>
                              {categoryInfo.label}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-[var(--muted)]">{moodInfo.label}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(win.id)}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--muted)] hover:text-red-500 transition-colors"
                      title="Delete win"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="pl-16">
                    <p className="text-[var(--text)] whitespace-pre-wrap">{win.content}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-10 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-200 dark:border-amber-900/20 p-5">
          <p className="text-sm text-amber-800 dark:text-amber-200/80 text-center">
            <strong>Tip:</strong> Celebrating small wins builds resilience and helps you see progress over time. Every step forward counts!
          </p>
        </div>
      </div>
    </div>
  );
}
