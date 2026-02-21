export const TIMEZONE_OPTIONS = [
  "Europe/Stockholm",
  "Europe/Paris",
  "Europe/London",
  "America/New_York",
  "America/Los_Angeles",
  "Asia/Tokyo",
  "Asia/Singapore"
] as const;

export type SupportedTimezone = (typeof TIMEZONE_OPTIONS)[number];

export function isSupportedTimezone(value: string): value is SupportedTimezone {
  return TIMEZONE_OPTIONS.includes(value as SupportedTimezone);
}
