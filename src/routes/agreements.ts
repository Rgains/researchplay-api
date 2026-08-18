import { Router } from "express";
import { db, uid } from "../store/db";
import { AuthedRequest, requireAuth } from "../middleware/auth";
import { fundAgreement } from "../services/escrow";
import { AgreementTerms } from "../types";

const router = Router();

// Researcher claims a brief: sees the business's terms and proposes acceptance
// as-is or with changes. Publication terms are a first-class negotiated field.
router.post("/", requireAuth, (req: AuthedRequest, res) => {
  const { briefId, terms } = req.body ?? {};
  const brief = db.briefs.get(briefId);
  if (!brief) return res.status(404).json({ error: "Brief not found." });
  const problem = db.problems.get(brief.problemId)!;
  if (problem.status !== "LIVE")
    return res.status(409).json({ error: "This brief is no longer open." });

  const t: AgreementTerms = terms ?? {
    price: problem.budget,
    currency: problem.currency,
    publicationTerms: problem.proposedPublicationTerms,
    ndaRequired: problem.ndaRequired,
    paymentStructure: "MILESTONES",
    milestones: brief.suggestedMilestones,
  };
  const pct = t.milestones.reduce((s, m) => s + m.percent, 0);
  if (pct !== 100)
    return res
      .status(400)
      .json({ error: "Milestone percentages must add up to 100." });

  const agreement = db.agreements.insert({
    id: uid("agr"),
    problemId: problem.id,
    briefId,
    businessId: problem.businessId,
    researcherId: req.user!.id,
    status: "PROPOSED",
    terms: t,
    history: [
      {
        by: req.user?.id,
        at: new Date().toISOString(),
        action: "PROPOSED",
        terms: t,
      },
    ],
    createdAt: new Date().toISOString(),
  });
  res.status(201).json(agreement);
});

// Either party counters with revised terms; the other side sees full history.
router.post("/:id/counter", requireAuth, (req: AuthedRequest, res) => {
  const a = db.agreements.get(req.params.id);
  if (!a) return res.status(404).json({ error: "Agreement not found." });
  if (![a.businessId, a.researcherId].includes(req.user!.id))
    return res.status(403).json({ error: "Not your agreement." });
  if (!["PROPOSED", "COUNTERED"].includes(a.status))
    return res
      .status(409)
      .json({ error: "This agreement is closed to changes." });
  const terms = req.body?.terms as AgreementTerms;
  if (!terms)
    return res
      .status(400)
      .json({ error: "Counter must include revised terms." });
  const updated = db.agreements.update(a.id, {
    status: "COUNTERED",
    terms,
    history: [
      ...a.history,
      {
        by: req.user!.id,
        at: new Date().toISOString(),
        action: "COUNTERED",
        terms,
      },
    ],
  });
  res.json(updated);
});

router.post("/:id/accept", requireAuth, (req: AuthedRequest, res) => {
  const a = db.agreements.get(req.params.id);
  if (!a) return res.status(404).json({ error: "Agreement not found." });
  if (![a.businessId, a.researcherId].includes(req.user!.id))
    return res.status(403).json({ error: "Not your agreement." });
  if (!["PROPOSED", "COUNTERED"].includes(a.status))
    return res.status(409).json({ error: "This agreement is closed." });

  const updated = db.agreements.update(a.id, {
    status: "ACCEPTED",
    history: [
      ...a.history,
      { by: req.user!.id, at: new Date().toISOString(), action: "ACCEPTED" },
    ],
  })!;
  // Materialise milestones in AWAITING_FUNDING; work cannot start until escrow is funded.
  updated.terms.milestones.forEach((m, i) =>
    db.milestones.insert({
      id: uid("mls"),
      agreementId: updated.id,
      index: i,
      title: m.title,
      description: m.description,
      percent: m.percent,
      state: "AWAITING_FUNDING",
    }),
  );
  db.problems.update(a.problemId, { status: "CLAIMED" });
  res.json(updated);
});

router.post("/:id/reject", requireAuth, (req: AuthedRequest, res) => {
  const a = db.agreements.get(req.params.id);
  if (!a) return res.status(404).json({ error: "Agreement not found." });
  if (![a.businessId, a.researcherId].includes(req.user!.id))
    return res.status(403).json({ error: "Not your agreement." });
  const updated = db.agreements.update(a.id, {
    status: "REJECTED",
    history: [
      ...a.history,
      { by: req.user!.id, at: new Date().toISOString(), action: "REJECTED" },
    ],
  });
  res.json(updated);
});

// Business funds the FULL amount into provider escrow. Platform never holds it.
router.post("/:id/fund", requireAuth, async (req: AuthedRequest, res) => {
  const a = db.agreements.get(req.params.id);
  if (!a || a.businessId !== req.user!.id)
    return res.status(404).json({ error: "Agreement not found." });
  if (a.status !== "ACCEPTED")
    return res
      .status(409)
      .json({ error: "Agreement must be accepted before funding." });
  if (db.escrows.where((e) => e.agreementId === a.id).length)
    return res.status(409).json({ error: "Already funded." });
  const escrow = await fundAgreement(a);
  res.status(201).json(escrow);
});

router.get("/mine", requireAuth, (req: AuthedRequest, res) => {
  const list = db.agreements.where(
    (a) => a.businessId === req.user!.id || a.researcherId === req.user!.id,
  );
  res.json(
    list.map((a) => ({
      ...a,
      problem: db.problems.get(a.problemId),
      milestones: db.milestones
        .where((m) => m.agreementId === a.id)
        .sort((x, y) => x.index - y.index),
      escrow: db.escrows.where((e) => e.agreementId === a.id)[0] ?? null,
    })),
  );
});

export default router;
