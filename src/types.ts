import { JwtPayload } from "jsonwebtoken";

export const acctStatuses: AcctStatus[] = ["ACTIVE", "INACTIVE", "PENDING", "SUSPENDED"];
export const acctTypes: AcctType[] = ["ADMIN", "USER", "RESEARCHER", "INSTITUTION", "TEAM", "ORGANIZATION", "CONTRIBUTOR", "SUPER_ADMIN"];
export const bidStatuses: BidStatusType[] = [
  "AWARDED",
  "IN_REVIEW",
  "REJECTED",
];

export type AcctStatus = "ACTIVE" | "INACTIVE" | "PENDING" | "SUSPENDED";

// ─── OpenBrief domain model ──────────────────────────────────────────────────
export type AcctType = "ADMIN" | "USER" | "RESEARCHER" | "CONTRIBUTOR" | "INSTITUTION" | "TEAM" | "ORGANIZATION" | "SUPER_ADMIN";

export interface User {
  id: string;
  email: string;
  password: string; // demo: sha256; swap for bcrypt/argon2 in production
  fname: string;
  lname: string;
  acctType: string;
}

// Publication terms are first-class, negotiated like price.
export type PublicationTerms =
  | "OPEN" // publishable immediately
  | "EMBARGO_6M" // publishable after 6-month embargo
  | "ANONYMISED" // publishable with business anonymised
  | "CO_AUTHORED" // publishable, business co-credited
  | "CONFIDENTIAL"; // not publishable

export type DataAccess = "OPEN" | "RESTRICTED" | "NONE_YET";

export interface Problem {
  id: string;
  businessId: string;
  title: string;
  sector: string;
  rawDescription: string;
  dataAccess: DataAccess;
  ndaRequired: boolean;
  proposedPublicationTerms: PublicationTerms;
  budget: number; // full amount, funded to escrow up-front
  currency: "NGN" | "GBP" | "USD";
  status:
    | "DRAFT"
    | "REFRAMING"
    | "REVIEW"
    | "LIVE"
    | "CLAIMED"
    | "COMPLETED"
    | "ARCHIVED";
  createdAt: string;
}

// AI output: a research-shaped brief the poster confirms before it goes live.
export interface Brief {
  id: string;
  problemId: string;
  researchQuestion: string;
  background: string;
  methodologySuggestions: string[];
  dataRequirements: string[];
  literatureEntryPoints: string[];
  suggestedMilestones: {
    title: string;
    description: string;
    percent: number;
  }[];
  confirmedByPoster: boolean;
  humanChecked: boolean; // light expert gate before going live
  createdAt: string;
}

// Negotiation: researcher sees terms, then agrees / counters / rejects.
export type AgreementStatus =
  | "PROPOSED"
  | "COUNTERED"
  | "ACCEPTED"
  | "REJECTED"
  | "WITHDRAWN";

export interface AgreementTerms {
  price: number;
  currency: "NGN" | "GBP" | "USD";
  publicationTerms: PublicationTerms;
  ndaRequired: boolean;
  paymentStructure: "MILESTONES" | "DEPOSIT_BALANCE" | "PILOT_THEN_SCALE";
  milestones: { title: string; description: string; percent: number }[];
  note?: string;
}

export interface Agreement {
  id: string;
  problemId: string;
  briefId: string;
  businessId: string;
  researcherId: string;
  status: AgreementStatus;
  terms: AgreementTerms;
  history: {
    by?: string;
    at: string;
    action: string;
    terms?: AgreementTerms;
  }[];
  createdAt: string;
}

// ─── Escrow: funds are custodied by the provider, never by the platform ─────
export type MilestoneState =
  | "AWAITING_FUNDING" // agreement accepted, business has not funded escrow
  | "FUNDED" // provider holds full amount; researcher may start
  | "IN_PROGRESS"
  | "SUBMITTED" // deliverable submitted, awaiting business acceptance
  | "ACCEPTED" // business accepted; release instruction queued
  | "RELEASED" // provider paid researcher, commission split to platform
  | "DISPUTED"; // held pending arbitration

export interface Milestone {
  id: string;
  agreementId: string;
  index: number;
  title: string;
  description: string;
  percent: number; // share of total price
  state: MilestoneState;
  deliverableUrl?: string;
  submittedAt?: string;
  resolvedAt?: string;
}

export interface EscrowAccount {
  id: string;
  agreementId: string;
  provider: "STRIPE_CONNECT" | "PAYSTACK";
  providerRef: string; // provider-side hold reference
  totalAmount: number;
  currency: string;
  commissionRate: number; // 0.10
  fundedAt?: string;
  releasedAmount: number;
}

export interface Dispute {
  id: string;
  milestoneId: string;
  raisedBy: string;
  reason: string;
  status: "OPEN" | "RESOLVED_RELEASE" | "RESOLVED_REFUND" | "RESOLVED_PARTIAL";
  resolutionNote?: string;
  createdAt: string;
}

// ─── Provenance: the linked record only OpenBrief holds ─────────────────────
export interface ProvenanceRecord {
  id: string;
  problemId: string;
  briefId: string;
  agreementId: string;
  datasetDoi?: string; // deposited to Zenodo/OSF, DOI pulled back
  methodologyDoi?: string; // protocols.io / Zenodo
  publicationDoi?: string; // journal or preprint DOI
  codeUrl?: string;
  restrictedDataHost?: "RESEARCHGAINS"; // sensitive data stays governed
  licence?: string;
  publicationTerms: PublicationTerms;
  completedAt?: string;
}

export type ResearchCategories =
  | "AWAITING_FUNDING" // agreement accepted, business has not funded escrow
  | "FUNDED" // provider holds full amount; researcher may start
  | "IN_PROGRESS"
  | "SUBMITTED" // deliverable submitted, awaiting business acceptance
  | "ACCEPTED" // business accepted; release instruction queued
  | "RELEASED" // provider paid researcher, commission split to platform
  | "DISPUTED";

export type BudgetType = "FIXED" | "NEGOTIABLE";
export type BidStatusType = "AWARDED" | "IN_REVIEW" | "REJECTED";
export type ProjectStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "AWARDED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "IN_REVIEW";
export type tokenInvalidationMethods = "USER_LOGOUT" | "ADMIN_REVOCATION";

export interface Bid {
  id?: string;
  coverLetter?: string;
  executiveSummary?: string;
  teamComposition?: string[];
  project: any;
  bidder: any;
}

export interface TokenPayload extends JwtPayload{
  id?: string;
  email?: string;
  username?: string;
  acctType?: string;
  phone?: string;
}

export interface MailObject {
  to: string;
  subject?: string;
  text?: string;
}
