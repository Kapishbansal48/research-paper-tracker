import React from "react";
import { DOMAINS, READING_STAGES, IMPACT_SCORES, DATE_RANGES } from "../constants.js";

function toggle(list, value) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function CheckGroup({ title, options, selected, onChange }) {
  return (
    <div>
      <h4 className="font-mono text-[11px] uppercase tracking-wider text-ink-500 mb-2">
        {title}
      </h4>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(toggle(selected, opt))}
              className={`text-xs px-2.5 py-1.5 rounded-sm border transition-colors ${
                active
                  ? "bg-ink-800 border-ink-800 text-paper"
                  : "bg-paper-card border-paper-line text-ink-700 hover:border-ink-300"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function FilterPanel({ filters, setFilters, resultCount }) {
  const hasActive =
    filters.stage.length || filters.domain.length || filters.impact.length ||
    filters.dateRange !== "All Time";

  return (
    <div className="bg-paper-card border border-paper-line rounded-sm p-5 space-y-5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-widest text-brass">
          Filters
        </span>
        {hasActive && (
          <button
            type="button"
            onClick={() =>
              setFilters({ stage: [], domain: [], impact: [], dateRange: "All Time" })
            }
            className="text-xs text-ink-500 hover:text-rust underline underline-offset-2"
          >
            Clear all
          </button>
        )}
      </div>

      <CheckGroup
        title="Reading Stage"
        options={READING_STAGES}
        selected={filters.stage}
        onChange={(v) => setFilters((f) => ({ ...f, stage: v }))}
      />
      <CheckGroup
        title="Research Domain"
        options={DOMAINS}
        selected={filters.domain}
        onChange={(v) => setFilters((f) => ({ ...f, domain: v }))}
      />
      <CheckGroup
        title="Impact Score"
        options={IMPACT_SCORES}
        selected={filters.impact}
        onChange={(v) => setFilters((f) => ({ ...f, impact: v }))}
      />

      <div>
        <h4 className="font-mono text-[11px] uppercase tracking-wider text-ink-500 mb-2">
          Date Added
        </h4>
        <select
          className="w-full text-sm rounded-sm border border-paper-line bg-paper px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-brass/40 focus:border-brass"
          value={filters.dateRange}
          onChange={(e) => setFilters((f) => ({ ...f, dateRange: e.target.value }))}
        >
          {DATE_RANGES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      <p className="text-xs text-ink-300 border-t border-paper-line pt-3">
        {resultCount} {resultCount === 1 ? "paper" : "papers"} match
      </p>
    </div>
  );
}
