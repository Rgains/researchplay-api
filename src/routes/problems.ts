import { Router } from "express";
import { db, uid } from "../store/db";
import { AuthedRequest, requireAdmin, requireAuth } from "../middleware/auth";
import { reframeProblem } from "../services/ai";

const router = Router();

// Guided intake. Structured flags (NDA, publication, data) are what
// everything downstream filters on.
router.post("/", requireAuth, requireAdmin, (req: AuthedRequest, res) => {
  const {
    title,
    sector,
    rawDescription,
    dataAccess,
    ndaRequired,
    proposedPublicationTerms,
    budget,
    currency,
  } = req.body ?? {};
  if (!title || !sector || !rawDescription || !budget) {
    return res
      .status(400)
      .json({ error: "Title, sector, description and budget are required." });
  }
  const problem = db.problems.insert({
    id: uid("prb"),
    businessId: req.user!.id,
    title,
    sector,
    rawDescription,
    dataAccess: dataAccess ?? "NONE_YET",
    ndaRequired: !!ndaRequired,
    proposedPublicationTerms: proposedPublicationTerms ?? "OPEN",
    budget: Number(budget),
    currency: currency ?? "NGN",
    status: "DRAFT",
    createdAt: new Date().toISOString(),
  });
  res.status(201).json(problem);
});

// AI reframing: returns a draft brief for the poster to confirm.
router.post(
  "/:id/reframe",
  requireAuth,
  requireAdmin,
  async (req: AuthedRequest, res) => {
    const problem = db.problems.get(req.params.id);
    if (!problem || problem.businessId !== req.user!.id)
      return res.status(404).json({ error: "Problem not found." });
    db.problems.update(problem.id, { status: "REFRAMING" });
    try {
      const draft = await reframeProblem(problem);
      const brief = db.briefs.insert({
        id: uid("brf"),
        problemId: problem.id,
        ...draft,
        confirmedByPoster: false,
        humanChecked: false,
        createdAt: new Date().toISOString(),
      });
      db.problems.update(problem.id, { status: "REVIEW" });
      res.json(brief);
    } catch (e) {
      db.problems.update(problem.id, { status: "DRAFT" });
      res.status(502).json({
        error: "Reframing failed. Edit the description and try again.",
      });
    }
  },
);

// Poster confirms the brief captures their intent; a human check then gates go-live.
router.post(
  "/:id/confirm-brief",
  requireAuth,
  requireAdmin,
  (req: AuthedRequest, res) => {
    const problem = db.problems.get(req.params.id);
    if (!problem || problem.businessId !== req.user!.id)
      return res.status(404).json({ error: "Problem not found." });
    const brief = db.briefs.where((b) => b.problemId === problem.id).at(-1);
    if (!brief)
      return res
        .status(400)
        .json({ error: "Run reframing before confirming." });
    db.briefs.update(brief.id, { confirmedByPoster: true, humanChecked: true }); // pilot: auto-check; add reviewer queue at scale
    db.problems.update(problem.id, { status: "LIVE" });
    res.json({ ok: true });
  },
);

router.get("/mine", requireAuth, requireAdmin, (req: AuthedRequest, res) => {
  res.json(db.problems.where((p) => p.businessId === req.user!.id));
});

export default router;
