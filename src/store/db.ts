// Repository-pattern in-memory store. Swap for Postgres/Prisma without
// touching routes: every route talks to `db`, never to storage directly.
import logger from "../utils/logger";
import { currentConfig } from "../utils/config";
import mongoose from "mongoose";
import {
  User,
  Problem,
  Brief,
  Agreement,
  Milestone,
  EscrowAccount,
  Dispute,
  ProvenanceRecord,
} from "../types";

class Table<T extends { id: string }> {
  private rows = new Map<string, T>();
  insert(row: T): T {
    this.rows.set(row.id, row);
    return row;
  }
  get(id: string): T | undefined {
    return this.rows.get(id);
  }
  update(id: string, patch: Partial<T>): T | undefined {
    const row = this.rows.get(id);
    if (!row) return undefined;
    const next = { ...row, ...patch };
    this.rows.set(id, next);
    return next;
  }
  all(): T[] {
    return [...this.rows.values()];
  }
  where(fn: (r: T) => boolean): T[] {
    return this.all().filter(fn);
  }
}

export const db = {
  users: new Table<User>(),
  problems: new Table<Problem>(),
  briefs: new Table<Brief>(),
  agreements: new Table<Agreement>(),
  milestones: new Table<Milestone>(),
  escrows: new Table<EscrowAccount>(),
  disputes: new Table<Dispute>(),
  records: new Table<ProvenanceRecord>(),
};

export const uid = (prefix: string) =>
  `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

export const dbconnect = async () => {
  try {
    const mongoUri = currentConfig.mongoUri;
    await mongoose.connect(mongoUri);

    logger.info("Database Connection Successful");
  } catch (error) {
    console.log(error);
  }
};
