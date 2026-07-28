import React, { useState } from "react";
import { DOMAINS, READING_STAGES, IMPACT_SCORES } from "../constants.js";
import { addPaper } from "../api.js";

const today = () => new Date().toISOString().slice(0, 10);

const emptyForm = {
  title: "",
  first_author: "",
  domain: DOMAINS[0],
  reading_stage: READING_STAGES[0],
  citation_count: 0,
  impact_score: IMPACT_SCORES[3],
  date_added: today(),
};

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="block font-mono text-[11px] uppercase tracking-wider text-ink-500 mb-1.5">
        {label}
      </span>
      {children}
      {hint && <span className="block mt-1 text-xs text-ink-300">{hint}</span>}
    </label>
  );
}

const inputClass =
  "w-full rounded-sm border border-paper-line bg-paper-card px-3 py-2.5 text-ink-900 placeholder-ink-300 focus:outline-none focus:ring-2 focus:ring-brass/40 focus:border-brass transition-colors";

export default function AddPaperForm({ onAdded }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate() {
    const e = {};
    if (!form.title.trim()) e.title = "Enter the paper title.";
    if (!form.first_author.trim()) e.first_author = "Enter the first author's name.";
    if (form.citation_count === "" || Number(form.citation_count) < 0) {
      e.citation_count = "Enter a citation count of 0 or more.";
    }
    if (!form.date_added) e.date_added = "Pick the date this paper was added.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    setSubmitError(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      await addPaper({ ...form, citation_count: Number(form.citation_count) });
      setForm(emptyForm);
      onAdded?.();
    } catch (err) {
      setSubmitError(err.message || "Could not add the paper. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <span className="font-mono text-[11px] uppercase tracking-widest text-brass">
          New Entry
        </span>
        <h2 className="font-serif text-2xl font-semibold mt-1">Add a research paper</h2>
        <p className="text-ink-500 text-sm mt-1">
          Log a paper the moment you open it — you can update its reading
          stage as you make progress.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-paper-card border border-paper-line rounded-sm p-6 sm:p-8 shadow-sm relative"
      >
        <div className="absolute top-0 left-6 right-6 h-[3px] bg-brass rounded-b-sm" />

        <div className="grid sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2">
            <Field label="Paper Title">
              <input
                type="text"
                className={inputClass}
                placeholder="Attention Is All You Need"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
              />
              {errors.title && <p className="text-rust text-xs mt-1">{errors.title}</p>}
            </Field>
          </div>

          <Field label="First Author">
            <input
              type="text"
              className={inputClass}
              placeholder="A. Vaswani"
              value={form.first_author}
              onChange={(e) => update("first_author", e.target.value)}
            />
            {errors.first_author && (
              <p className="text-rust text-xs mt-1">{errors.first_author}</p>
            )}
          </Field>

          <Field label="Citation Count">
            <input
              type="number"
              min="0"
              className={inputClass}
              value={form.citation_count}
              onChange={(e) => update("citation_count", e.target.value)}
            />
            {errors.citation_count && (
              <p className="text-rust text-xs mt-1">{errors.citation_count}</p>
            )}
          </Field>

          <Field label="Research Domain">
            <select
              className={inputClass}
              value={form.domain}
              onChange={(e) => update("domain", e.target.value)}
            >
              {DOMAINS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Reading Stage">
            <select
              className={inputClass}
              value={form.reading_stage}
              onChange={(e) => update("reading_stage", e.target.value)}
            >
              {READING_STAGES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Impact Score">
            <select
              className={inputClass}
              value={form.impact_score}
              onChange={(e) => update("impact_score", e.target.value)}
            >
              {IMPACT_SCORES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Date Added">
            <input
              type="date"
              className={inputClass}
              value={form.date_added}
              onChange={(e) => update("date_added", e.target.value)}
            />
            {errors.date_added && (
              <p className="text-rust text-xs mt-1">{errors.date_added}</p>
            )}
          </Field>
        </div>

        {submitError && (
          <p className="text-rust text-sm mt-5 border-l-2 border-rust pl-3">
            {submitError}
          </p>
        )}

        <div className="mt-7 flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="bg-ink-800 hover:bg-ink-900 text-paper font-medium px-5 py-2.5 rounded-sm transition-colors disabled:opacity-50"
          >
            {submitting ? "Filing card…" : "Add to library"}
          </button>
          <button
            type="button"
            onClick={() => setForm(emptyForm)}
            className="text-ink-500 hover:text-ink-800 text-sm font-medium"
          >
            Clear form
          </button>
        </div>
      </form>
    </div>
  );
}
