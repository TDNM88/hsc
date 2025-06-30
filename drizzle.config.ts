import type { Config } from "drizzle-kit";

export default {
  schema: "./lib/schema.ts", // path to your Drizzle schema
  out: "./drizzle",          // migrations output folder
  dialect: "sqlite",
  dbCredentials: {
    url: "./sqlite.db", // SQLite file used by your app (adjust if different)
  },
} satisfies Config;
