import React, { useState, useCallback } from "react";
import AddPaperForm from "./components/AddPaperForm.jsx";
import PaperLibrary from "./components/PaperLibrary.jsx";
import Analytics from "./components/Analytics.jsx";

const TABS = [
  { id: "library", label: "Library", code: "01" },
  { id: "add", label: "Add Paper", code: "02" },
  { id: "analytics", label: "Analytics", code: "03" },
];

export default function App() {
  const [tab, setTab] = useState("library");
  const [refreshKey, setRefreshKey] = useState(0);

  const bump = useCallback(() => setRefreshKey((k) => k + 1), []);

  return (
    <div className="min-h-screen bg-paper text-ink-900">
      <header className="relative overflow-hidden border-b border-paper-line bg-ink-900 punch-holes">
        <div className="max-w-6xl mx-auto px-6 py-8 sm:py-10 relative">
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="font-mono text-xs tracking-widest text-brass-light uppercase">
              Card Catalog No. 000
            </span>
            <span className="h-px flex-1 min-w-[24px] bg-ink-700"></span>
          </div>
          <h1 className="mt-3 font-serif text-3xl sm:text-4xl font-semibold text-paper tracking-tight">
            Marginalia
          </h1>
          <p className="mt-1 text-ink-300 text-sm sm:text-base max-w-xl">
            A reading tracker for papers you've cited, half-read, and meant to
            get back to. Log the stage, the domain, the impact — keep your
            queue honest.
          </p>
        </div>
      </header>

      <nav className="sticky top-0 z-10 bg-paper/95 backdrop-blur border-b border-paper-line">
        <div className="max-w-6xl mx-auto px-6 flex gap-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`group relative px-4 sm:px-5 py-3.5 text-sm font-medium transition-colors ${
                tab === t.id
                  ? "text-ink-900"
                  : "text-ink-500 hover:text-ink-800"
              }`}
            >
              <span className="font-mono text-[10px] text-brass mr-1.5 align-top">
                {t.code}
              </span>
              {t.label}
              <span
                className={`absolute left-4 right-4 sm:left-5 sm:right-5 -bottom-px h-[2px] transition-transform origin-left ${
                  tab === t.id
                    ? "bg-brass scale-x-100"
                    : "bg-brass scale-x-0 group-hover:scale-x-50"
                }`}
              />
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8 sm:py-10">
        {tab === "library" && (
          <PaperLibrary refreshKey={refreshKey} onChanged={bump} />
        )}
        {tab === "add" && (
          <AddPaperForm
            onAdded={() => {
              bump();
              setTab("library");
            }}
          />
        )}
        {tab === "analytics" && <Analytics refreshKey={refreshKey} />}
      </main>

      <footer className="max-w-6xl mx-auto px-6 py-8 text-xs text-ink-300 font-mono">
        Marginalia — Research Paper Reading Tracker
      </footer>
    </div>
  );
}
