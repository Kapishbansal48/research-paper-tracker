const BASE = "/api";

async function handle(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed with ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export async function fetchPapers(filters = {}) {
  const params = new URLSearchParams();
  if (filters.stage?.length) params.set("stage", filters.stage.join(","));
  if (filters.domain?.length) params.set("domain", filters.domain.join(","));
  if (filters.impact?.length) params.set("impact", filters.impact.join(","));
  if (filters.dateRange && filters.dateRange !== "All Time") {
    params.set("dateRange", filters.dateRange);
  }
  const qs = params.toString();
  const res = await fetch(`${BASE}/papers${qs ? `?${qs}` : ""}`);
  return handle(res);
}

export async function addPaper(paper) {
  const res = await fetch(`${BASE}/papers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(paper),
  });
  return handle(res);
}

export async function deletePaper(id) {
  const res = await fetch(`${BASE}/papers/${id}`, { method: "DELETE" });
  return handle(res);
}

export async function fetchAnalytics() {
  const res = await fetch(`${BASE}/analytics`);
  return handle(res);
}
