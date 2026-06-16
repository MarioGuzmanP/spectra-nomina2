# CHECKPOINT.md — Spectra Payroll System

**Last updated:** 2026-06-15  
**Current Phase:** SYSTEM COMPLETE — UX improvements  
**Git branch:** main  
**Last commit:** feat: biweekly quincena picker + ISO week OT calculation (30536fce)

---

## System Status: COMPLETE + POST-LAUNCH IMPROVEMENTS ✅

All phases (1–9) implemented and verified.

### Build Status
- ✅ `npm run test:run` → 20/20 tests passing
- ✅ `npm run typecheck` → clean
- ✅ `npm run build` → success, chunks split

### What Was Built (complete inventory)

| Phase | Module | Status |
|-------|--------|--------|
| 1 | Setup, i18n, agents, structure | ✅ |
| 2 | Payroll calculations (AFP/SFS/ISR/OT) + 20 tests | ✅ |
| 3 | BambooHR/Hubstaff/Email proxies + Connectors UI + Hubstaff mapping | ✅ |
| 4 | Employee table, profile page, custom deductions CRUD | ✅ |
| 5 | 4-step payroll flow (period → hours → calculate → approve) | ✅ |
| 6 | PDF pay stubs (EN/ES bilingual) + individual/batch email send | ✅ |
| 7 | Full settings (company/logo/payroll/fiscal params/email template) | ✅ |
| 8 | Dashboard with AreaChart + history with expandable rows | ✅ |
| 9 | QA pass: i18n completeness, bundle splitting, bug fixes | ✅ |

---

## UX Improvements — Step 1 (2026-06-15)

| Improvement | Files |
|-------------|-------|
| MEJORA 1: Biweekly quincena picker — when frequency is Bi-weekly, replaces free date inputs with month+year selects + two quincena radio buttons (1st: 1–15, 2nd: 16–last day). Dates auto-computed, read-only. February leap year handled correctly. Weekly keeps free inputs. | `src/pages/Payroll/components/StepPeriod.tsx`, `src/locales/en.json`, `src/locales/es.json` |
| MEJORA 2: ISO week OT calculation — `groupDailyIntoWeeks` replaced with ISO week (Mon–Sun) bucketing. Iterates every day in period, groups by ISO week Monday, applies OT threshold per week. Fixes bug where 15-day biweekly periods missed the 15th day (2×7=14 days). OT threshold reads from settings (default 40 h). | `src/lib/connectors/hubstaff.ts` |

---

## UX Improvements — Step 2 (2026-06-15)

| Improvement | Files |
|-------------|-------|
| MEJORA 1: Back + Calculate Payroll buttons duplicated at top of Review Hours (Step 2) | `src/pages/Payroll/components/StepHours.tsx` |
| MEJORA 2: Per-row Calculator icon button opens SinglePaystubModal for solo employee preview with Download PDF + Send Email | `src/pages/Payroll/components/SinglePaystubModal.tsx`, `StepHours.tsx` |
| MEJORA 3: Paystub PDF redesigned — green EARNINGS table (Concept/Hours/Rate/Amount), dark DEDUCTIONS table with SFS, AFP, custom deductions, ISR DGII, "Salary for month applicable to ISR" (taxableIncome/12), company logo, Date Range + Pay Date header | `src/lib/pdf/payStubPdf.tsx` |
| New i18n keys for soloPaystub modal in EN + ES | `src/locales/en.json`, `src/locales/es.json` |
| StepHours `frequency` prop added to enable solo calculation with correct ISR annualization | `src/pages/Payroll/index.tsx` |

---

## Post-launch fixes (2026-06-12 → 2026-06-15)

