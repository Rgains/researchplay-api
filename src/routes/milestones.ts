import { Router } from "express";
import { db, uid } from "../store/db";
import { AuthedRequest, requireAuth, requireAdmin } from "../middleware/auth";
import { releaseMilestone, transition } from "../services/escrow";

const router = Router();

function loadOwned(req: AuthedRequest, id: string) {
  const m = db.milestones.get(id);
  if (!m) return { error: "Milestone not found." as const };
  const a = db.agreements.get(m.agreementId)!;
  if (![a.businessId, a.researcherId].includes(req.user!.id))
    return { error: "Not your project." as const };
  return { m, a };
}

// Researcher starts work (escrow must be funded — enforced by the state machine).
router.post("/:id/start", requireAuth, (req: AuthedRequest, res) => {
  const r = loadOwned(req, req.params.id);
  if ("error" in r) return res.status(404).json({ error: r.error });
  try {
    res.json(transition(r.m, "IN_PROGRESS"));
  } catch (e: any) {
    res.status(409).json({ error: e.message });
  }
});

// Researcher submits the deliverable against the milestone's written definition.
router.post("/:id/submit", requireAuth, (req: AuthedRequest, res) => {
  const r = loadOwned(req, req.params.id);
  if ("error" in r) return res.status(404).json({ error: r.error });
  db.milestones.update(r.m.id, { deliverableUrl: req.body?.deliverableUrl });
  try {
    res.json(transition(db.milestones.get(r.m.id)!, "SUBMITTED"));
  } catch (e: any) {
    res.status(409).json({ error: e.message });
  }
});

// Business accepts -> release instruction to the provider (split: researcher + 10% commission).
router.post("/:id/accept", requireAuth, async (req: AuthedRequest, res) => {
  const r = loadOwned(req, req.params.id);
  if ("error" in r) return res.status(404).json({ error: r.error });
  try {
    const accepted = transition(r.m, "ACCEPTED");
    await releaseMilestone(accepted);
    res.json(db.milestones.get(r.m.id));
  } catch (e: any) {
    res.status(409).json({ error: e.message });
  }
});

// Business requests revision instead of accepting.
router.post("/:id/request-revision", requireAuth, (req: AuthedRequest, res) => {
  const r = loadOwned(req, req.params.id);
  if ("error" in r) return res.status(404).json({ error: r.error });
  try {
    res.json(transition(r.m, "IN_PROGRESS"));
  } catch (e: any) {
    res.status(409).json({ error: e.message });
  }
});

// Either party raises a dispute: funds freeze pending arbitration.
router.post("/:id/dispute", requireAuth, (req: AuthedRequest, res) => {
  const r = loadOwned(req, req.params.id);
  if ("error" in r) return res.status(404).json({ error: r.error });
  if (!req.body?.reason)
    return res.status(400).json({ error: "Explain what is being disputed." });
  try {
    transition(r.m, "DISPUTED");
    const d = db.disputes.insert({
      id: uid("dsp"),
      milestoneId: r.m.id,
      raisedBy: req.user!.id,
      reason: req.body.reason,
      status: "OPEN",
      createdAt: new Date().toISOString(),
    });
    res.status(201).json(d);
  } catch (e: any) {
    res.status(409).json({ error: e.message });
  }
});

// Admin arbitration: release, refund, or send back to work — with a written note.
router.post(
  "/disputes/:id/resolve",
  requireAuth,
  requireAdmin,
  async (req: AuthedRequest, res) => {
    const d = db.disputes.get(req.params.id);
    if (!d || d.status !== "OPEN")
      return res.status(404).json({ error: "Open dispute not found." });
    const { outcome, note } = req.body ?? {};
    const m = db.milestones.get(d.milestoneId)!;
    try {
      if (outcome === "RELEASE") {
        transition(m, "ACCEPTED");
        await releaseMilestone(db.milestones.get(m.id)!);
        db.disputes.update(d.id, {
          status: "RESOLVED_RELEASE",
          resolutionNote: note,
        });
      } else if (outcome === "REWORK") {
        transition(m, "IN_PROGRESS");
        db.disputes.update(d.id, {
          status: "RESOLVED_PARTIAL",
          resolutionNote: note,
        });
      } else if (outcome === "REFUND") {
        db.disputes.update(d.id, {
          status: "RESOLVED_REFUND",
          resolutionNote: note,
        }); /* provider.refundTranche(...) */
      } else
        return res
          .status(400)
          .json({ error: "Outcome must be RELEASE, REWORK or REFUND." });
      res.json(db.disputes.get(d.id));
    } catch (e: any) {
      res.status(409).json({ error: e.message });
    }
  },
);

export default router;
