import { Router } from 'express';
import { db } from '../store/db';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Marketplace listing: only confirmed + human-checked briefs on LIVE problems.
// Filterable on the flags researchers actually decide on.
router.get('/', requireAuth, (req, res) => {
  const { sector, publishable, nda, currency } = req.query;
  const live = db.briefs.where(b => {
    if (!b.confirmedByPoster || !b.humanChecked) return false;
    const p = db.problems.get(b.problemId);
    if (!p || p.status !== 'LIVE') return false;
    if (sector && p.sector !== sector) return false;
    if (currency && p.currency !== currency) return false;
    if (publishable === 'true' && p.proposedPublicationTerms === 'CONFIDENTIAL') return false;
    if (nda === 'false' && p.ndaRequired) return false;
    return true;
  });
  res.json(live.map(b => {
    const p = db.problems.get(b.problemId)!;
    return {
      ...b,
      problem: {
        id: p.id, title: p.title, sector: p.sector, budget: p.budget, currency: p.currency,
        ndaRequired: p.ndaRequired, proposedPublicationTerms: p.proposedPublicationTerms,
        dataAccess: p.dataAccess,
      },
    };
  }));
});

router.get('/:id', requireAuth, (req, res) => {
  const b = db.briefs.get(req.params.id);
  if (!b) return res.status(404).json({ error: 'Brief not found.' });
  res.json({ ...b, problem: db.problems.get(b.problemId) });
});

export default router;
