/** Single source of truth for TanStack Query cache keys — avoids typo'd key mismatches. */
export const queryKeys = {
  cities: {
    all: ["cities"] as const,
    list: (filters?: Record<string, unknown>) => ["cities", "list", filters] as const,
    detail: (cityId: string) => ["cities", "detail", cityId] as const,
  },
  holdings: {
    all: ["holdings"] as const,
    list: (cityId: string, filters?: Record<string, unknown>) =>
      ["holdings", "list", cityId, filters] as const,
    detail: (holdingId: string) => ["holdings", "detail", holdingId] as const,
  },
  imports: {
    all: ["imports"] as const,
    history: (cityId: string) => ["imports", "history", cityId] as const,
    batch: (batchId: string) => ["imports", "batch", batchId] as const,
  },
  review: {
    queue: (cityId?: string) => ["review", "queue", cityId] as const,
  },
  audit: {
    feed: (filters?: Record<string, unknown>) => ["audit", "feed", filters] as const,
  },
  analytics: {
    systemOverview: ["analytics", "system-overview"] as const,
    cityDrilldown: (cityId: string) => ["analytics", "city", cityId] as const,
    quality: (cityId?: string) => ["analytics", "quality", cityId] as const,
    teamActivity: ["analytics", "team-activity"] as const,
  },
  users: {
    all: ["users"] as const,
  },
  profile: {
    current: ["profile", "current"] as const,
  },
} as const;
