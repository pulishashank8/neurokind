"use client";

import { useState, useEffect } from "react";

import { ArrowLeft, User, Database, Calendar, Tag, BookOpen } from "lucide-react";
import Link from "next/link";

interface DatasetField {
  id: string;
  name: string;
  type: string;
  description: string;
  isNullable: boolean;
  sensitivity: string;
  examples: string | null;
}

interface GlossaryTerm {
  term: {
    id: string;
    name: string;
    definition: string;
    examples: string | null;
  };
}

interface DataOwner {
  teamName: string;
  contactEmail: string;
  slackChannel: string | null;
}

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
  owner: DataOwner;
  fields: DatasetField[];
  glossaryTerms: GlossaryTerm[];
  _count: {
    fields: number;
    glossaryTerms: number;
  };
}

const SENSITIVITY_COLORS = {
  PUBLIC: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  INTERNAL: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  SENSITIVE: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  PII: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
  PHI: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
};

export default function DatasetDetailPage({ params }: { readonly params: { id: string } }) {
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDataset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const fetchDataset = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/catalog/${params.id}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Dataset not found");
        }
        throw new Error("Failed to fetch dataset");
      }

      const data = await response.json();
      setDataset(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !dataset) {
    return (
      <div className="p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <p className="text-red-800 dark:text-red-400">{error || "Dataset not found"}</p>
            <Link
              href="/admin/data-catalog"
              className="mt-4 inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/data-catalog"
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to catalog
          </Link>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {dataset.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {dataset.description}
              </p>
            </div>

            <span
              className={`ml-4 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                SENSITIVITY_COLORS[dataset.sensitivity as keyof typeof SENSITIVITY_COLORS]
              }`}
            >
              {dataset.sensitivity}
            </span>
          </div>
        </div>

        {/* Metadata Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Dataset Metadata
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <Database className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Domain</p>
                <p className="text-gray-900 dark:text-white mt-1">{dataset.domain}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Owner Team</p>
                <p className="text-gray-900 dark:text-white mt-1">{dataset.owner.teamName}</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">{dataset.owner.contactEmail}</p>
                {dataset.owner.slackChannel && (
                  <p className="text-sm text-gray-500 dark:text-gray-500">#{dataset.owner.slackChannel}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Created</p>
                <p className="text-gray-900 dark:text-white mt-1">
                  {new Date(dataset.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Updated</p>
                <p className="text-gray-900 dark:text-white mt-1">
                  {new Date(dataset.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {dataset.tags.length > 0 && (
              <div className="flex items-start gap-3 md:col-span-2">
                <Tag className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {dataset.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fields Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Fields ({dataset.fields.length})
            </h2>
          </div>

          {dataset.fields.length === 0 ? (
            <div className="p-6 text-center text-gray-600 dark:text-gray-400">
              No fields defined for this dataset
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Field Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Nullable
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Sensitivity
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {dataset.fields.map((field) => (
                    <tr key={field.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-sm text-gray-900 dark:text-white">
                          {field.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {field.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {field.description}
                        </span>
                        {field.examples && (
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            e.g., {field.examples}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {field.isNullable ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            SENSITIVITY_COLORS[field.sensitivity as keyof typeof SENSITIVITY_COLORS]
                          }`}
                        >
                          {field.sensitivity}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Glossary Terms */}
        {dataset.glossaryTerms.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Related Glossary Terms ({dataset.glossaryTerms.length})
              </h2>
            </div>

            <div className="p-6 space-y-4">
              {dataset.glossaryTerms.map(({ term }) => (
                <div key={term.id} className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                    {term.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {term.definition}
                  </p>
                  {term.examples && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                      Examples: {term.examples}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
