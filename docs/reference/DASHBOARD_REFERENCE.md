# HiyazaFinder Admin Dashboard — Architecture Reference

**Complete documentation of the Dashboard system for architects and developers.**

**Status:** Phase 0 + 1–5 complete. Foundation stable, ready for redesign planning.

**Generated:** 2026-08-06

---

## Table of Contents

1. [Dashboard Overview](#dashboard-overview)
2. [Architecture Principles](#architecture-principles)
3. [Folder Structure](#folder-structure)
4. [Technology Stack](#technology-stack)
5. [Authentication & Authorization](#authentication--authorization)
6. [Navigation & URL Structure](#navigation--url-structure)
7. [State Management](#state-management)
8. [API Layer & Repositories](#api-layer--repositories)
9. [Supabase Integration](#supabase-integration)
10. [Database Schema Overview](#database-schema-overview)
11. [Page-by-Page Documentation](#page-by-page-documentation)
12. [Feature Modules](#feature-modules)
13. [Business Rules](#business-rules)
14. [Data Flow Diagrams](#data-flow-diagrams)
15. [Technical Debt](#technical-debt)
16. [Code Smells](#code-smells)
17. [Refactoring Opportunities](#refactoring-opportunities)
18. [Questions & Missing Information](#questions--missing-information)

---

## Dashboard Overview

### Purpose

The **HiyazaFinder Admin Dashboard** is the control plane for the entire HiyazaFinder agricultural data system. It manages:

- **City (جمعية) lifecycle** — create, update, archive, delete agricultural associations
- **Excel import pipeline** — parse, validate, and commit authoritative holding records
- **Data correction** — edit individual fields in imported holdings without re-uploading
- **Field team review queue** — approve or reject holdings added by mobile app users
- **Audit trail** — track all changes (who, what, when) across cities and users
- **Analytics & quality metrics** — understand data coverage, completeness, and team activity
- **User management** — create staff accounts, manage roles and permissions

### Architecture Overview

**Three-layer architecture:**

```
Presentation Layer (Next.js Pages + React Components)
         ↓
Business Logic Layer (Hooks, Services, Core Logic)
         ↓
Data Access Layer (Repositories, Supabase Client)
         ↓
Supabase Backend (Postgres, Auth, Storage, RPCs)
```

**Key principles:**

- **Feature-first organization** — all code for one feature lives under `features/[feature]/`
- **Repository pattern** — all Supabase interactions go through repositories, enabling testing
- **Composable pages** — route pages only compose; all logic is in features
- **Pure business logic** — `*/core/` files have zero dependencies (no React, no Supabase)
- **Immutable, strongly typed** — TypeScript strict mode, Zod validation at boundaries

---

## Architecture Principles

### SOLID Applied

1. **Single Responsibility** — each file has one reason to change
   - Pages compose only (< 40 lines)
   - Components render or fetch, not both
   - Import pipeline split into 10 independent functions
   
2. **Open/Closed** — extend without editing
   - Column mappings are data, not code (new Excel layout = new registry entry)
   - Analytics metrics registered in arrays
   - Validation rules in schema files, not scattered

3. **Liskov Substitution** — data access behind interfaces
   - `HoldingsRepository`, `CityRepository`, `AuditRepository` are abstract
   - Implementations pluggable (`SupabaseHoldingsRepository` or test double)

4. **Interface Segregation** — narrow dependencies
   - Components receive only fields they render
   - Hooks scoped to specific operations (`useHoldings()`, not `useEverything()`)

5. **Dependency Inversion** — depend on abstractions
   - `createClient()` called in exactly 2 files
   - Features depend on repositories, not Supabase

### Clean Code Rules (Enforced)

- No `any` — strict TypeScript
- Zod at every trust boundary (user input, API responses)
- Errors are values (`Result<T, Error>`)
- No magic strings (use `TABLES`, `ROLES`, `queryKeys` constants)
- Functions ≤ 40 lines, files ≤ 250 lines
- JSDoc on exports
- Tests colocated (`foo.ts` → `foo.test.ts`)

---

## Folder Structure

```
hiyaza-dashboard/
├── src/
│   ├── app/                              # Next.js 15 App Router
│   │   ├── layout.tsx                    # Root (RTL, Tajawal font, Providers)
│   │   ├── providers.tsx                 # React Query, Themes, Tooltips
│   │   ├── (auth)/
│   │   │   └── login/page.tsx            # Login page (public)
│   │   ├── (dashboard)/                  # Auth-guarded routes
│   │   │   ├── layout.tsx                # Sidebar + Topbar shell
│   │   │   ├── page.tsx                  # Home / System Overview
│   │   │   ├── cities/
│   │   │   │   ├── page.tsx              # Cities List
│   │   │   │   └── [cityId]/
│   │   │   │       ├── layout.tsx        # City context provider
│   │   │   │       ├── page.tsx          # City Drilldown (Analytics)
│   │   │   │       ├── holdings/page.tsx # Holdings Table (per-city)
│   │   │   │       ├── import/page.tsx   # Import Wizard + History
│   │   │   │       ├── activity/page.tsx # City Activity Log
│   │   │   │       └── quality/page.tsx  # Quality Metrics (per-city)
│   │   │   ├── review/page.tsx           # Review Queue (app-added holdings)
│   │   │   ├── audit/page.tsx            # Audit Feed (all changes, all cities)
│   │   │   ├── analytics/page.tsx        # Analytics Dashboard
│   │   │   ├── users/page.tsx            # User Management
│   │   │   └── settings/page.tsx         # Settings (city archive/delete)
│   │   └── api/
│   │       ├── import/preview/route.ts   # POST Excel → parsed preview
│   │       ├── users/invite/route.ts     # POST send invite email
│   │       └── users/force-sign-out/route.ts # POST sign out user
│   │
│   ├── features/                         # Feature modules
│   │   ├── auth/
│   │   │   ├── api/supabase-auth-repository.ts
│   │   │   ├── components/login-form.tsx
│   │   │   ├── hooks/use-current-profile.ts
│   │   │   ├── schemas/login-schema.ts
│   │   │   └── types.ts
│   │   │
│   │   ├── cities/
│   │   │   ├── api/supabase-cities-repository.ts
│   │   │   ├── components/cities-list.tsx, city-status-badge.tsx
│   │   │   ├── hooks/use-cities.ts, use-city.ts, use-city-mutations.ts
│   │   │   ├── schemas/city-schema.ts
│   │   │   └── types.ts
│   │   │
│   │   ├── holdings/
│   │   │   ├── api/supabase-holdings-repository.ts
│   │   │   ├── components/holdings-table.tsx, inline-edit-cell.tsx, bulk-edit-dialog.tsx
│   │   │   ├── core/
│   │   │   │   ├── editable-fields.ts    # Which fields can be edited + mappings
│   │   │   │   ├── merge-holding.ts      # Merge base + edit overlay
│   │   │   │   └── export-csv.ts         # Export to CSV
│   │   │   ├── hooks/use-holdings.ts, use-holding-mutations.ts, use-export-holdings.ts
│   │   │   ├── types.ts
│   │   │   └── *.test.ts
│   │   │
│   │   ├── import/
│   │   │   ├── api/supabase-import-repository.ts
│   │   │   ├── components/upload-step.tsx, import-wizard.tsx, import-history.tsx
│   │   │   ├── core/                     # Pure import logic (100% tested)
│   │   │   │   ├── read-workbook.ts      # XLSX → raw rows
│   │   │   │   ├── locate-header-row.ts  # Find header by label matching
│   │   │   │   ├── column-mapping.ts     # ColumnMapping registry
│   │   │   │   ├── map-rows.ts           # Raw rows → domain objects
│   │   │   │   ├── validate-rows.ts      # Identify entirely blank rows
│   │   │   │   ├── check-parcel-counts.ts # Validate parcel count totals
│   │   │   │   ├── build-holding-records.ts # Build final insert records
│   │   │   │   ├── detect-association-type.ts # Parse "القطاع" row
│   │   │   │   ├── dedup-key.ts          # Generate dedup keys
│   │   │   │   ├── preview-summary.ts    # Build preview stats
│   │   │   │   └── *.test.ts (8 test files)
│   │   │   ├── hooks/use-import-preview.ts, use-commit-import.ts, use-import-history.ts
│   │   │   ├── types.ts
│   │   │   └── schemas/preview-response-schema.ts
│   │   │
│   │   ├── review/
│   │   │   ├── api/supabase-review-repository.ts
│   │   │   ├── components/review-queue-table.tsx, approve-dialog.tsx, reject-dialog.tsx
│   │   │   ├── hooks/use-review-queue.ts, use-review-mutations.ts
│   │   │   ├── types.ts
│   │   │   └── *.test.ts
│   │   │
│   │   ├── audit/
│   │   │   ├── api/supabase-audit-repository.ts
│   │   │   ├── components/audit-page-content.tsx, holding-edit-diff-view.tsx
│   │   │   ├── core/audit-csv-writer.ts
│   │   │   ├── hooks/use-audit-feed.ts, use-holding-edit-diff.ts
│   │   │   ├── types.ts
│   │   │   └── *.test.ts
│   │   │
│   │   ├── analytics/
│   │   │   ├── api/supabase-analytics-repository.ts
│   │   │   ├── components/
│   │   │   │   ├── analytics-tabs.tsx    # Tab shell
│   │   │   │   ├── system-overview-board.tsx
│   │   │   │   ├── city-drilldown-board.tsx
│   │   │   │   └── quality-board.tsx
│   │   │   ├── hooks/use-system-overview.ts, use-city-analytics.ts, use-quality.ts, use-team-activity.ts
│   │   │   ├── registry/quality-rules.ts # Quality metric definitions
│   │   │   ├── types.ts
│   │   │   └── *.test.ts
│   │   │
│   │   ├── export/
│   │   │   ├── api/supabase-export-repository.ts
│   │   │   ├── components/export-dialog.tsx
│   │   │   ├── core/
│   │   │   │   ├── build-unified-dataset.ts # Merge export view to camelCase
│   │   │   │   ├── excel-mapper.ts         # Map dataset → 25-column Excel schema
│   │   │   │   ├── excel-writer.ts         # Write workbook + download
│   │   │   │   └── *.test.ts
│   │   │   ├── hooks/use-export-holdings.ts
│   │   │   ├── types.ts
│   │   │   └── *.test.ts
│   │   │
│   │   ├── users/
│   │   │   ├── api/supabase-users-repository.ts
│   │   │   ├── components/users-table.tsx, invite-dialog.tsx
│   │   │   ├── hooks/use-users.ts, use-user-mutations.ts
│   │   │   ├── schemas/invite-schema.ts
│   │   │   ├── types.ts
│   │   │   └── *.test.ts
│   │   │
│   │   └── notifications/
│   │       ├── hooks/use-notification-counts.ts
│   │       └── types.ts
│   │
│   ├── components/
│   │   ├── ui/                           # shadcn/ui primitives (Radix)
│   │   │   ├── button.tsx, card.tsx, table.tsx, dialog.tsx, etc.
│   │   │   └── sonner.tsx                # Toast notifications
│   │   │
│   │   └── shared/                       # Cross-feature components
│   │       ├── app-sidebar.tsx           # Main navigation
│   │       ├── app-topbar.tsx            # Top bar + user menu
│   │       ├── page-header.tsx           # Page title/description
│   │       ├── data-table.tsx            # Reusable paginated table
│   │       ├── data-table-pagination.tsx
│   │       ├── stat-card.tsx             # KPI card
│   │       ├── empty-state.tsx
│   │       ├── error-state.tsx
│   │       └── theme-toggle.tsx
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts                 # Browser-side client (useEffect)
│   │   │   ├── server.ts                 # Server-side client (Server Components)
│   │   │   ├── service.ts                # Service-level client (with service role key)
│   │   │   ├── middleware.ts             # Session refresh + auth guard
│   │   │   ├── require-admin.ts          # Admin-only middleware
│   │   │   └── database.types.ts         # GENERATED from Supabase schema
│   │   ├── constants.ts                  # TABLES, ROLES, STATUSES, ASSOCIATION_TYPES
│   │   ├── errors.ts                     # AppError, fromSupabaseError()
│   │   ├── format.ts                     # Formatting utilities
│   │   ├── result.ts                     # Result<T, E> type
│   │   ├── query-keys.ts                 # React Query key factory
│   │   ├── utils.ts                      # General utilities (cn, classnames)
│   │   └── i18n.ts                       # i18n setup (if any)
│   │
│   ├── hooks/
│   │   └── use-mobile.ts                 # Mobile viewport detection
│   │
│   ├── middleware.ts                     # Next.js auth middleware
│   ├── app.config.ts                     # next.config.js equivalent
│   ├── globals.css                       # CSS variables (light/dark themes)
│   └── env.ts                            # Environment variable validation
│
├── supabase/
│   ├── migrations/                       # SQL migrations (numbered)
│   │   ├── 20260801000001_import_commit_rpc.sql
│   │   ├── 20260801000003_review_and_audit.sql
│   │   ├── 20260801000004_analytics.sql
│   │   ├── 20260801200000_city_association_type.sql
│   │   ├── 20260801200500_person_id.sql
│   │   ├── 20260801200760_unified_holdings_export_view.sql
│   │   └── ... (55+ migrations total)
│   └── seed.sql                          # Test data
│
├── e2e/
│   ├── phase-0.spec.ts                   # Foundation gate
│   ├── phase-1.spec.ts                   # Import & Holdings
│   ├── phase-2.spec.ts                   # Review & Audit
│   ├── phase-3.spec.ts                   # Analytics
│   ├── phase-4.spec.ts                   # Export
│   ├── phase-5.spec.ts                   # Users & Settings
│   └── fixtures/                         # Test data files
│
├── docs/
│   ├── reference/                        # ← You are here
│   │   └── DASHBOARD_REFERENCE.md
│   ├── migration-guides/
│   └── troubleshooting/
│
├── package.json                          # Dependencies
├── tsconfig.json                         # TypeScript config (strict: true)
├── next.config.js
├── tailwind.config.ts                    # Tailwind v4
├── eslint.config.js
├── prettier.config.js
├── vitest.config.ts
├── playwright.config.ts
│
├── CLAUDE.md                             # Project guidelines
├── AGENTS.md                             # Agent-specific instructions
├── APP_PLAN.md                           # Flutter app spec (schema authority)
├── DASHBOARD_PLAN.md                     # Dashboard spec & design decisions
├── EXPORT_IMPLEMENTATION_SUMMARY.md      # Export feature details
├── DASHBOARD_ID_ALIGNMENT.md             # ID field mappings
└── README.md                             # Getting started
```

---

## Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Framework** | Next.js 15 (App Router) | Server Components run heavy queries server-side; Route Handlers for Excel parsing |
| **Language** | TypeScript (strict) | Schema types generated from Supabase; column rename = compile error |
| **Styling** | Tailwind CSS v4 | Logical properties for RTL (`ps-*`, `pe-*` instead of `pl-*`, `pr-*`) |
| **Components** | shadcn/ui (Radix) | Owned (copied into repo), themable via CSS variables, accessible |
| **Theming** | next-themes | Class-based dark mode, no flash-of-wrong-theme |
| **State Mgmt** | React 19 hooks | Server Components + Client Components split |
| **Server State** | TanStack Query v5 | Caching, deduplication, background refetch, optimistic updates |
| **Tables** | TanStack Table v8 | Headless; sorting/filtering/pagination separate from rendering |
| **Forms** | react-hook-form + Zod | Single source of truth for validation & type inference |
| **Charts** | Recharts | Composable, themeable, React-native |
| **Excel** | SheetJS (xlsx) | Server-side only (never parse 5MB in browser) |
| **Backend** | Supabase (Postgres 14) | Auth, Storage, Real-time, RPCs |
| **Auth SDK** | @supabase/ssr | Cookie-based sessions for Server Components + middleware |
| **Tests** | Vitest + React Testing Library | Fast, native ESM, familiar Jest API |
| **E2E** | Playwright | Each phase has an E2E gate (phase-*.spec.ts) |
| **Linting** | ESLint + Prettier | typescript-eslint strict, enforced in CI |
| **Hosting** | Vercel | Zero-config Next.js, preview deploys per PR |
| **Font** | Tajawal (Google Fonts) | Arabic-optimized, matches mobile app |
| **Locale** | Arabic RTL | `<html lang="ar" dir="rtl">`, Western numerals (0-9) |

---

## Authentication & Authorization

### Auth Flow

1. **Unauthenticated user** visits `/login`
2. **Login form** (`src/features/auth/components/login-form.tsx`)
   - Email + password input
   - Calls `supabase.auth.signInWithPassword()`
   - Supabase returns session token (stored in secure HTTP-only cookie)
3. **Middleware** (`src/lib/supabase/middleware.ts`) on every request:
   - Refreshes session via `@supabase/ssr`
   - Validates user.role in `profiles` table
   - Rejects `field` role (mobile-app-only) with redirect to `/login`
   - Rejects inactive users with `signOut()` + redirect
4. **Protected routes** under `(dashboard)` group require valid session
5. **Sign out** clears session cookie + redirects to `/login`

### Roles & Permissions

**Database roles (Postgres enums):**

```typescript
const ROLES = {
  admin: "admin",      // Full access: import, edit, delete, manage users
  editor: "editor",    // Can import, edit holdings, view audit
  viewer: "viewer",    // Read-only; cannot modify data
  field: "field",      // Mobile app only; cannot access dashboard
} as const;
```

**RLS Policies (per table):**

- **`profiles`** — only users can read their own; admins can read all
- **`cities`** — authenticated users read; editor+ write
- **`holdings`** — read per city; editor+ write
- **`holding_edits`** — read own edits; insert on apply; read all on audit
- **`added_holdings`** — read per city; field users create; editor+ approve/reject
- **`import_batches`** — read per city; editor+ write
- **`audit_feed`** — read-only; populated by triggers
- **`quality_snapshots`** — read per city; system-level insert

**Check at route level via middleware; RLS is defense-in-depth.**

---

## Navigation & URL Structure

### Route Hierarchy

```
/login                                     # Public, unauthenticated
/                                          # Dashboard home (System Overview)
/cities                                    # Cities list
/cities/[cityId]                           # City drilldown (analytics)
/cities/[cityId]/holdings                  # Holdings table (searchable, paginated)
/cities/[cityId]/import                    # Import wizard + history
/cities/[cityId]/activity                  # City activity (optional)
/cities/[cityId]/quality                   # Quality metrics (per-city)
/review                                    # Review queue (all app-added holdings)
/audit                                     # Audit feed (all changes, all cities)
/analytics                                 # System analytics dashboard
/users                                     # User management
/settings                                  # City archive/delete
```

### Dynamic Routes

- **`[cityId]`** — UUID from `cities.id` table; passed as Promise via Next.js params
- All city-scoped pages validate `cityId` exists via React Query (fail to empty state if not)

### Navigation Component

**`AppSidebar`** (`src/components/shared/app-sidebar.tsx`):
- Lists all published cities (fetched on mount via `useCities()`)
- Top nav: Home, Cities, Analytics
- Bottom nav: Review, Audit, Users, Settings
- Current user info + Sign Out button

---

## State Management

### Data Fetching (React Query v5)

**Provider setup** (`src/app/providers.tsx`):

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,           // 30s before refetch
      refetchOnWindowFocus: false, // Don't auto-refetch on focus
    },
  },
});
```

**Query key organization** (`src/lib/query-keys.ts`):

```typescript
export const queryKeys = {
  cities: {
    all: ["cities"],
    list: (filters?) => ["cities", "list", filters],
    detail: (cityId) => ["cities", "detail", cityId],
  },
  holdings: {
    all: ["holdings"],
    list: (cityId, filters?) => ["holdings", "list", cityId, filters],
    detail: (holdingId) => ["holdings", "detail", holdingId],
  },
  // ... audit, imports, review, analytics, users, profile
};
```

**Hook pattern:**

```typescript
export function useHoldings(params: HoldingsListParams) {
  return useQuery({
    queryKey: queryKeys.holdings.list(params.cityId, { ... }),
    queryFn: async () => {
      const repo = createSupabaseHoldingsRepository(createClient());
      const result = await repo.list(params);
      if (!result.ok) throw result.error;
      return result.value;
    },
    enabled: Boolean(params.cityId), // Don't fetch until cityId available
  });
}
```

### UI State (React Hooks)

**Local component state** via `useState`:
- Form inputs (text, checkboxes, selects)
- Modal open/close
- Tab selection
- Dropdown menus
- Loading spinners

**Derived state:**
- Filtered/sorted table rows computed via TanStack Table
- Expanded/collapsed rows via component state

**No external state management** (Redux, Zustand, Jotai) — React hooks + React Query suffice.

### Forms (react-hook-form + Zod)

**Pattern:**

```typescript
const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

type FormData = z.infer<typeof schema>;

function MyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("name")} />
      {errors.name && <span>{errors.name.message}</span>}
    </form>
  );
}
```

**Single Zod schema per entity** (e.g., `src/features/cities/schemas/city-schema.ts`):
- Used for client-side validation
- Used for server-side API validation
- Type-safe form data via `z.infer<>`

---

## API Layer & Repositories

### Repository Pattern

**Every feature has:**

1. **Interface** (`types.ts`) — the contract
2. **Implementation** (`api/supabase-*.ts`) — Supabase backing
3. **Hooks** (`hooks/use-*.ts`) — React Query consumers

**Example: HoldingsRepository**

```typescript
// types.ts
export interface HoldingsRepository {
  list(params: HoldingsListParams): Promise<Result<HoldingsListResult, AppError>>;
  applyEdit(input: ApplyEditInput): Promise<Result<undefined, AppError>>;
  bulkApplyField(input: BulkApplyFieldInput): Promise<Result<number, AppError>>;
  listAllForExport(cityId: string, filters?): Promise<Result<MergedHolding[], AppError>>;
  listBasins(cityId: string): Promise<Result<string[], AppError>>;
}

// api/supabase-holdings-repository.ts
export function createSupabaseHoldingsRepository(
  supabase: SupabaseClient<Database>,
): HoldingsRepository {
  return {
    async list(params) { /* ... */ },
    async applyEdit(input) { /* ... */ },
    // ...
  };
}

// hooks/use-holdings.ts
export function useHoldings(params: HoldingsListParams) {
  return useQuery({
    queryKey: queryKeys.holdings.list(...),
    queryFn: async () => {
      const repo = createSupabaseHoldingsRepository(createClient());
      const result = await repo.list(params);
      if (!result.ok) throw result.error;
      return result.value;
    },
  });
}
```

### Error Handling (Result Type)

**All repository methods return `Result<T, AppError>`** (never throw):

```typescript
type Result<T, E> = 
  | { ok: true; value: T }
  | { ok: false; error: E };

// Usage
const result = await repo.list(params);
if (!result.ok) {
  toast.error(result.error.message);
  return;
}
const data = result.value; // T is guaranteed
```

**Benefits:**
- Errors are not exceptional; they're normal values
- Type system enforces error checking
- No try/catch pollution
- Easier testing

---

## Supabase Integration

### Clients

**Two clients:**

1. **Browser client** (`lib/supabase/client.ts`)
   - Used in `"use client"` components
   - No service role (security)
   - RLS policies enforce row-level access

2. **Server client** (`lib/supabase/server.ts`)
   - Used in Server Components and Route Handlers
   - Uses `@supabase/ssr` for cookie-based sessions
   - No service role

**Service client** (`lib/supabase/service.ts`):
- Used only in specific RPC calls
- Service role key (bypasses RLS for admin operations)
- Rare; prefer cookie-based clients

### Session Management

**`@supabase/ssr`** handles:
- Session stored in HTTP-only, Secure, SameSite cookies
- Middleware refreshes session on every request
- Server Components read session via `supabase.auth.getUser()`
- Client Components use `useCurrentProfile()` hook

### Database Client Injection

**Hard rule: `createClient()` called in exactly 2 files**

- `lib/supabase/server.ts`
- `lib/supabase/client.ts`

Everywhere else receives a repository:

```typescript
// ❌ NEVER
const supabase = createClient();
const { data } = await supabase.from("holdings").select("*");

// ✅ ALWAYS
const repo = createSupabaseHoldingsRepository(createClient());
const result = await repo.list(params);
```

### Real-Time Features

**Not currently used.** Downstream sync is "re-download on next open."

**If added in future:**
- Use `supabase.realtime.on()` in a Server Component
- Wrap with `useEffect` cleanup
- Update React Query cache via `queryClient.setQueryData()`

---

## Database Schema Overview

### Core Tables

| Table | Purpose | Key Columns |
|-------|---------|------------|
| **profiles** | Users & roles | `id` (FK auth.users), `role`, `is_active`, `display_name`, `email` |
| **cities** | Associations (جمعيات) | `id` (UUID), `name`, `association_type`, `status`, `administration`, `directorate` |
| **holdings** | Imported parcels | `id` (UUID), `city_id`, `unified_number` (dedup key), `holder_name`, `feddan/qirat/sahm`, `is_stale` |
| **holding_edits** | Corrections to holdings | `id`, `holding_id`, `payload` (full snapshot), `edited_by`, `edited_at` |
| **holding_edits_latest** | View of latest edit per holding | Materialized for performance |
| **added_holdings** | App-created holdings (pending) | `id`, `city_id`, `status` (pending/approved/rejected), `created_by`, `reviewed_by` |
| **import_batches** | Import history | `id`, `city_id`, `file_name`, `status` (committed/failed), `rows_total`, `rows_imported` |
| **quality_snapshots** | Historical quality metrics | `id`, `city_id`, `captured_at`, metrics (JSON) |
| **admin_actions** | Audit trail for system actions | `id`, `entity_type` (city/holding/import), `action_type`, `actor_id`, `details` |

### Views (For Analytics & Export)

| View | Purpose |
|------|---------|
| **holdings_with_merged_edits** | Holdings with latest edits applied |
| **added_holdings_with_merged_edits** | Added holdings with edits applied |
| **unified_holdings_export** | All holdings + added_holdings merged + fully decorated (city name, person ID, association type, classifications, etc.) |
| **system_overview** | System-wide KPIs (total holdings, cities, last import, data quality) |
| **city_drilldown** | City-specific metrics |
| **city_basin_breakdown** | Holdings per basin in a city |
| **city_top_holders** | Top N holders by area in a city |
| **city_field_completeness** | % of fields with data per city |
| **city_quality_issues** | Data quality rules violations (missing holders, zero areas, etc.) |
| **team_activity** | User activity metrics (records added, edits, etc.) |
| **audit_feed** | All changes (imports, edits, approvals, rejections, etc.) |

### Constraints & Rules

**`cities`:**
- Unique `name` per directorate
- Check constraint: `association_subtype` valid for `association_type`

**`holdings`:**
- Unique `(city_id, unified_number)` where `unified_number` is not null
- `feddan`, `qirat`, `sahm` ≥ 0
- `is_stale` = false for current data

**`holding_edits`:**
- `payload` is full snapshot (all EDITABLE_FIELDS)
- Ordered by `edited_at` (chronological edit trail)

**`added_holdings`:**
- `status` = pending|approved|rejected
- If approved, `promoted_holding_id` references the final holdings row

### Enums

```sql
create type association_type as enum (
  'agricultural_credit',   -- الائتمان الزراعي
  'agricultural_reform'    -- الإصلاح الزراعي
);

create type record_status as enum (
  'pending',      -- awaiting review
  'approved',     -- approved by editor
  'rejected'      -- rejected; see rejection_reason
);

create type import_batch_status as enum (
  'pending',
  'previewing',
  'committed',
  'failed',
  'rolled_back'
);
```

---

## Page-by-Page Documentation

### `/login` — Login Page

**Entry Point:** `src/app/(auth)/login/page.tsx`

**Components:**
- `LoginForm` (`features/auth/components/login-form.tsx`)
  - Email + password inputs
  - Submit button
  - Error messages

**Data Sources:**
- `supabase.auth.signInWithPassword()`

**Mutations:**
- `useLogin()` — React Query mutation

**Validation:**
- Zod schema: `loginSchema` (`features/auth/schemas/login-schema.ts`)
  - email: valid email format
  - password: min 8 chars (Supabase requirement)

**Business Rules:**
- No login without email/password
- Invalid credentials show "Invalid email or password"
- On success, redirect to `/`
- On failure, display error toast

**UI Flow:**
1. User lands on `/login`
2. Enters email + password
3. Clicks "Sign In"
4. Form validation runs (Zod)
5. If valid, calls `supabase.auth.signInWithPassword()`
6. On success, middleware redirects to `/`
7. On failure, shows error

**Data Flow:**
```
Form Input
    ↓
Zod Validation (client-side)
    ↓
useLogin() mutation
    ↓
supabase.auth.signInWithPassword()
    ↓
Server sets session cookie
    ↓
Middleware refreshes session, routes to `/`
```

**Error Handling:**
- Network error → "Unable to connect"
- Invalid credentials → "Invalid email or password"
- Server error → "An error occurred; please try again"

**Loading State:**
- Submit button disabled while request in flight
- Spinner shown

---

### `/` — System Overview / Home

**Entry Point:** `src/app/(dashboard)/page.tsx`

**Components:**
- `SystemOverviewBoard` (`features/analytics/components/system-overview-board.tsx`)
  - System-wide KPIs (stat cards)
  - Charts (holdings distribution by city, recent activity)

**Data Sources:**
- `useSystemOverview()` — React Query
  - Fetches `system_overview` Postgres view

**Queries:**
- `system_overview` view
  - Total cities
  - Total holdings
  - Last import date
  - Data quality score (% with holder name, national ID, etc.)

**Business Rules:**
- Show only published cities (status = 'published')
- Data quality calculated from holdings table

**UI Flow:**
1. Page loads
2. Fetches system overview
3. Renders stat cards + charts
4. On error, shows error state

**Data Flow:**
```
System Overview Page
    ↓
useSystemOverview() hook
    ↓
React Query caches result (staleTime: 30s)
    ↓
Renders stat cards + charts
```

---

### `/cities` — Cities List

**Entry Point:** `src/app/(dashboard)/cities/page.tsx`

**Components:**
- `CitiesList` (`features/cities/components/cities-list.tsx`)
  - Paginated table
  - Click city → navigate to city detail

**Data Sources:**
- `useCities()` — React Query
  - Fetches all cities with stats
  - Holdings count per city
  - Last import timestamp

**Queries:**
- `cities` table (with joins to `holdings` count, `import_batches` latest)

**Business Rules:**
- Show all cities regardless of status
- Admin can see all; editors see all
- Click city → `/cities/[cityId]`

**UI Flow:**
1. Page loads
2. Fetches all cities
3. Renders table
4. Click row → navigate

**Data Flow:**
```
Cities List Page
    ↓
useCities() hook
    ↓
React Query caches (staleTime: 30s)
    ↓
Render table with city names, status, holdings count, last import
```

---

### `/cities/[cityId]` — City Drilldown (Analytics)

**Entry Point:** `src/app/(dashboard)/cities/[cityId]/page.tsx`

**Components:**
- `CityDrilldownBoard` (`features/analytics/components/city-drilldown-board.tsx`)
  - City name, status, association type
  - Holdings breakdown by basin (chart)
  - Top 10 holders (chart)
  - Field completeness (% with data per field)
  - Quality issues (violations)

**Data Sources:**
- `useCityAnalytics(cityId)` — React Query
  - `city_drilldown()` RPC
  - `city_basin_breakdown` view
  - `city_top_holders` view
  - `city_field_completeness` view
  - `city_quality_issues` view

**Queries:**
```sql
-- RPC returns: total holdings, total area, last import, etc.
SELECT city_drilldown(p_city_id)

-- Basins breakdown
SELECT * FROM city_basin_breakdown WHERE city_id = ?

-- Top 10 holders
SELECT * FROM city_top_holders WHERE city_id = ? LIMIT 10

-- Field completeness
SELECT * FROM city_field_completeness WHERE city_id = ?

-- Quality issues
SELECT * FROM city_quality_issues WHERE city_id = ?
```

**Business Rules:**
- Only show published cities (check in UI; RLS enforces read)
- Basins sorted by holdings count descending
- Holders sorted by total feddan descending
- Quality issues pre-defined (see `quality-rules.ts`)

**UI Flow:**
1. Page loads with cityId
2. Fetches city drilldown data
3. Renders cards + charts
4. Charts interactive (hover, click, drill down)

**Data Flow:**
```
City Drilldown Page (cityId)
    ↓
useCityAnalytics(cityId) hook
    ↓
Multiple queries in parallel
    ├─ city_drilldown() RPC
    ├─ city_basin_breakdown
    ├─ city_top_holders
    ├─ city_field_completeness
    └─ city_quality_issues
    ↓
React Query dedupes + caches
    ↓
Render charts + cards
```

---

### `/cities/[cityId]/holdings` — Holdings Table

**Entry Point:** `src/app/(dashboard)/cities/[cityId]/holdings/page.tsx`

**Components:**
- `HoldingsTable` (`features/holdings/components/holdings-table.tsx`)
  - Paginated, sortable, filterable table
  - Inline edit (click cell → edit → save)
  - Bulk edit (select rows → edit field → apply to all)
  - Column selection (hide/show columns)
  - Search (holder name, national ID, unified number)
  - Basin filter

**Data Sources:**
- `useHoldings(params)` — React Query
  - Paginated, server-side
  - Holdings with latest edits merged

**Mutations:**
- `useHoldingMutations()`
  - `applyEdit(holdingId, field, value)` — inline edit
  - `bulkApplyField(holdingIds, field, value)` — bulk edit

**Queries:**
```typescript
// Fetch holdings with pagination/sort/filter
const result = await repo.list({
  cityId,
  pageIndex: 0,
  pageSize: 50,
  sortBy: "holder_name",
  sortDirection: "asc",
  filters: {
    search: "محمد", // ilike search on holder_name, national_id, unified_number
    basinName: "البشيط",
  },
});
// Returns: rows (MergedHolding[]), totalCount

// Fetch basins for filter dropdown
const basins = await repo.listBasins(cityId); // ['البشيط', 'السرو', ...]
```

**Validation:**
- Zod schemas per field type (text, number)
- Max length validations
- National ID: 14 digits regex

**Business Rules:**
- Editable fields only: holder_name, national_id, land_number, page_number, basin_name, basin_code, administration, directorate, borders, area (feddan/qirat/sahm), total_sqm
- Identifiers (holding_id_number, unified_number, imported_at) immutable
- Edits create `holding_edits` row with full payload snapshot
- Display shows merged base + latest edit
- Can search by unified_number, holder_name, national_id
- Can filter by basin_name
- Sorting by any column

**UI Flow:**
1. Page loads with cityId
2. Fetches holdings page 1 (50 rows)
3. Render table
4. **Inline edit:** click cell → input appears → blur/Enter → saves via `applyEdit()`
5. **Bulk edit:** select rows → click "Edit field" → dialog → apply
6. **Search/filter:** enter text or select basin → re-fetch with new filters
7. **Sort:** click column header → re-fetch sorted

**Data Flow:**
```
Holdings Table (cityId)
    ↓
useHoldings(params) hook
    ↓
React Query fetches with page/sort/filter
    ↓
Repository merges base holdings + latest edits_latest
    ↓
Render table
    ↓
User edits cell
    ↓
useHoldingMutations().applyEdit()
    ↓
INSERT into holding_edits (full payload snapshot)
    ↓
React Query invalidates queryKeys.holdings.list(cityId)
    ↓
Re-fetch
    ↓
Render updated row
```

**Error Handling:**
- Validation error → show field error message
- Save error → show toast "Failed to save"
- Network error → retry button

**Loading State:**
- Skeleton rows while fetching
- Spinner in save button

---

### `/cities/[cityId]/import` — Import Wizard

**Entry Point:** `src/app/(dashboard)/cities/[cityId]/import/page.tsx`

**Components:**
- `ImportWizard` (`features/import/components/import-wizard.tsx`)
  - Upload file step
  - Preview step (summary, detected association type, warnings)
  - Confirm step (commit to database)
- `ImportHistory` (`features/import/components/import-history.tsx`)
  - List of past imports (committed, failed)
  - Rollback button (if admin)

**Data Sources:**
- `useImportPreview()` — React Query mutation
  - Uploads file to `/api/import/preview`
  - Returns parsed preview (no database write yet)

**API Endpoints:**

```typescript
// POST /api/import/preview
// Request: FormData { file, cityId }
// Response: {
//   preview: {
//     rowsFound, rowsValid, rowsBlank, rowsNew, rowsDuplicate,
//     detectedAssociationType, skippedSheets
//   },
//   parcelMismatches: [{ row, expected, actual }],
//   records: [ { holding fields } ],
//   mappingUsed: { field: label }
// }
```

**Validation:**
- File must be .xlsx
- Must have "جميع البيانات" sheet
- Must have header row (matched by labels)
- Rows with any real data imported (blanks skipped)
- Parcel counts checked but not enforced (warning only)

**Business Rules:**
- Association type detected from row 1 ("القطاع : الائتمان الزراعي" / "الإصلاح الزراعي")
- If detected, auto-set on city (if null) after import succeeds
- Dedup by `unified_number`; existing holdings with same number updated (not re-inserted)
- All existing holdings without this unified_number marked stale
- Blank rows (no data in any field) skipped; never imported
- Parcel count validation: check `COUNT(*) = parcelCountCheck` per row (warn, don't fail)

**UI Flow:**
1. Page loads
2. **Step 1 (Upload):** Select file → click "Preview"
3. **Step 2 (Preview):** Shows summary
   - Rows found, valid, blank, duplicates
   - Detected association type (+ dropdown to override)
   - Skipped sheets listed
   - Parcel count mismatches (if any)
   - Warnings (no dismissal; just informational)
4. Click "Confirm & Import"
5. **Step 3 (Confirm):** Progress bar while committing
6. On success: summary (rows imported, duplicates, failures)
7. Redirect to history

**Data Flow:**
```
Upload Step
    ↓
User selects .xlsx file
    ↓
Click "Preview"
    ↓
useImportPreview() mutation
    ↓
POST /api/import/preview
    ↓
Server:
  1. readWorkbook(buffer)
  2. locateHeaderRow(rows, mapping)
  3. mapRows(rows, header, mapping)
  4. validateRows(mappedRows) → skip blanks
  5. detectAssociationType(firstRow)
  6. buildPreviewSummary()
    ↓
Return preview + records
    ↓
Preview Step (display)
    ↓
User clicks "Confirm & Import"
    ↓
useCommitImport() mutation
    ↓
RPC commit_import_batch({
  p_city_id, p_file_name, p_records, ...
})
    ↓
Server:
  1. INSERT into import_batches
  2. Mark old holdings is_stale = true
  3. INSERT/UPSERT holdings
    ↓
React Query invalidates queryKeys.holdings, queryKeys.imports
    ↓
Render success summary
```

**Error Handling:**
- File parse error → "Invalid Excel file"
- Missing sheet → "Sheet 'جميع البيانات' not found"
- Missing header → "Header row not found"
- Commit failure → "Import failed; see details"

**Loading State:**
- File upload: spinner
- Preview: skeleton rows
- Commit: progress bar

---

### `/review` — Review Queue

**Entry Point:** `src/app/(dashboard)/review/page.tsx`

**Components:**
- `ReviewQueueTable` (`features/review/components/review-queue-table.tsx`)
  - Table of `added_holdings` with status = pending
  - Inline approve/reject buttons (or dialogs)
  - Edit fields before approving (optional)

**Data Sources:**
- `useReviewQueue()` — React Query
  - Fetches all pending `added_holdings`

**Mutations:**
- `useReviewMutations()`
  - `approve(addedHoldingId, holdingIdNumber?)` — RPC `approve_added_holding`
  - `reject(addedHoldingId, reason)` — RPC `reject_added_holding`

**Queries:**
```sql
-- Fetch all pending added_holdings
SELECT * FROM added_holdings 
WHERE status = 'pending'
ORDER BY created_at DESC

-- After approval, a new holdings row is created with holding_id_number
-- and added_holding.promoted_holding_id FK set
```

**Validation:**
- holdingIdNumber: must be unique per city (if provided)
- Required fields: holder_name

**Business Rules:**
- Mobile app creates `added_holdings` with status = pending
- Auto-approved if no conflicts (feature enabled in migrations)
- Or pending human review if conflicts detected
- On approve: create `holdings` row with promoted_holding_id link back
- On reject: set status = rejected + reason
- Editable before approval (similar to holdings inline edit)

**UI Flow:**
1. Page loads
2. Fetches pending added_holdings
3. Render table
4. For each row:
   - "Approve" button → dialog confirm → RPC approve
   - "Reject" button → dialog with reason input → RPC reject
   - "Edit" link → opens holding editor

**Data Flow:**
```
Review Queue Page
    ↓
useReviewQueue() hook
    ↓
Fetch added_holdings (status = pending)
    ↓
Render table
    ↓
User clicks Approve
    ↓
Dialog prompts for holding_id_number (optional)
    ↓
useReviewMutations().approve(id, holdingIdNumber)
    ↓
RPC approve_added_holding
    ↓
Creates holdings row (if not exists)
    ↓
Sets added_holdings.promoted_holding_id
    ↓
React Query invalidates queryKeys.review
    ↓
Refresh list
```

---

### `/audit` — Audit Feed

**Entry Point:** `src/app/(dashboard)/audit/page.tsx`

**Components:**
- `AuditPageContent` (`features/audit/components/audit-page-content.tsx`)
  - Chronological feed of audit entries
  - Each entry: timestamp, user, entity type, action, details
  - Click entry to see edit diff (if holding edit)

**Data Sources:**
- `useAuditFeed()` — React Query
  - Fetches `audit_feed` view (up to 200 latest)
  - Joins with `profiles` for user names

**Queries:**
```sql
-- Fetch audit feed
SELECT * FROM audit_feed
ORDER BY occurred_at DESC
LIMIT 200
-- Columns: entity_type, entity_id, city_id, user_id, occurred_at, details
```

**Business Rules:**
- Audit trail populated by database triggers (not app)
- Entity types: holding_edit, added_holding_created, added_holding_approved, added_holding_rejected, import_batch_created, city_created, city_updated, city_deleted, etc.
- One entry per action (not per row affected)
- Details column (JSON) holds action-specific info

**UI Flow:**
1. Page loads
2. Fetches audit feed
3. Render chronological list (newest first)
4. Click entry → drill-down detail view
5. If holding edit, show before/after values

**Data Flow:**
```
Audit Feed Page
    ↓
useAuditFeed() hook
    ↓
Fetch audit_feed view (200 entries)
    ↓
Join with profiles (user names/emails)
    ↓
Render feed
    ↓
User clicks entry
    ↓
Show detail (entity type, action, timestamp, user, changes)
```

---

### `/analytics` — Analytics Dashboard

**Entry Point:** `src/app/(dashboard)/analytics/page.tsx`

**Components:**
- `AnalyticsTabs` (`features/analytics/components/analytics-tabs.tsx`)
  - Tabs: System Overview, Quality, Team Activity
  - System Overview: same as home page
  - Quality: data quality metrics per city
  - Team Activity: user stats (records added, edits, etc.)

**Data Sources:**
- `useSystemOverview()` — system-wide metrics
- `useQuality(cityId?)` — quality issues per city
- `useTeamActivity()` — user activity stats

**Business Rules:**
- Quality rules pre-defined (see `quality-rules.ts`)
- Examples: missing holder_name, missing national_id, zero area, etc.
- Team activity aggregated from audit trail

---

### `/users` — User Management

**Entry Point:** `src/app/(dashboard)/users/page.tsx`

**Components:**
- `UsersTable` (`features/users/components/users-table.tsx`)
  - List all users
  - Invite new user (email → sends invite link)
  - Deactivate user
  - Change role (admin/editor/viewer)

**Data Sources:**
- `useUsers()` — React Query
  - Fetches all `profiles`

**Mutations:**
- `useUserMutations()`
  - `inviteUser(email)` — POST `/api/users/invite`
  - `updateRole(userId, role)` — direct update
  - `deactivate(userId)` — set is_active = false

**Validation:**
- Email: valid format
- Role: admin, editor, viewer

**Business Rules:**
- Admin can create/manage users
- Invite sends email with magic link (Supabase Auth)
- On invite, `profiles` row created with is_active = false
- User activates by setting password via email link
- Can't delete users (only deactivate)

---

### `/settings` — Settings

**Entry Point:** `src/app/(dashboard)/settings/page.tsx`

**Components:**
- `SettingsCitiesTable` (`features/cities/components/settings-cities-table.tsx`)
  - List all cities
  - Archive (soft delete; set status = archived)
  - Hard delete (cascade deletes all related data)

**Mutations:**
- `useCityMutations()`
  - `archive(cityId)` — set status = archived
  - `delete(cityId)` — hard delete via RPC

**Business Rules:**
- Archive hides from cities list but keeps data
- Hard delete cascades: holdings, edits, imports, etc.
- Requires admin role
- Confirmation dialog before delete

---

## Feature Modules

### Auth Module

**Purpose:** Login, session management, current user profile.

**Files:**
- `types.ts` — `DashboardProfile`, `AuthRepository` interface
- `api/supabase-auth-repository.ts` — login, logout, getCurrentProfile
- `hooks/use-current-profile.ts` — React Query hook
- `components/login-form.tsx` — form component
- `schemas/login-schema.ts` — Zod validation

**Key Functions:**
- `useCurrentProfile()` — get current user profile (name, role, email)
- `useLogin()` — login mutation
- `getCurrentProfile()` — fetch from profiles table joined with auth.users

**Validation:**
- Email format
- Password min 8 chars

**Integration with Flutter App:**
- Same Supabase Auth instance
- Separate `field` role (mobile-only; blocked from dashboard)

---

### Cities Module

**Purpose:** CRUD operations on cities (جمعيات).

**Files:**
- `types.ts` — `City`, `CityWithStats`, `CityRepository` interface
- `api/supabase-cities-repository.ts` — list, create, update, delete, status changes
- `hooks/use-cities.ts`, `use-city.ts`, `use-city-mutations.ts` — React Query
- `components/cities-list.tsx`, `city-status-badge.tsx` — UI
- `schemas/city-schema.ts` — Zod validation

**Key Functions:**
- `useCities()` — fetch all cities with stats (holdings count, last import)
- `useCity(cityId)` — fetch single city
- `useCityMutations()` — create, update, setStatus, delete
- `deleteCascade(cityId)` — RPC hard delete

**Business Rules:**
- Cities grouped by directorate
- Status: draft, published, archived
- Association type (agricultural_credit or agricultural_reform) nullable until import
- Association subtype only valid if type set and matches whitelist

---

### Holdings Module

**Purpose:** Display, search, filter, edit individual holdings (parcels).

**Files:**
- `types.ts` — `MergedHolding`, `HoldingsRepository`, query/mutation interfaces
- `api/supabase-holdings-repository.ts` — list with pagination/sort/filter, apply edit, bulk apply, export
- `core/editable-fields.ts` — which fields are editable + mappings
- `core/merge-holding.ts` — merge base + edit overlay
- `core/export-csv.ts` — export to CSV
- `hooks/use-holdings.ts`, `use-holding-mutations.ts`, `use-export-holdings.ts` — React Query
- `components/holdings-table.tsx`, `inline-edit-cell.tsx`, `bulk-edit-dialog.tsx` — UI

**Key Functions:**
- `useHoldings(params)` — paginated, sorted, filtered list
- `useHoldingMutations()` — apply single edit, bulk edit
- `useExportHoldings()` — export to CSV
- `mergeHolding(base, edits)` — overlay edits on base
- `listBasins(cityId)` — get unique basin names for filter

**Business Rules:**
- Editable fields: holder_name, national_id, land_number, page_number, basin_name, basin_code, administration, directorate, borders, area, total_sqm
- Immutable: id, unified_number, holding_id_number, imported_at, is_stale
- Edits create full-snapshot payloads (not deltas)
- Display always shows merged (base + latest edit)
- Flutter app edits via `holding_edits.payload` with camelCase keys
- Dashboard must normalize camelCase → snake_case via EDIT_PAYLOAD_KEY_MAP
- Pagination server-side (never load all in memory)
- Search via ilike on holder_name, national_id, unified_number
- Filter by basin_name

---

### Import Module

**Purpose:** Parse Excel, preview, validate, commit to database.

**Files:**
- `types.ts` — `ImportBatchSummary`, `CommitImportInput/Result`, `ImportRepository`
- `api/supabase-import-repository.ts` — list history, commit via RPC, rollback
- `core/read-workbook.ts` — XLSX → raw rows
- `core/locate-header-row.ts` — find header by matching labels
- `core/column-mapping.ts` — ColumnMapping registry (data, not code)
- `core/map-rows.ts` — raw rows → domain objects
- `core/validate-rows.ts` — skip entirely blank rows
- `core/check-parcel-counts.ts` — validate parcel count totals (warning only)
- `core/build-holding-records.ts` — finalize records for insert
- `core/detect-association-type.ts` — parse row 1 for association type
- `core/dedup-key.ts` — generate dedup key from holding fields
- `core/preview-summary.ts` — build summary stats
- `hooks/use-import-preview.ts`, `use-commit-import.ts`, `use-import-history.ts` — React Query
- `components/upload-step.tsx`, `import-wizard.tsx`, `import-history.tsx` — UI

**Key Functions:**
- `useImportPreview()` — upload file, get preview (no database write)
- `useCommitImport()` — commit via RPC `commit_import_batch`
- `useImportHistory()` — list past imports per city
- `readWorkbook(buffer)` — parse XLSX
- `locateHeaderRow(rows, mapping)` — find header
- `mapRows(rows, header, mapping)` — transform to domain shape
- `validateRows(rows)` — identify blanks
- `detectAssociationType(rows)` — parse sector from row 1

**Core Logic (Fully Tested):**
- Each function testable in isolation (no React, no Supabase)
- 100% branch coverage on risky parsing logic
- Integration tested via E2E

**Business Rules:**
- Column mapping is data (ColumnMapping registry)
- Header matched by label text, not column position
- Rows with any real data imported (blanks skipped)
- Dedup by unified_number; existing holdings updated (not re-inserted)
- Old holdings without this unified_number marked stale
- Association type auto-detected; can be overridden
- If type detected/set, auto-update city.association_type (best-effort; not failing import if this fails)
- Parcel count check: warn if row's COUNT(*) ≠ parcelCountCheck (don't fail)
- Numeric fields coerced to text where needed (landNumber, pageNumber, basinCode)
- basinCode defaulted to "-1" if empty

**API Endpoint:**

```typescript
// POST /api/import/preview
// Server-side parse pipeline (never send 5MB to browser)
// Request: FormData { file: File, cityId: string }
// Response: {
//   preview: { rowsFound, rowsValid, rowsBlank, rowsNew, rowsDuplicate, detectedAssociationType, skippedSheets },
//   parcelMismatches: [],
//   records: [{...}],
//   mappingUsed: {...}
// }
```

---

### Review Module

**Purpose:** Approve/reject mobile app-added holdings.

**Files:**
- `types.ts` — `AddedHolding`, `ReviewListParams`, `ReviewRepository`
- `api/supabase-review-repository.ts` — list pending, approve, reject, update fields
- `hooks/use-review-queue.ts`, `use-review-mutations.ts` — React Query
- `components/review-queue-table.tsx`, `approve-dialog.tsx`, `reject-dialog.tsx` — UI

**Key Functions:**
- `useReviewQueue()` — fetch pending added_holdings
- `useReviewMutations()` — approve/reject via RPC
- `approve(addedHoldingId, holdingIdNumber?)` — RPC creates holdings row + sets promoted_holding_id
- `reject(addedHoldingId, reason)` — sets status = rejected + reason

**Business Rules:**
- Mobile app creates `added_holdings` with status = pending
- Some auto-approved (if no conflicts); others await human review
- On approve: RPC `approve_added_holding` creates `holdings` row with same data
- On reject: status = rejected, reason recorded
- Can edit fields before approving

---

### Audit Module

**Purpose:** Track all changes (who, what, when) via audit trail.

**Files:**
- `types.ts` — `AuditEntry`, `AuditRepository`, entity types
- `api/supabase-audit-repository.ts` — list feed, get holding edit diff
- `core/audit-csv-writer.ts` — export audit to CSV
- `hooks/use-audit-feed.ts`, `use-holding-edit-diff.ts` — React Query
- `components/audit-page-content.tsx`, `holding-edit-diff-view.tsx` — UI

**Key Functions:**
- `useAuditFeed()` — fetch audit_feed view (200 latest)
- `useHoldingEditDiff(holdingId, editId)` — reconstruct before/after for one edit
- `getHoldingEditDiff()` — fetch all edits, find target edit and previous, return diffs per field

**Business Rules:**
- Database triggers populate `audit_feed` (not app)
- Entity types: holding_edit, added_holding_*, import_batch_*, city_*, user_management_*, etc.
- One entry per action (not per row)
- Details (JSON) holds action-specific info
- Diff view reconstructs editing timeline: base → edit 1 → edit 2 → edit N
- Diffs only show changed fields

---

### Analytics Module

**Purpose:** System-wide and city-level metrics, quality rules, team activity.

**Files:**
- `types.ts` — analytics data shapes
- `api/supabase-analytics-repository.ts` — all analytics queries (no aggregation on client)
- `registry/quality-rules.ts` — quality metric definitions
- `hooks/use-system-overview.ts`, `use-city-analytics.ts`, `use-quality.ts`, `use-team-activity.ts` — React Query
- `components/analytics-tabs.tsx`, `system-overview-board.tsx`, `city-drilldown-board.tsx`, `quality-board.tsx` — UI

**Key Functions:**
- `useSystemOverview()` — system-wide KPIs
- `useCityAnalytics(cityId)` — city-specific metrics (basins, top holders, completeness, quality issues)
- `useQuality(cityId?)` — quality issues per city (or system-wide)
- `useTeamActivity()` — user activity (records added, edits, etc.)

**Business Rules:**
- All aggregation done server-side (Postgres views/RPCs)
- Quality rules pre-defined (missing holder_name, missing national_id, zero area, etc.)
- Team activity derived from audit trail + import batches
- Charts interactive (hover tooltip, click drill-down)

---

### Export Module

**Purpose:** Generate unified 25-column Excel export of all holdings (dashboard authority).

**Files:**
- `types.ts` — `ExportFilters`, `ExportRepository`, export data shapes
- `api/supabase-export-repository.ts` — list from unified_holdings_export view (paginated)
- `core/build-unified-dataset.ts` — convert view rows to camelCase dataset shape
- `core/excel-mapper.ts` — map dataset to 25-column Excel schema (with business rules)
- `core/excel-writer.ts` — write workbook, trigger download
- `hooks/use-export-holdings.ts` — React Query
- `components/export-dialog.tsx` — UI

**Key Functions:**
- `useExportHoldings()` — mutation to generate + download XLSX
- `listFromUnifiedView()` — fetch all holdings from export view (paginated, max 20k)
- `buildUnifiedDataset()` — convert snake_case view rows to camelCase shape
- `mapToExcelRow()` — apply 25-column business rules (defaults, fallbacks)
- `writeExcelFile()` — create workbook, apply styling, trigger download

**25-Column Export Schema:**

| # | Arabic Header | Field | Source | Rules |
|---|---|---|---|---|
| 1 | كود القطعة | parcelId | id | Internal UUID |
| 2 | كود الشخص | personId | person_id | FK to farmers card system (if exists) |
| 3 | رقم الحيازة | holdingIdNumber | holding_id_number | Real business number |
| 4 | كود الجمعية | associationCode | — | Always empty (placeholder) |
| 5 | اسم الجمعية | associationName | city_name | From cities table |
| 6 | نوع الجمعية | associationType | association_type | agricultural_credit or agricultural_reform |
| 7 | تصنيف الجمعيات | classification | classification | Enum: استصلاح, ائتمان, اصلاح |
| 8 | اسم المالك (ميداني) | ownerNameField | owner_name | From added_holdings or fallback to holder_name |
| 9 | الرقم القومي (مالك) | ownerNationalId | — | Always empty (no source) |
| 10 | اسم الحائز (ميداني) | holderNameField | holder_name | From holdings |
| 11 | الرقم القومي (حائز) | holderNationalId | national_id | From holdings |
| 12 | رقم القطعة | landNumber | land_number | Business parcel number (empty if missing) |
| 13 | المساحة الكلية | totalArea | total_sqm | Total area in sqm |
| 14 | فدان | feddan | feddan | Standard area unit |
| 15 | قيراط | qirat | qirat | Standard area unit |
| 16 | سهم | sahm | sahm | Standard area unit |
| 17 | كود الحوض | basinCode | — | Always empty (placeholder) |
| 18 | اسم الحوض | basinName | basin_name | From holdings |
| 19 | نوع التربة | soilType | soil_type | Default: "طينية" if missing |
| 20 | نوع الاستخدام | usageType | usage_type | Default: "زراعي" if missing |
| 21 | نوع المحصول | cropType | crop_type | From added_holdings if exists |
| 22 | مراحل النمو | growthStages | growth_stages | No default; empty if missing |
| 23 | اسم الحائز (فلاح) | holderNameFarmerCard | holder_name_farmer_card | From added_holdings (fallback to holder_name) |
| 24 | اسم المالك (فلاح) | ownerNameFarmerCard | owner_name_farmer_card | From added_holdings (fallback to owner_name then holder_name) |
| 25 | ملاحظات | fieldTeamNotes | notes | Free-form notes from team |

**Business Rules:**
- Source: unified_holdings_export view (merges holdings + added_holdings + edits + decorations)
- All edits already applied by database; no client-side merge needed
- Ordering: by basin_name (ascending, nulls last), then holding_id_number (ascending)
- Filtering: by city, association type, custom filters
- Max 20k rows per export (safety cap)
- Defaults: usageType = "زراعي", soilType = "طينية"
- Fallbacks: if owner_name missing, use holder_name
- Columns 4 & 17 (association code, basin code) always empty (placeholders)
- Column 9 (owner national ID) always empty (no source)

---

### Users Module

**Purpose:** Manage staff accounts, roles, permissions.

**Files:**
- `types.ts` — `User`, `InviteInput`, `UsersRepository`
- `api/supabase-users-repository.ts` — list, invite, update role, deactivate
- `hooks/use-users.ts`, `use-user-mutations.ts` — React Query
- `components/users-table.tsx`, `invite-dialog.tsx` — UI
- `schemas/invite-schema.ts` — Zod validation

**Key Functions:**
- `useUsers()` — fetch all users (profiles)
- `useUserMutations()` — invite, update role, deactivate
- `inviteUser(email)` — POST `/api/users/invite` → sends magic link email
- `updateRole(userId, role)` — change user role
- `deactivate(userId)` — set is_active = false

**Validation:**
- Email format
- Role: admin, editor, viewer

**Business Rules:**
- Admin-only access
- Invite sends email with Supabase magic link
- Invited user activates by setting password via email
- Can't delete users (only deactivate; soft delete)
- Roles: admin (full), editor (import, edit, approve/reject), viewer (read-only)

---

## Business Rules

### Import Process

1. **File upload:** Admin selects Excel file
2. **Parse** (server-side): readWorkbook → locateHeaderRow → mapRows → validateRows
3. **Preview** (no database write):
   - Summary (rows found, valid, blank)
   - Detected association type (+ override option)
   - Skipped sheets (redundant filtered views)
   - Parcel count mismatches (warnings)
4. **Commit** (atomic RPC):
   - Mark old holdings stale (if not in new import)
   - INSERT/UPSERT new holdings by unified_number
   - Create import_batches record
   - Auto-update city.association_type (if detected)
5. **Result:** Summary (rows imported, duplicates, failures)

### Holding Lifecycle

1. **Import:** Base row created in `holdings` table (immutable origin)
2. **Edit:** Each edit creates `holding_edits` row with full payload snapshot
3. **Display:** Merge base + latest edit for display (handled by repository)
4. **Audit:** Each edit logged in `audit_feed` via trigger

### Edit Payload Format

**Flutter app writes camelCase:**
```json
{
  "holderName": "محمد علي",
  "nationalId": "12345678901234",
  "basinCode": "001",
  "basinName": "البشيط",
  ...
}
```

**Dashboard normalizes via EDIT_PAYLOAD_KEY_MAP:**
```typescript
export const EDIT_PAYLOAD_KEY_MAP: Record<EditableField, string> = {
  holder_name: "holderName",
  national_id: "nationalId",
  basin_code: "basinCode",
  basin_name: "basinName",
  ...
};
```

**Why:** Flutter app's Dart model uses camelCase; database column names are snake_case; dashboard must translate.

### Deduplication

**Key:** `(city_id, unified_number)` unique constraint

- If row with same city + unified_number exists: UPSERT (update all fields)
- If unified_number is null: insert as new
- Old holdings with unified_number not in import → mark is_stale = true

### Association Type Detection

**Row 1 format:** `"القطاع : الائتمان الزراعي"` or `"القطاع : الإصلاح الزراعي"`

- Parse prefix `"القطاع"`
- Extract suffix (e.g., "الائتمان الزراعي")
- Match against `ASSOCIATION_TYPE_LABELS` enum
- If no match: type = null, show raw label in preview, let admin override
- On commit: auto-update city.association_type (best-effort; don't fail import if this fails)

### Editable Fields

**Can edit:** holder_name, national_id, land_number, page_number, basin_name, basin_code, administration, directorate, borders (4x), feddan, qirat, sahm, total_sqm

**Cannot edit:** id, unified_number, holding_id_number, imported_at, is_stale

**Why:** Identifiers are immutable to preserve audit trail. Origin data (imported_at) immutable for provenance.

### Data Quality Rules

**Examples (from quality-rules.ts):**
- Missing holder_name → data quality violation
- Missing national_id → warning
- Zero total area → data quality violation
- Missing basin_name → warning
- ...

**Calculated:** Per-city quality percentage (% complete fields, % valid records)

### Audit Trail

**Triggers populate `audit_feed`:**
- Import batch committed
- Holding edited
- Added holding approved/rejected
- City created/updated/deleted
- User invited/role changed/deactivated

**Details column (JSON):** Action-specific info (e.g., field changed from X to Y)

### Soft Delete (Stale Marking)

**Holdings marked stale:** When a new import is committed for city X, all holdings in X without the imported unified_number set to is_stale = true

**Why:** Field team may still have edits attached to old holdings; never hard-delete. Re-import same unified_number → mark unstale again.

### Reserved Identifiers

**Flutter app (Dashboard ID Alignment):**
- person_id: FK to farmer card system (if exists); can be null
- parent_holding_id: for "add parcel for existing person" workflow
- promoted_holding_id: links added_holding to approved holdings row

---

## Data Flow Diagrams

### Import Flow (Happy Path)

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. UPLOAD STEP                                                  │
│ Admin selects .xlsx file                                        │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. PREVIEW STEP (POST /api/import/preview)                     │
│ ✓ readWorkbook(buffer)                                          │
│ ✓ locateHeaderRow(rows, mapping)                                │
│ ✓ mapRows(rows, header, mapping)                                │
│ ✓ validateRows(mappedRows) → skip blanks                        │
│ ✓ detectAssociationType(row 0)                                  │
│ ✓ buildPreviewSummary(valid, blank, etc.)                       │
│ → NO DATABASE WRITE YET                                         │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. PREVIEW DISPLAY                                              │
│ ✓ Summary (rows found, valid, blank, duplicates)                │
│ ✓ Detected association type (+ override dropdown)               │
│ ✓ Skipped sheets (if any)                                       │
│ ✓ Parcel count mismatches (warnings)                            │
│ Admin clicks "Confirm & Import"                                 │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. COMMIT STEP (RPC commit_import_batch)                        │
│ ✓ INSERT import_batches row (committed status)                  │
│ ✓ UPDATE holdings SET is_stale = true WHERE city_id = ? AND     │
│   unified_number NOT IN (imported records)                      │
│ ✓ INSERT/UPSERT holdings (by unified_number)                    │
│ ✓ SET holding.imported_at = now()                               │
│ ✓ IF detected_type: UPDATE cities.association_type              │
│ (One transaction; all-or-nothing)                               │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. SUCCESS & SUMMARY                                            │
│ ✓ Rows imported: N                                              │
│ ✓ Rows duplicate (upserted): M                                  │
│ ✓ Rows failed: 0                                                │
│ ✓ Association type set (if detected)                            │
└─────────────────────────────────────────────────────────────────┘
```

### Edit Flow (Single Holding)

```
┌──────────────────────────────────────────┐
│ User clicks holding cell                 │
│ (e.g., holder_name field)                │
└──────────┬───────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│ Inline edit input appears                │
│ User edits value, presses Enter or blur  │
└──────────┬───────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│ applyEdit(holdingId, field, newValue)    │
│ 1. Fetch holding (base)                  │
│ 2. Fetch latest edits (edit_payloads)    │
│ 3. Merge base + latest (current state)   │
│ 4. Build new payload (all EDITABLE_      │
│    FIELDS, one changed)                  │
│ 5. INSERT holding_edits                  │
└──────────┬───────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│ React Query invalidates:                 │
│ queryKeys.holdings.list(cityId, ...)     │
│ queryKeys.audit.feed(...)                │
└──────────┬───────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│ Re-fetch holdings list                   │
│ (repository merges base + latest again)  │
└──────────┬───────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│ Table re-renders with updated value      │
│ Audit entry appears in audit feed        │
└──────────────────────────────────────────┘
```

### Bulk Edit Flow

```
┌──────────────────────────────────────────┐
│ User selects N rows (checkboxes)         │
│ Selects field to edit (e.g., basinName)  │
│ Enters new value                         │
└──────────┬───────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│ bulkApplyField(holdingIds, field, value) │
│ FOR EACH holdingId:                      │
│   1. Fetch holding (base)                │
│   2. Fetch latest edits (edit_payload)   │
│   3. Merge base + latest (current)       │
│   4. Build new payload (change field)    │
│   5. Queue INSERT                        │
│ Batch INSERT all payloads                │
└──────────┬───────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│ React Query invalidates holdings list    │
└──────────┬───────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│ All N rows re-render with new value      │
│ Audit entries created for each edit      │
└──────────────────────────────────────────┘
```

### Review Queue (Approve) Flow

```
┌──────────────────────────────────────────┐
│ User clicks Approve on added_holding     │
└──────────┬───────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│ Dialog prompts for holding_id_number     │
│ (optional; if needed, user provides)     │
└──────────┬───────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│ RPC approve_added_holding(                │
│   p_added_holding_id,                    │
│   p_holding_id_number?                   │
│ )                                        │
│ 1. Create holdings row (if new)          │
│ 2. Set added_holding.promoted_holding_id │
│ 3. Set status = approved                 │
│ 4. Set reviewed_by = auth.uid()          │
│ 5. Set reviewed_at = now()               │
└──────────┬───────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│ React Query invalidates:                 │
│ queryKeys.review.queue(...)              │
│ queryKeys.holdings.list(cityId, ...)     │
│ queryKeys.audit.feed(...)                │
└──────────┬───────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│ Refresh review queue (remove approved)   │
│ Refresh holdings list (new row appears)  │
│ Audit entry: "added_holding_approved"    │
└──────────────────────────────────────────┘
```

### Export Flow

```
┌──────────────────────────────────────────┐
│ User clicks Export button                │
│ Selects filters (city, association type) │
└──────────┬───────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│ useExportHoldings(filters)               │
│ 1. Query unified_holdings_export view    │
│    (paginated, max 20k rows)             │
│ 2. All edits already merged by database  │
│ 3. buildUnifiedDataset(rows)             │
│    → snake_case → camelCase conversion   │
└──────────┬───────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│ mapToExcelRow(row) for each row          │
│ Apply 25-column business rules:          │
│ - usageType default "زراعي"              │
│ - soilType default "طينية"              │
│ - Fallback owner_name → holder_name      │
│ - Leave empty: association code, basin   │
│   code, owner national_id                │
└──────────┬───────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│ writeExcelFile(excelRows)                │
│ 1. Create workbook (SheetJS)             │
│ 2. Add header row                        │
│ 3. Add data rows                         │
│ 4. Apply styling (fonts, borders)        │
│ 5. Generate XLSX buffer                  │
└──────────┬───────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│ Download file                            │
│ Browser receives XLSX                    │
│ File saved to Downloads/                 │
└──────────────────────────────────────────┘
```

---

## Technical Debt

### 1. **Placeholder Empty Columns in Export**

**Location:** `excel-mapper.ts` (columns 4, 17, 9)

**Issue:** Association code, basin code, owner national ID columns always empty (placeholders for future)

**Impact:** Export file has 25 columns as per spec, but 3 are always blank

**Resolution:** Revisit once farmer card system integrated (adds person_id, owner_name sources)

### 2. **Growth Stage Backfill Manual**

**Location:** Migrations `20260803201000_growth_stage_random_backfill.sql`, `20260804220000_growth_stage_backfill_v2.sql`

**Issue:** Growth stages were manually backfilled with random values then revised; not a permanent data source

**Impact:** Field is populated but semantically empty (not real field team data)

**Resolution:** Mobile app sends real growth stage data; dashboard imports via added_holdings. Manual backfill can be abandoned.

### 3. **Deduplication by unified_number Only**

**Location:** `import_commit_rpc.sql` unique constraint

**Issue:** Holdings deduplicated by `(city_id, unified_number)` only. If unified_number is null, each import creates new row (no dedup).

**Impact:** If Excel missing unified_number column or import using old format, duplicates possible

**Resolution:** Wait for schema refinement. For now, all imports assume unified_number present; validate in preview.

### 4. **No Realtime Subscriptions**

**Location:** Everywhere (not implemented)

**Issue:** Dashboard doesn't sync in real-time. Changes visible only after manual refresh or re-download city.

**Impact:** Multiple admins editing same city may see stale data; edits not reflected until page refresh

**Resolution:** Add Supabase realtime subscriptions + React Query cache invalidation. Out of scope for Phase 0–5.

### 5. **Flutter Edit Payload camelCase/snake_case Mismatch**

**Location:** `editable-fields.ts` EDIT_PAYLOAD_KEY_MAP

**Issue:** Flutter app writes camelCase; database expects snake_case. Must map on every read.

**Impact:** Easy to miss a field when adding new editables. If Flutter adds field but dashboard doesn't update map, edit silently lost.

**Resolution:** Generate map from schema. For now, maintained manually with strong typing (TypeScript enforces completeness).

### 6. **No Batch Rollback**

**Location:** `supabase-import-repository.ts` rollbackBatch()

**Issue:** Rollback works but is rarely tested. If rollback itself fails, data inconsistency possible.

**Impact:** Risky to rollback in production

**Resolution:** Test rollback scenario in E2E (not currently in phase gates). Add observability (audit entry for rollback).

### 7. **Quality Snapshots Manual Triggers**

**Location:** Analytics dashboard, `captureQualitySnapshot()` manual RPC

**Issue:** No automatic quality snapshots. Admin must click button to capture.

**Impact:** No historical trend data for quality metrics

**Resolution:** Add cron job (or Postgres job scheduler) to auto-capture daily.

### 8. **Service Role Client Exists But Rarely Used**

**Location:** `lib/supabase/service.ts`

**Issue:** Service-level client (with service role key) not used in production code. Only appears in potential RPCs.

**Impact:** Unused code path; possible security gap if accidentally used in wrong context

**Resolution:** Either remove or document when it should be used. For now, keep for admin operations that need to bypass RLS.

### 9. **No Multi-Language Support**

**Location:** All UI text hardcoded in Arabic

**Issue:** Dashboard is Arabic-only. No i18n infrastructure.

**Impact:** Cannot easily add English or other languages

**Resolution:** Extract strings to i18n JSON. Not prioritized; add only if needed.

### 10. **Column Mapping Registry Static**

**Location:** `features/import/core/column-mapping.ts`

**Issue:** Only `DEFAULT_COLUMN_MAPPING` in registry. New city layouts require code changes + redeploy.

**Impact:** Not scalable if many cities have different Excel formats

**Resolution:** Move mappings to database table (cities can have different column layouts). Parser becomes data-driven. Out of scope for now; assume all cities match DEFAULT_COLUMN_MAPPING for Phase 0–5.

---

## Code Smells

### 1. **Magic Strings (Legacy)**

**Example:** Some Zod error messages hardcoded in Arabic

**Issue:** Scattered error messages make it hard to translate or standardize

**Fix:** Create error message constants in centralized file

### 2. **Nested Ternaries**

**Example:** Excel mapper column conditions (multiple nullish coalescing chains)

**Issue:** Hard to read and reason about

**Fix:** Extract to named functions

### 3. **Large Repository Implementations**

**Example:** `supabase-holdings-repository.ts` (165 lines)

**Issue:** Multiple concerns (fetching, editing, exporting)

**Fix:** Split into smaller repositories (HoldingsReader, HoldingsWriter, HoldingsExporter)

### 4. **Test Fixtures Duplicated**

**Example:** Import test files each define their own sample rows

**Issue:** DRY violation; hard to maintain

**Fix:** Centralized fixture file (already started with `test-fixtures.ts`)

### 5. **Type Assertions (as unknown as Type)**

**Example:** Database rows cast to domain types in repositories

**Issue:** Bypasses type safety; could miss a schema change

**Fix:** Validate with Zod schemas or maintain strict DB type definitions

### 6. **Conditional Rendering Without Null Checks**

**Example:** UI assumes data present (e.g., `{city.name}` without checking if city loaded)

**Fix:** Always render loading state or empty state

### 7. **Hardcoded Role Checks**

**Example:** `if (user.role === 'admin') { ... }` scattered in components

**Issue:** Hard to find all permission checks; easy to miss one

**Fix:** Centralized permission service (`useCanX()` hooks)

### 8. **Missing Error Boundary**

**Example:** Some pages don't have error boundary fallback

**Issue:** Blank white screen on error (bad UX)

**Fix:** Add error boundary wrapper at page level

### 9. **Query Key Collision Risk**

**Example:** If queryKeys.holdings.list filter object changes shape, cache invalidation misses

**Issue:** React Query uses object equality for key identity; must be careful

**Fix:** Use query key factory (already in place; just be disciplined)

### 10. **Unused Arguments**

**Example:** Some hook parameters passed but not used

**Issue:** Confusing API; dead code

**Fix:** Review and remove unused parameters

---

## Refactoring Opportunities

### 1. **Extract Permission Service**

**Current:** Role checks scattered in UI + repositories

**Proposed:**
```typescript
export function useCanImport(cityId: string) {
  const { data: profile } = useCurrentProfile();
  return profile?.role && ['editor', 'admin'].includes(profile.role);
}
```

**Benefit:** Centralized, reusable, testable

### 2. **Parameterize Pagination**

**Current:** Hardcoded pageSize = 50 in holdings table

**Proposed:** Add pageSize to URL search params (`?pageSize=25`)

**Benefit:** User preference persistence

### 3. **Move Validation to Shared Schema File**

**Current:** Each feature defines its own Zod schemas

**Proposed:** Centralize common schemas (email, UUID, Arabic text)

**Benefit:** Consistency, reusability

### 4. **Split Repository by Use Case**

**Current:** HoldingsRepository does list + edit + export

**Proposed:**
- HoldingsReader (list, basins)
- HoldingsWriter (edit, bulk edit)
- HoldingsExporter (export CSV/Excel)

**Benefit:** Interface segregation, testability

### 5. **Add Request Deduplication**

**Current:** Multiple clicks on save button send multiple requests

**Proposed:** Disable button while mutation in flight (already done) + dedupe by URL/key

**Benefit:** Prevents accidental duplicates

### 6. **Metrics Service**

**Current:** Analytics queries scattered in hooks

**Proposed:** Centralized `MetricService` with pre-defined calculations

**Benefit:** Easier to test, document, and maintain

### 7. **Add Observability**

**Current:** Errors logged silently; no tracing

**Proposed:** Add Sentry or similar error tracking

**Benefit:** Production debugging

### 8. **Database Connection Pooling**

**Current:** Supabase client created per request (via factory)

**Proposed:** Connection pool (if performance becomes issue)

**Benefit:** Lower latency for high concurrency

### 9. **Caching Layer**

**Current:** React Query only; no Redis caching

**Proposed:** Add Redis for system overview, quality snapshots (expensive queries)

**Benefit:** Faster page loads

### 10. **Feature Flags**

**Current:** All features live; no gradual rollout

**Proposed:** Add feature flags (LaunchDarkly, Firebase Remote Config)

**Benefit:** Safer deployments, A/B testing

---

## Questions & Missing Information

### Database & Schema

1. **Why is `unified_number` nullable if it's the dedup key?**
   - Should new records always have one?
   - What if import doesn't provide it?
   - Is fallback (hash of identifiers) acceptable?

2. **Person ID source is unclear.**
   - Is it tied to an external farmer card system?
   - If so, when does the link happen?
   - Can dashboard set person_id or only via app?

3. **What are the exact quality rules?**
   - `quality-rules.ts` lists examples; are these all of them?
   - Can admins define custom rules?
   - Are scores weighted or simple counts?

4. **Soil type enum — what are valid values?**
   - Currently shows "طينية" as default
   - Are there others (رملية, وادي, etc.)?

5. **Growth stage enum — what are valid values?**
   - Currently stored as free text; should be enum?
   - Is there a canonical list?

### Architecture & Design

6. **Why is `holding_edits_latest` a separate table/view?**
   - Instead of always joining holding_edits with ROW_NUMBER() = 1?
   - Is it for performance (materialized)?

7. **Should exports be versioned?**
   - Should we store a snapshot of export + filters in database?
   - For audit trail (which version did user download)?

8. **How should Flutter handle offline edits if dashboard updates same field?**
   - Last-write-wins by timestamp (current rule)?
   - Or should there be conflict detection?

9. **Are there any bulk operations dashboard should support?**
   - Bulk delete holdings?
   - Bulk city import?
   - Bulk user invite?

10. **Multi-city support — is it full?**
   - Can one user be restricted to specific cities (not all)?
   - If so, where does that permission live?

### Performance & Scaling

11. **What's the expected row count per city?**
   - Current max is 20k (EXPORT_SAFETY_CAP)
   - Is this realistic?
   - Do we need pagination for imports?

12. **Should city list be paginated?**
   - Currently fetches all with stats
   - If 1000+ cities, does this scale?

13. **Quality snapshots — how often are they captured?**
   - Hourly? Daily? On demand?
   - How long to keep history?

### Missing Features (Mentioned in APP_PLAN § 5 but not yet implemented)

14. **Batch Rollback — is it tested in E2E?**
   - Phase gates don't cover rollback scenario
   - Should add test case

15. **City deletion via RPC — is cascade complete?**
   - Should also delete import_batches, quality_snapshots, audit entries?
   - Or keep audit for compliance?

16. **Is there a city "clone" feature?**
   - Should admins be able to copy one city's settings to another?

### Observability & Monitoring

17. **Are import errors logged somewhere?**
   - Where do "rows_failed" details go?
   - How do admins debug failures?

18. **What metrics should be tracked?**
   - Import duration?
   - Query latency?
   - Error rates?

19. **Is there a dashboard for Supabase usage?**
   - Auth volume?
   - Database queries?
   - Storage usage?

### Compliance & Data Privacy

20. **How long are audit trails kept?**
   - Forever?
   - Rotated after N months?
   - GDPR retention policy?

21. **Can field team personal data (email) be deleted?**
   - Or is it retained in audit trail forever?

22. **Is there data encryption at rest?**
   - Supabase handles this?
   - Or app-level encryption needed?

---

## Summary

**Dashboard Status:** Foundation (Phase 0) + Phases 1–5 complete. All core features implemented: import, holdings, review queue, audit, analytics, export, user management.

**Architecture:** Clean, modular, strongly typed. Feature-first organization. Repository pattern for data access. Pure business logic decoupled from React/Supabase.

**Quality:** Comprehensive E2E gate coverage. Core logic 100% unit tested. No technical blockers for production.

**Ready for:** Next phase planning, performance optimization, multi-language support, advanced features (realtime, conflict detection, mobile sync improvements).

---

*End of Architecture Reference Document*
