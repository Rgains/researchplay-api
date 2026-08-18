import { Router } from "express";
import { db, uid } from "../store/db";
import { AuthedRequest, requireAuth } from "../middleware/auth";
import user from "../models/Account/User";

const router = Router();

// Deposit: researcher registers DOIs from Zenodo/OSF/protocols.io.
// The artefacts live in trusted repositories; OpenBrief holds the LINK —
// problem -> brief -> dataset -> methodology -> publication -> stakeholder.
router.post("/", requireAuth, (req: AuthedRequest, res) => {
  const {
    agreementId,
    datasetDoi,
    methodologyDoi,
    publicationDoi,
    codeUrl,
    licence,
    restrictedDataHost,
  } = req.body ?? {};
  const a = db.agreements.get(agreementId);
  if (!a || a.researcherId !== req.user!.id)
    return res.status(404).json({ error: "Agreement not found." });
  const milestones = db.milestones.where((m) => m.agreementId === a.id);
  if (!milestones.every((m) => m.state === "RELEASED")) {
    return res.status(409).json({
      error: "All milestones must be released before the record is completed.",
    });
  }
  if (
    a.terms.publicationTerms === "CONFIDENTIAL" &&
    (datasetDoi || publicationDoi)
  ) {
    return res.status(409).json({
      error:
        "This project is confidential: public DOIs cannot be attached. Methodology and code may still be archived if the agreement allows.",
    });
  }
  const record = db.records.insert({
    id: uid("rec"),
    problemId: a.problemId,
    briefId: a.briefId,
    agreementId: a.id,
    datasetDoi,
    methodologyDoi,
    publicationDoi,
    codeUrl,
    licence,
    restrictedDataHost,
    publicationTerms: a.terms.publicationTerms,
    completedAt: new Date().toISOString(),
  });
  db.problems.update(a.problemId, { status: "COMPLETED" });
  res.status(201).json(record);
});

// Public provenance chain (the platform's unique asset).
router.get("/:id", async (req, res) => {
  const r = db.records.get(req.params.id);
  if (!r) return res.status(404).json({ error: "Record not found." });
  const problem = db.problems.get(r.problemId)!;
  const agreement = db.agreements.get(r.agreementId)!;
  const acct = await user.findById(agreement.researcherId);
  res.json({
    ...r,
    chain: {
      problem: { title: problem.title, sector: problem.sector },
      brief: db.briefs.get(r.briefId)?.researchQuestion,
      researcher: acct
        ? { name: acct.email, institution: acct.username }
        : null,
    },
  });
});

router.get("/", (_req, res) => {
  res.json(
    db.records.all().map((r) => ({
      ...r,
      problemTitle: db.problems.get(r.problemId)?.title,
    })),
  );
});

export default router;
