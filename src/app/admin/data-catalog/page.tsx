"use client";

import { useState, useEffect } from "react";
import { Search, Database, Shield, Tag, User } from "lucide-react";
import Link from "next/link";

interface Dataset {
  id: string;
  name: string;
  description: string;
  domain: string;
  ownerTeam: string;
  sensitivity: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  _count: {
    fields: number;
    glossaryTerms: number;
  };
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const SENSITIVITY_COLORS = {
  PUBLIC: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  INTERNAL: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  SENSITIVE: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  PII: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
  PHI: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
};

const DOMAIN_OPTIONS = [
  "community",
  "auth",
  "screening",
  "providers",
  "ai",
  "resources",
  "moderation",
  "analytics",
];

export default function DataCatalogPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [domainFilter, setDomainFilter] = useState("");
  const [sensitivityFilter, setSensitivityFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchDatasets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, domainFilter, sensitivityFilter, currentPage]);

  const fetchDatasets = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      if (domainFilter) params.set("domain", domainFilter);
      if (sensitivityFilter) params.set("sensitivity", sensitivityFilter);
      params.set("page", currentPage.toString());

      const response = await fetch(`/api/admin/catalog?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch datasets");
      }

      const data = await response.json();
      setDatasets(data.datasets);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleDomainFilter = (value: string) => {
    setDomainFilter(value);
    setCurrentPage(1);
  };

  const handleSensitivityFilter = (value: string) => {
    setSensitivityFilter(value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setDomainFilter("");
    setSensitivityFilter("");
    setCurrentPage(1);
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Data Catalog
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Discover and explore enterprise datasets with comprehensive metadata
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Search */}
            <div className="lg:col-span-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search datasets by name, description, or tags..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Domain Filter */}
            <div className="lg:col-span-3">
              <select
                value={domainFilter}
                onChange={(e) => handleDomainFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Domains</option>
                {DOMAIN_OPTIONS.map((domain) => (
                  <option key={domain} value={domain}>
                    {domain.charAt(0).toUpperCase() + domain.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Sensitivity Filter */}
            <div className="lg:col-span-3">
              <select
                value={sensitivityFilter}
                onChange={(e) => handleSensitivityFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Sensitivity Levels</option>
                <option value="PUBLIC">Public</option>
                <option value="INTERNAL">Internal</option>
                <option value="SENSITIVE">Sensitive</option>
                <option value="PII">PII</option>
                <option value="PHI">PHI</option>
              </select>
            </div>
          </div>

          {/* Active Filters */}
          {(searchQuery || domainFilter || sensitivityFilter) && (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded-full text-sm">
                  Search: {searchQuery}
                </span>
              )}
              {domainFilter && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded-full text-sm">
                  Domain: {domainFilter}
                </span>
              )}
              {sensitivityFilter && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded-full text-sm">
                  Sensitivity: {sensitivityFilter}
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Datasets List */}
        {!loading && datasets.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No datasets found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery || domainFilter || sensitivityFilter
                ? "Try adjusting your filters"
                : "Start by adding your first dataset"}
            </p>
          </div>
        )}

        {!loading && datasets.length > 0 && (
          <>
            {/* Results Count */}
            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Showing {datasets.length} of {pagination?.total} datasets
            </div>

            {/* Datasets Grid */}
            <div className="grid grid-cols-1 gap-4 mb-6">
              {datasets.map((dataset) => (
                <Link
                  key={dataset.id}
                  href={`/admin/data-catalog/${dataset.id}`}
                  className="block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {dataset.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                        {dataset.description}
                      </p>
                    </div>
                    <span
                      className={`ml-4 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                        SENSITIVITY_COLORS[dataset.sensitivity as keyof typeof SENSITIVITY_COLORS]
                      }`}
                    >
                      {dataset.sensitivity}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Database className="h-4 w-4" />
                      <span>{dataset.domain}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{dataset.ownerTeam}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Shield className="h-4 w-4" />
                      <span>{dataset._count.fields} fields</span>
                    </div>
                    {dataset.tags.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Tag className="h-4 w-4" />
                        <span>{dataset.tags.slice(0, 2).join(", ")}</span>
                        {dataset.tags.length > 2 && <span>+{dataset.tags.length - 2}</span>}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Page {currentPage} of {pagination.pages}
                </span>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(pagination.pages, p + 1))}
                  disabled={currentPage === pagination.pages}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
