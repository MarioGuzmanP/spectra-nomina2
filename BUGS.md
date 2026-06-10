# BUGS.md — Spectra Payroll System

## Open Bugs

| ID | Module | Description | Severity |
|----|--------|-------------|----------|
| BUG-005 | History | react-pdf/renderer chunk is 434KB gzip — consider lazy import for PDF generation | low |
| BUG-006 | Payroll | OT week boundary uses period start date, not calendar Monday — edge case for periods not starting Monday | low |
| BUG-007 | Employees | No pagination on employee table — visual only issue at 50+ employees | low |

---

## Resolved Bugs

| ID | Module | Description | Fix | Status |
|----|--------|-------------|-----|--------|
| BUG-001 | Tests | `@testing-library/jest-dom` imported in setup.ts but not installed | Removed import — not needed for pure unit tests | ✅ FIXED |
| BUG-002 | Build | `vite.config.ts` used `defineConfig` from `vite` — `test` property not recognized | Changed import to `vitest/config` | ✅ FIXED |
| BUG-003 | Build | `@vercel/node` types missing for serverless functions | Added `@vercel/node` as devDependency | ✅ FIXED |
| BUG-004 | Build | Unused imports in Employees and History pages | Removed `CardTitle` and `CardHeader` from those pages | ✅ FIXED |
| BUG-008 | i18n | ~8 hardcoded strings in components (loading, warnings, labels) | Extracted all to en.json + es.json | ✅ FIXED |
| BUG-009 | History | `status` never updated to 'sent' after batch email | Added `updatePayroll` call after successful batch | ✅ FIXED |
| BUG-010 | Badge | Missing 'info' variant — cast workaround in History | Added 'info' and 'purple' variants to Badge | ✅ FIXED |
| BUG-011 | Connectors | Duplicate loading indicator block in HubstaffConnector | Removed duplicate block | ✅ FIXED |
| BUG-012 | PayrollCalculation type | `customDeductionsBreakdown` missing from `PayrollCalculation` interface | Added field to types/index.ts | ✅ FIXED |

---

## Bug Template

```
## BUG-XXX: [title]
- **Module:** 
- **Severity:** low | medium | high | critical
- **Description:** 
- **Reproduction:** 
- **Fix:** 
- **Status:** OPEN | FIXED | VERIFIED
```
