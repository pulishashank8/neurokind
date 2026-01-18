"use client";
import { useEffect, useMemo, useState } from "react";
import providersData from "@/data/providers.json";

type ProviderType =
  | "THERAPIST"
  | "DEVELOPMENTAL_PEDIATRICS"
  | "SLP"
  | "OT"
  | "ABA"
  | "BEHAVIORAL_THERAPY";

type Provider = {
  id: string;
  name: string;
  type: ProviderType;
  city: string;
  zip: string;
  address: string;
  phone?: string;
};

const TYPE_OPTIONS: { label: string; value: ProviderType | "ALL" }[] = [
  { label: "All Types", value: "ALL" },
  { label: "Therapist", value: "THERAPIST" },
  { label: "Developmental Pediatrics", value: "DEVELOPMENTAL_PEDIATRICS" },
  { label: "Speech-Language Pathology (SLP)", value: "SLP" },
  { label: "Occupational Therapy (OT)", value: "OT" },
  { label: "Applied Behavior Analysis (ABA)", value: "ABA" },
  { label: "Behavioral Therapy", value: "BEHAVIORAL_THERAPY" },
];

function normalize(str: string) {
  return str.toLowerCase().trim();
}

export default function ProvidersPage() {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [type, setType] = useState<ProviderType | "ALL">("ALL");
  const [limit, setLimit] = useState(24);

  // Hydrate list client-side to avoid bundling large static data on server
  const [providers, setProviders] = useState<Provider[]>([]);
  useEffect(() => {
    setProviders(providersData as Provider[]);
  }, []);

  const filtered = useMemo(() => {
    const q = normalize(query);
    const c = normalize(city);
    const z = normalize(zip);
    return providers
      .filter((p) => {
        if (type !== "ALL" && p.type !== type) return false;
        if (q) {
          const hay = normalize(`${p.name} ${p.address} ${p.city} ${p.zip}`);
          if (!hay.includes(q)) return false;
        }
        if (c && normalize(p.city) !== c) return false;
        if (z && normalize(p.zip) !== z) return false;
        return true;
      })
      .slice(0, limit);
  }, [providers, query, city, zip, type, limit]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="text-2xl font-semibold tracking-tight">Provider Finder</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Search local neurodiversity-friendly providers. This directory is a
        starter dataset; verify details and availability directly with the
        provider.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="block text-sm font-medium">Search</label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name, address, keyword"
            className="mt-1 w-full rounded-md border p-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">City</label>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g., Seattle"
            className="mt-1 w-full rounded-md border p-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">ZIP</label>
          <input
            value={zip}
            onChange={(e) => setZip(e.target.value)}
            placeholder="e.g., 98101"
            className="mt-1 w-full rounded-md border p-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as ProviderType | "ALL")}
            className="mt-1 w-full rounded-md border p-2 text-sm"
          >
            {TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filtered.length} of {providers.length}
        </p>
        <div className="flex items-center gap-2">
          <button
            className="rounded-md border px-3 py-2 text-sm"
            onClick={() => setLimit((l) => Math.max(12, l - 12))}
            disabled={limit <= 12}
          >
            Show Less
          </button>
          <button
            className="rounded-md border px-3 py-2 text-sm"
            onClick={() => setLimit((l) => l + 12)}
            disabled={filtered.length < limit}
          >
            Show More
          </button>
        </div>
      </div>

      <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => (
          <li key={p.id} className="rounded-lg border p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-base font-semibold">{p.name}</h2>
                <p className="text-xs text-muted-foreground">{p.type}</p>
              </div>
            </div>
            <div className="mt-2 text-sm">
              <p>
                {p.address}, {p.city} {p.zip}
              </p>
              {p.phone && <p className="mt-1">{p.phone}</p>}
            </div>
            <div className="mt-3 flex gap-2">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${p.address}, ${p.city} ${p.zip}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md border px-3 py-2 text-xs"
              >
                View on Maps
              </a>
              <a
                href={`tel:${p.phone ?? ""}`}
                className="rounded-md border px-3 py-2 text-xs"
              >
                Call
              </a>
            </div>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="rounded-lg border p-4 text-sm text-muted-foreground">
            No providers match your filters.
          </li>
        )}
      </ul>

      <div className="mt-8 rounded-md bg-amber-50 p-4 text-sm">
        <p className="font-medium">Disclaimer</p>
        <p className="mt-1 text-amber-900">
          This directory is for general guidance only. NeuroKind does not
          endorse specific providers and does not provide medical advice. Verify
          services, credentials, availability, and insurance coverage directly
          with providers.
        </p>
      </div>
    </div>
  );
}
