// Minimal stub for missing 'gel' type declarations used by drizzle-orm
// This avoids TypeScript build errors complaining about missing module 'gel'.
// Extend as needed with proper types.

declare module 'gel' {
  // Drizzle ORM only uses `DateDuration` generic type, we can safely alias to `string` for now.
  export type DateDuration = string;
  export type Duration = string;
  export type LocalDate = string;
  export type LocalTime = string;
  export type LocalDateTime = string;
  export type ZonedDateTime = string;
  export type Instant = string;
  export type RelativeDuration = string;
}
