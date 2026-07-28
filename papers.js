import { Router } from "express";
import { pool } from "../db.js";
import { DOMAINS, READING_STAGES, IMPACT_SCORES } from "../constants.js";

const router = Router();

function asArray(value) {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : String(value).split(",").filter(Boolean);
}

function dateRangeToClause(range, paramIndex) {
  switch (range) {
    case "This Week":
      return { clause: `date_added >= date_trunc('week', CURRENT_DATE)`, param: null };
    case "This Month":
      return { clause: `date_added >= date_trunc('month', CURRENT_DATE)`, param: null };
    case "Last 3 Months":
      return { clause: `date_added >= CURRENT_DATE - INTERVAL '3 months'`, param: null };
    case "All Time":
    default:
      return null;
  }
}

// GET /api/papers - list with optional multi-select filters
// query params: stage=A,B  domain=A,B  impact=A,B  dateRange=This Week
router.get("/", async (req, res) => {
  try {
    const stages = asArray(req.query.stage);
    const domains = asArray(req.query.domain);
    const impacts = asArray(req.query.impact);
    const dateRange = req.query.dateRange;

    const clauses = [];
    const params = [];

    if (stages.length) {
      params.push(stages);
      clauses.push(`reading_stage = ANY($${params.length}::text[])`);
    }
    if (domains.length) {
      params.push(domains);
      clauses.push(`domain = ANY($${params.length}::text[])`);
    }
    if (impacts.length) {
      params.push(impacts);
      clauses.push(`impact_score = ANY($${params.length}::text[])`);
    }
    const dateClause = dateRangeToClause(dateRange);
    if (dateClause) clauses.push(dateClause.clause);

    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const { rows } = await pool.query(
      `SELECT * FROM papers ${where} ORDER BY date_added DESC, id DESC`,
      params
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch papers" });
  }
});

// POST /api/papers - add a new paper
router.post("/", async (req, res) => {
  try {
    const {
      title,
      first_author,
      domain,
      reading_stage,
      citation_count,
      impact_score,
      date_added,
    } = req.body;

    if (!title || !first_author || !domain || !reading_stage || !impact_score) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    if (!DOMAINS.includes(domain)) {
      return res.status(400).json({ error: "Invalid domain" });
    }
    if (!READING_STAGES.includes(reading_stage)) {
      return res.status(400).json({ error: "Invalid reading stage" });
    }
    if (!IMPACT_SCORES.includes(impact_score)) {
      return res.status(400).json({ error: "Invalid impact score" });
    }

    const { rows } = await pool.query(
      `INSERT INTO papers (title, first_author, domain, reading_stage, citation_count, impact_score, date_added)
       VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, CURRENT_DATE))
       RETURNING *`,
      [
        title,
        first_author,
        domain,
        reading_stage,
        Number(citation_count) || 0,
        impact_score,
        date_added || null,
      ]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add paper" });
  }
});

// DELETE /api/papers/:id - remove a paper (useful for fixing mistakes)
router.delete("/:id", async (req, res) => {
  try {
    await pool.query(`DELETE FROM papers WHERE id = $1`, [req.params.id]);
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete paper" });
  }
});

export default router;
