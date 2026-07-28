import { Router } from "express";
import { pool } from "../db.js";
import { DOMAINS, READING_STAGES } from "../constants.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const totalRes = await pool.query(`SELECT COUNT(*)::int AS count FROM papers`);
    const total = totalRes.rows[0].count;

    // Funnel: paper count at each reading stage
    const funnelRes = await pool.query(
      `SELECT reading_stage, COUNT(*)::int AS count
       FROM papers GROUP BY reading_stage`
    );
    const funnelMap = Object.fromEntries(funnelRes.rows.map((r) => [r.reading_stage, r.count]));
    const funnel = READING_STAGES.map((stage) => ({
      stage,
      count: funnelMap[stage] || 0,
    }));

    // Scatter: citation count per paper, grouped by impact score
    const scatterRes = await pool.query(
      `SELECT id, title, citation_count, impact_score FROM papers ORDER BY citation_count ASC`
    );
    const scatter = scatterRes.rows;

    // Stacked bar: papers by domain and reading stage
    const stackedRes = await pool.query(
      `SELECT domain, reading_stage, COUNT(*)::int AS count
       FROM papers GROUP BY domain, reading_stage`
    );
    const stacked = DOMAINS.map((domain) => {
      const row = { domain };
      READING_STAGES.forEach((stage) => {
        const match = stackedRes.rows.find(
          (r) => r.domain === domain && r.reading_stage === stage
        );
        row[stage] = match ? match.count : 0;
      });
      return row;
    });

    // Summary: papers by stage (reuse funnel), avg citations per domain, completion rate
    const avgCitationsRes = await pool.query(
      `SELECT domain, COALESCE(AVG(citation_count), 0)::float AS avg_citations
       FROM papers GROUP BY domain`
    );
    const avgMap = Object.fromEntries(
      avgCitationsRes.rows.map((r) => [r.domain, Number(r.avg_citations.toFixed(2))])
    );
    const avgCitationsPerDomain = DOMAINS.map((domain) => ({
      domain,
      avgCitations: avgMap[domain] ?? 0,
    }));

    const fullyRead = funnelMap["Fully Read"] || 0;
    const completionRate = total > 0 ? Number(((fullyRead / total) * 100).toFixed(1)) : 0;

    res.json({
      total,
      funnel,
      scatter,
      stacked,
      summary: {
        papersByStage: funnel,
        avgCitationsPerDomain,
        completionRate,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to compute analytics" });
  }
});

export default router;
