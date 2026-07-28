import React, { useEffect, useState, useCallback } from "react";
import FilterPanel from "./FilterPanel.jsx";
import { fetchPapers, deletePaper } from "../api.js";
import { DOMAIN_CODE, IMPACT_COLOR } from "../constants.js";

const emptyFilters = { stage: [], domain: [], impact: [], dateRange: "All Time" };

function PaperCard({ paper, onDelete }) {
  const code = DOMAIN_CODE[paper.domain] || "GEN";
  const callNumber = `${code}-${String(paper.id).padStart(3, "0")}`;
  return (
    <div className="bg-paper-card border border-paper-line rounded-sm p-5 relative group hover:border-ink-300 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="font-mono text-[10px] text-ink-300 tracking-widest">
            {callNumber}
          </span>
          <h3 className="font-serif text-lg font-semibold leading-snug mt-0.5">
            {paper.title}
          </h3>
          <p className="text-sm text-ink-500 mt-0.5">{paper.first_author}</p>
        </div>
        <button
          onClick={() => onDelete(paper.id)}
          title="Remove entry"
          className="opacity-0 group-hover:opacity-100 transition-opacity text-ink-300 hover:text-rust text-xs font-mono shrink-0"
        >
          remove
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
        <span className="px-2 py-1 rounded-sm bg-ink-50 text-ink-700 border border-ink-100">
          {paper.domain}
        </span>
        <span className="px-2 py-1 rounded-sm bg-ink-50 text-ink-700 border border-ink-100">
          {paper.reading_stage}
        </span>
        <span
          className="px-2 py-1 rounded-sm border font-medium"
          style={{
            color: IMPACT_COLOR[paper.impact_score],
            borderColor: IMPACT_COLOR[paper.impact_score] + "55",
            backgroundColor: IMPACT_COLOR[paper.impact_score] + "10",
          }}
        >
          {paper.impact_score}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-ink-300 font-mono">
        <span>{paper.citation_count} citations</span>
        <span>added {new Date(paper.date_added).toLocaleDateString()}</span>
      </div>
    </div>
  );
}

export default function PaperLibrary({ refreshKey, onChanged }) {
  const [filters, setFilters] = useState(emptyFilters);
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPapers(filters);
      setPapers(data);
    } catch (err) {
      setError(err.message || "Could not load papers.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  async function handleDelete(id) {
    try {
      await deletePaper(id);
      onChanged?.();
    } catch (err) {
      setError(err.message || "Could not remove that entry.");
    }
  }

  return (
    <div className="grid lg:grid-cols-[260px_1fr] gap-6">
      <aside className="lg:sticky lg:top-20 h-fit">
        <FilterPanel filters={filters} setFilters={setFilters} resultCount={papers.length} />
      </aside>

      <section>
        <div className="mb-5 flex items-baseline justify-between">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-widest text-brass">
              The Library
            </span>
            <h2 className="font-serif text-2xl font-semibold mt-1">Your paper queue</h2>
          </div>
        </div>

        {error && (
          <p className="text-rust text-sm mb-4 border-l-2 border-rust pl-3">{error}</p>
        )}

        {loading ? (
          <p className="text-ink-300 text-sm font-mono">Pulling cards…</p>
        ) : papers.length === 0 ? (
          <div className="border border-dashed border-paper-line rounded-sm p-10 text-center">
            <p className="text-ink-500 font-serif text-lg">No papers match yet.</p>
            <p className="text-ink-300 text-sm mt-1">
              Add a paper or loosen your filters to see entries here.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {papers.map((p) => (
              <PaperCard key={p.id} paper={p} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
