"use client";

import { useState, useMemo, useEffect } from "react";

type Resource = {
  id: string;
  title: string;
  category: string;
  content: string | null;
  link: string | null;
  views: number;
  createdAt: string;
};

const CATEGORY_OPTIONS = [
  { label: "All Resources", value: "ALL" },
  { label: "Education", value: "EDUCATION" },
  { label: "Therapy", value: "THERAPY" },
  { label: "Nutrition", value: "NUTRITION" },
  { label: "Behavior", value: "BEHAVIOR" },
  { label: "Sleep", value: "SLEEP" },
  { label: "Social Skills", value: "SOCIAL_SKILLS" },
  { label: "Legal", value: "LEGAL" },
  { label: "Financial", value: "FINANCIAL" },
  { label: "Community", value: "COMMUNITY" },
  { label: "Other", value: "OTHER" },
];

const CATEGORY_COLORS: Record<string, string> = {
  EDUCATION: "bg-blue-100 text-blue-700",
  THERAPY: "bg-purple-100 text-purple-700",
  NUTRITION: "bg-green-100 text-green-700",
  BEHAVIOR: "bg-orange-100 text-orange-700",
  SLEEP: "bg-indigo-100 text-indigo-700",
  SOCIAL_SKILLS: "bg-pink-100 text-pink-700",
  LEGAL: "bg-red-100 text-red-700",
  FINANCIAL: "bg-yellow-100 text-yellow-700",
  COMMUNITY: "bg-teal-100 text-teal-700",
  OTHER: "bg-gray-100 text-gray-700",
};

export default function ResourcesPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await fetch("/api/resources");
        const data = await response.json();
        setResources(data);
      } catch (error) {
        console.error("Error fetching resources:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, []);

  const filtered = useMemo(() => {
    return resources.filter((r) => {
      if (category !== "ALL" && r.category !== category) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          r.title.toLowerCase().includes(q) ||
          (r.content && r.content.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [search, category, resources]);

  return (
    <div className="min-h-screen pt-20 pb-6 sm:pt-24 sm:pb-12">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Resources</h1>
          <p className="mt-2 text-base sm:text-lg text-gray-600">
            Discover educational materials, support networks, and tools to support your neurodivergent journey.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 grid gap-4 grid-cols-1 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search resources..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[44px]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[44px]"
            >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Count */}
      <p className="mb-4 text-sm text-gray-600">
        Showing {filtered.length} of {resources.length} resources
      </p>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="text-gray-600">Loading resources...</div>
        </div>
      )}

      {/* Resource Grid */}
      {!loading && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((resource) => (
            <a
              key={resource.id}
              href={resource.link || "#"}
              target={resource.link ? "_blank" : undefined}
              rel={resource.link ? "noopener noreferrer" : undefined}
              className="group rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-700">
                    {resource.title}
                  </h3>
                  <p
                    className={`mt-1 inline-block rounded-full px-2 py-1 text-xs font-medium ${
                      CATEGORY_COLORS[resource.category] || "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {resource.category.replace(/_/g, " ")}
                  </p>
                </div>
                {resource.link && (
                  <svg
                    className="h-5 w-5 text-gray-400 group-hover:text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                )}
              </div>
              <p className="mt-3 text-sm text-gray-600">
                {resource.content || "No description available"}
              </p>
            </a>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">
          <p className="text-gray-600">No resources match your search.</p>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-8 rounded-lg bg-blue-50 p-4 border border-blue-200">
        <p className="font-semibold text-blue-900">Information Disclaimer</p>
        <p className="mt-1 text-sm text-blue-800">
          NeuroKind provides these resources for informational purposes only. We
          do not endorse any particular organization or tool, nor do we provide
          medical advice. Please consult with qualified professionals for
          personalized guidance.
        </p>
      </div>
      </div>
    </div>
  );
}
