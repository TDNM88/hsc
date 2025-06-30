import { db } from "./db";
import { rounds } from "./schema";
import { eq, and } from "drizzle-orm";

const ROUND_LENGTH_MS = 60 * 1000;

// Get the round whose window currently includes now()
export async function getCurrentRound() {
  const now = Date.now();
  const startMs = Math.floor(now / ROUND_LENGTH_MS) * ROUND_LENGTH_MS;
  const endMs = startMs + ROUND_LENGTH_MS;

  const [round] = await db
    .select()
    .from(rounds)
    .where(and(eq(rounds.startTime, new Date(startMs)), eq(rounds.endTime, new Date(endMs))));
  return round ?? null;
}
