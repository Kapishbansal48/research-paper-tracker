import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  FunnelChart,
  Funnel,
  LabelList,
  Tooltip,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { fetchAnalytics } from "../api.js";
import { IMPACT_SCORES, IMPACT_COLOR, READING_STAGES, DOMAINS } from "../constants.js";

const STAGE_COLORS = ["#1B2A4A", "#3E5079", "#5B7B6B", "#8FAE9C", "#B8863F", "#D9AE6E"];

function Panel({ eyebrow, title, children, className = "" }) {
  return (
    <div className={`bg-paper-card border border-paper-line rounded-sm p-5 sm:p-6 ${className}`}>
      <span className="font-mono text-[11px] uppercase tracking-widest text-brass">
        {eyebrow}
      </span>
      <h3 className="font-serif text-xl font-semibold mt-1 mb-4">{title}</h3>
      {children}
    </div>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-paper-card border border-paper-line rounded-sm p-5">
      <p className="font-mono text-[11px] uppercase tracking-wider text-ink-500">{label}</p>
      <p className="font-serif text-3xl font-semibold mt-1 text-ink-900">{value}</p>
      {sub && <p className="text-xs text-ink-300 mt-1">{sub}</p>}
    </div>
  );
}

export default function Analytics({ refreshKey }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchAnalytics()
      .then(setData)
      .catch((err) => setError(err.message || "Could not load analytics."))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  if (loading) {
    return <p className="text-ink-300 text-sm font-mono">Tallying the catalog…</p>;
  }
  if (error) {
    return <p className="text-rust text-sm border-l-2 border-rust pl-3">{error}</p>;
  }
  if (!data || data.total === 0) {
    return (
      <div className="border border-dashed border-paper-line rounded-sm p-10 text-center">
        <p className="text-ink-500 font-serif text-lg">Nothing to analyze yet.</p>
        <p className="text-ink-300 text-sm mt-1">
          Add a few papers and this page fills in with charts automatically.
        </p>
      </div>
    );
  }

  const funnelData = data.funnel
    .map((f, i) => ({ ...f, fill: STAGE_COLORS[i % STAGE_COLORS.length] }))
    .filter((f) => f.count > 0);

  const stackedData = data.stacked;

  return (
    <div className="space-y-6">
      <div>
        <span className="font-mono text-[11px] uppercase tracking-widest text-brass">
          Reading Analytics
        </span>
        <h2 className="font-serif text-2xl font-semibold mt-1">How the queue is moving</h2>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard label="Total Papers" value={data.total} />
        <StatCard
          label="Completion Rate"
          value={`${data.summary.completionRate}%`}
          sub="Fully Read / Total"
        />
        <StatCard
          label="Fully Read"
          value={data.funnel.find((f) => f.stage === "Fully Read")?.count ?? 0}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Panel eyebrow="Funnel" title="Papers by reading stage">
          <ResponsiveContainer width="100%" height={320}>
            <FunnelChart>
              <Tooltip
                formatter={(value, name, props) => [`${value} papers`, props.payload.stage]}
              />
              <Funnel dataKey="count" data={funnelData} nameKey="stage" isAnimationActive>
                <LabelList
                  position="right"
                  dataKey="stage"
                  fill="#1B2A4A"
                  stroke="none"
                  fontSize={12}
                />
                <LabelList
                  position="center"
                  dataKey="count"
                  fill="#FAF9F5"
                  stroke="none"
                  fontSize={13}
                  fontWeight={600}
                />
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        </Panel>

        <Panel eyebrow="Distribution" title="Citations vs. impact score">
          <ResponsiveContainer width="100%" height={320}>
            <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
              <CartesianGrid stroke="#E4E1D6" />
              <XAxis
                type="number"
                dataKey="citation_count"
                name="Citations"
                tick={{ fontSize: 11, fill: "#3E5079" }}
                label={{ value: "Citation Count", position: "insideBottom", offset: -5, fontSize: 11 }}
              />
              <YAxis
                type="category"
                dataKey="impact_score"
                name="Impact"
                width={100}
                tick={{ fontSize: 11, fill: "#3E5079" }}
                allowDuplicatedCategory={false}
              />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                formatter={(value, name) => [value, name === "citation_count" ? "Citations" : name]}
                labelFormatter={() => ""}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const p = payload[0].payload;
                  return (
                    <div className="bg-paper-card border border-paper-line px-3 py-2 text-xs rounded-sm shadow">
                      <p className="font-serif font-semibold">{p.title}</p>
                      <p className="text-ink-500 mt-0.5">
                        {p.citation_count} citations · {p.impact_score}
                      </p>
                    </div>
                  );
                }}
              />
              {IMPACT_SCORES.map((impact) => (
                <Scatter
                  key={impact}
                  name={impact}
                  data={data.scatter.filter((p) => p.impact_score === impact)}
                  fill={IMPACT_COLOR[impact]}
                />
              ))}
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </ScatterChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      <Panel eyebrow="Breakdown" title="Papers by domain and reading stage">
        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={stackedData} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
            <CartesianGrid stroke="#E4E1D6" vertical={false} />
            <XAxis dataKey="domain" tick={{ fontSize: 11, fill: "#3E5079" }} interval={0} angle={-15} textAnchor="end" height={60} />
            <YAxis tick={{ fontSize: 11, fill: "#3E5079" }} allowDecimals={false} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {READING_STAGES.map((stage, i) => (
              <Bar
                key={stage}
                dataKey={stage}
                stackId="stage"
                fill={STAGE_COLORS[i % STAGE_COLORS.length]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </Panel>

      <Panel eyebrow="Summary" title="Average citations per domain">
        <div className="grid sm:grid-cols-3 gap-3">
          {data.summary.avgCitationsPerDomain.map((d) => (
            <div
              key={d.domain}
              className="flex items-center justify-between border border-paper-line rounded-sm px-4 py-3"
            >
              <span className="text-sm text-ink-700">{d.domain}</span>
              <span className="font-mono text-sm font-semibold text-ink-900">
                {d.avgCitations}
              </span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
