// ─── Escrow orchestration ────────────────────────────────────────────────────
// DESIGN RULE: the platform NEVER custodies funds. A regulated provider
// (Stripe Connect for GBP/USD, Paystack for NGN) holds the full amount and
// splits at release: researcher tranche + platform commission in one
// transaction. This module is the orchestration layer only — it issues
// hold/release instructions and records state; the money sits with the rail.
import { db, uid } from '../store/db';
import { Agreement, EscrowAccount, Milestone, MilestoneState } from '../types';

export const COMMISSION_RATE = 0.10;

// Provider adapter interface: implement per rail, swap freely.
export interface EscrowProvider {
  name: 'STRIPE_CONNECT' | 'PAYSTACK';
  createHold(amount: number, currency: string, agreementId: string): Promise<string>; // returns providerRef
  releaseTranche(providerRef: string, amount: number, researcherId: string, commission: number): Promise<void>;
  refundTranche(providerRef: string, amount: number, businessId: string): Promise<void>;
}

// Stubs: replace bodies with real SDK calls. Signatures stay identical.
class StripeConnectAdapter implements EscrowProvider {
  name = 'STRIPE_CONNECT' as const;
  async createHold(amount: number, currency: string, agreementId: string) {
    return `pi_stub_${agreementId}`; // PaymentIntent w/ separate charges & transfers
  }
  async releaseTranche() { /* stripe.transfers.create(...) with application_fee */ }
  async refundTranche() { /* stripe.refunds.create(...) */ }
}
class PaystackAdapter implements EscrowProvider {
  name = 'PAYSTACK' as const;
  async createHold(amount: number, currency: string, agreementId: string) {
    return `ps_stub_${agreementId}`; // transaction + subaccount split, held payout
  }
  async releaseTranche() { /* paystack transfer to researcher subaccount */ }
  async refundTranche() { /* paystack refund */ }
}

export function pickProvider(currency: string): EscrowProvider {
  return currency === 'NGN' ? new PaystackAdapter() : new StripeConnectAdapter();
}

// Milestone state machine. Every transition is validated here — routes never
// mutate state directly, so illegal jumps (e.g. FUNDED -> RELEASED) cannot happen.
const TRANSITIONS: Record<MilestoneState, MilestoneState[]> = {
  AWAITING_FUNDING: ['FUNDED'],
  FUNDED: ['IN_PROGRESS'],
  IN_PROGRESS: ['SUBMITTED'],
  SUBMITTED: ['ACCEPTED', 'DISPUTED', 'IN_PROGRESS'], // IN_PROGRESS = revision requested
  ACCEPTED: ['RELEASED'],
  DISPUTED: ['RELEASED', 'IN_PROGRESS', 'ACCEPTED'],  // arbitration outcomes
  RELEASED: [],
};

export function transition(m: Milestone, to: MilestoneState): Milestone {
  if (!TRANSITIONS[m.state].includes(to)) {
    throw new Error(`Milestone cannot move from ${m.state} to ${to}.`);
  }
  const patch: Partial<Milestone> = { state: to };
  if (to === 'SUBMITTED') patch.submittedAt = new Date().toISOString();
  if (to === 'RELEASED') patch.resolvedAt = new Date().toISOString();
  return db.milestones.update(m.id, patch)!;
}

export async function fundAgreement(agreement: Agreement): Promise<EscrowAccount> {
  const provider = pickProvider(agreement.terms.currency);
  const providerRef = await provider.createHold(
    agreement.terms.price, agreement.terms.currency, agreement.id
  );
  const escrow = db.escrows.insert({
    id: uid('esc'),
    agreementId: agreement.id,
    provider: provider.name,
    providerRef,
    totalAmount: agreement.terms.price,
    currency: agreement.terms.currency,
    commissionRate: COMMISSION_RATE,
    fundedAt: new Date().toISOString(),
    releasedAmount: 0,
  });
  db.milestones
    .where(x => x.agreementId === agreement.id && x.state === 'AWAITING_FUNDING')
    .forEach(x => transition(x, 'FUNDED'));
  return escrow;
}

export async function releaseMilestone(milestone: Milestone): Promise<void> {
  const escrow = db.escrows.where(e => e.agreementId === milestone.agreementId)[0];
  if (!escrow) throw new Error('No funded escrow for this agreement.');
  const agreement = db.agreements.get(milestone.agreementId)!;
  const gross = (milestone.percent / 100) * escrow.totalAmount;
  const commission = gross * escrow.commissionRate;
  const provider = pickProvider(escrow.currency);
  await provider.releaseTranche(escrow.providerRef, gross - commission, agreement.researcherId, commission);
  db.escrows.update(escrow.id, { releasedAmount: escrow.releasedAmount + gross });
  transition(milestone, 'RELEASED');
}
