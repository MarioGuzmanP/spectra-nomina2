# BUGS.md — Spectra Payroll System

## Open Bugs

_(none at this time)_

---

## Resolved Bugs

| ID | Module | Description | Fix | Status |
|----|--------|-------------|-----|--------|
| BUG-001 | Tests | `@testing-library/jest-dom` imported in setup.ts but not installed | Removed import — not needed for pure unit tests | ✅ FIXED |
| BUG-002 | Build | `vite.config.ts` used `defineConfig` from `vite` — `test` property not recognized | Changed import to `vitest/config` | ✅ FIXED |
| BUG-003 | Build | `@vercel/node` types missing for serverless functions | Added `@vercel/node` as devDependency | ✅ FIXED |
| BUG-004 | Build | Unused imports in Employees and History pages | Removed `CardTitle` and `CardHeader` from those pages | ✅ FIXED |

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