| OT threshold default: 44h → 40h | `src/lib/payroll/constants.ts` |
| Employees page: Active filter by default, 3-option status (Active / Inactive+Terminated / All), localStorage persistence | `src/pages/Employees/index.tsx` |
| Levenshtein fuzzy-match button in mapping panel "By BambooHR Employee" view | `src/pages/Connectors/index.tsx` |
| Enhanced diagnostic log in findHubstaffUserForEmployee (shows all compared names when match fails) | `src/pages/Payroll/components/StepPeriod.tsx` |
| Fix pagination param in fetchHubstaffMembers: page[limit] → page_limit (members endpoint uses underscore, not brackets) | `src/lib/connectors/hubstaff.ts` |
| Pagination in fetchHubstaffMembers (20 pages × 100 = 2000 members, was truncating at 100) | `src/lib/connectors/hubstaff.ts` |
| SearchableSelect combobox in mapping panel (search by name+email, replaces shadcn Select for 100+ lists) | `src/pages/Connectors/index.tsx` |
| Pagination loop in fetchHoursForPeriod (50 pages × 500 records, token rotation between pages) | `src/lib/connectors/hubstaff.ts` |
| Mapping panel two-view toggle: "By Hubstaff User" + "By BambooHR Employee" with orange badge for unmapped count | `src/pages/Connectors/index.tsx` |
| Manual Hubstaff↔BambooHR mapping UI with User #ID display, auto-match-by-name button, progress counter, info note | `src/pages/Connectors/index.tsx` |
| "Needs Mapping" badge (orange) + unmapped-employees banner with link to Connectors in Review Hours | `src/pages/Payroll/components/StepHours.tsx` |
| fetchHubstaffMembers: Shape C fallback (flat members, no user details) → stub records with User #ID | `src/lib/connectors/hubstaff.ts` |
| Fix | Files |
|-----|-------|
| Hubstaff auth: refresh token ↔ access token exchange, token rotation | `api/hubstaff.ts`, `src/lib/connectors/hubstaff.ts`, `src/store/settingsStore.ts` |
| Hubstaff bracket params: `date[start]`/`date[stop]` now sent without percent-encoding | `api/hubstaff.ts`, `src/lib/connectors/hubstaff.ts` |
| BambooHR payType filter: only `Hourly` employees enter payroll flow | `src/pages/Payroll/components/StepPeriod.tsx` |
| Hours review: match status badges, filters, DR holiday banner, salaried section | `src/pages/Payroll/components/StepHours.tsx`, `src/lib/drHolidays.ts` |
| StepCalculate guard: rejects salaried employees with clear error UI | `src/pages/Payroll/components/StepCalculate.tsx` |
| Connectors: name-normalization fallback for Hubstaff auto-matching | `src/pages/Connectors/index.tsx` |
| Proxy logging: `console.log` for URL and response status on each call | `api/hubstaff.ts` |
| ErrorBoundary on Connectors page | `src/components/ErrorBoundary.tsx` |
| Select crash: `value=""` → `value="__none__"` sentinel | `src/pages/Connectors/index.tsx` |

## To Deploy

1. Set environment variables in Vercel (see `.env.example`)
2. `vercel deploy` or connect GitHub repo to Vercel
3. Vercel automatically detects framework (Vite) from `vercel.json`

---

## Post-Launch Improvements Applied (2026-06-12)

- BambooHR sync → custom report endpoint (fixes payRate, hireDate, status)
- Employee pay rate: currency-aware display (USD/$, DOP/RD$, empty=Not set amber)
- Status: uses employmentHistoryStatus (Active/Inactive/Terminated correctly)
- Employees table: Department/JobTitle/Status filters + accent-insensitive search
- Sortable columns: Name, Pay Rate, Hire Date (click header to toggle asc/desc)
- Employee Reports modal: Directory, Compensation, Headcount templates
- CSV + PDF export (lazy-loaded PDF, applies active filters, company branding)

## Known Technical Debt (low priority)

- OT week boundary uses period start, not calendar Monday (edge case only)
- Pay stub sends are sequential (not parallel) — by design for rate limits

---

## To Resume
If continuing work: `npm run test:run && npm run typecheck` to verify state.
