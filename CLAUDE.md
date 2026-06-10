# CLAUDE.md — Spectra Payroll System

## Project Overview
White-label payroll system for hourly employees in the Dominican Republic. Integrates with BambooHR (employee data) and Hubstaff (hours tracking). Handles Dominican Republic tax law (TSS + ISR).

## Stack
- **Frontend:** Vite + React 18 + TypeScript + Tailwind CSS + shadcn/ui + lucide-react + recharts + TanStack Query + Zustand + react-i18next
- **Backend:** Serverless functions in `/api/` (Vercel format), TypeScript
- **PDF:** @react-pdf/renderer
- **Email:** Resend (primary), nodemailer SMTP (fallback)
- **Persistence:** localStorage via `src/lib/storage.ts` abstraction (designed for Supabase migration)
- **Deploy:** Vercel

## Dev Commands
```bash
npm run dev          # Start dev server (Vite)
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run Vitest tests
npm run test:ui      # Vitest with UI
npm run typecheck    # tsc --noEmit
npm run lint         # ESLint
```

## Project Structure
```
/
├── .claude/agents/          # AI agent definitions
├── api/                     # Serverless functions (Vercel)
│   ├── bamboohr.ts         # BambooHR proxy
│   ├── hubstaff.ts         # Hubstaff proxy
│   └── email.ts            # Email sending function
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # shadcn/ui base components
│   │   └── layout/         # Layout components (Sidebar, Header, etc.)
│   ├── pages/              # Page components (one per route)
│   │   ├── Dashboard/
│   │   ├── Employees/
│   │   ├── Payroll/
│   │   ├── History/
│   │   ├── Connectors/
│   │   └── Settings/
│   ├── lib/
│   │   ├── payroll/         # Pure payroll calculation module (NO UI deps)
│   │   │   ├── calculations.ts
│   │   │   ├── types.ts
│   │   │   ├── constants.ts
│   │   │   └── __tests__/
│   │   ├── connectors/      # Connector interfaces and implementations
│   │   │   ├── types.ts     # Connector interface
│   │   │   ├── bamboohr.ts
│   │   │   └── hubstaff.ts
│   │   ├── storage.ts       # localStorage abstraction layer
│   │   └── utils.ts         # Shared utilities (formatting, etc.)
│   ├── locales/             # i18n translation files
│   │   ├── en.json
│   │   └── es.json
│   ├── hooks/               # Custom React hooks
│   ├── store/               # Zustand stores
│   └── types/               # Global TypeScript types
├── CLAUDE.md                # This file
├── PROGRESS.md              # Module status tracking
├── CHECKPOINT.md            # Resume state
├── BUGS.md                  # Bug tracking
└── .env.example             # Environment variable documentation
```

## Design System (NON-NEGOTIABLE)
- **Base color:** White `#FFFFFF`
- **Primary:** Emerald — `emerald-600` (#059669) for primary actions
- **Font:** Inter
- **Corners:** `rounded-xl` cards, `rounded-lg` buttons/inputs
- **Shadows:** soft (`shadow-sm` default)
- **Icons:** lucide-react only
- See `.claude/agents/designer.md` for full design system

## i18n Rules (NON-NEGOTIABLE)
- Default language: English (EN)
- Second language: Spanish (ES)
- **ZERO hardcoded strings** in components — all text from `src/locales/[lang].json`
- Tax terms (ISR, TSS, AFP, SFS, DGII) are the same in both languages
- Currency format: `RD$ 1,234.56` (same in both languages)
- Language preference stored in localStorage key `spectra_language`
- Use `useTranslation` hook from react-i18next

## Dominican Republic Tax Rules (NON-NEGOTIABLE)

### TSS (deducted BEFORE ISR)
- **AFP (pension): 2.87%** of cotizable salary, cap = 20× minimum cotizable salary
- **SFS (health): 3.04%** of cotizable salary, cap = 10× minimum cotizable salary
- Minimum cotizable salary is CONFIGURABLE in Fiscal Parameters settings

### ISR (DGII scale — applied on salary AFTER TSS deduction)
Annual brackets (as of current):
- Up to RD$416,220.00: **EXEMPT**
- RD$416,220.01 – RD$624,329.00: **15%** on excess over RD$416,220.01
- RD$624,329.01 – RD$867,123.00: **RD$31,216.00 + 20%** on excess over RD$624,329.01
- Over RD$867,123.01: **RD$79,776.00 + 25%** on excess over RD$867,123.01

Scale is CONFIGURABLE in Fiscal Parameters settings (DGII may update it).

### Daily Salary Divisor
- ALWAYS use **23.83** (salary ÷ 23.83)
- NEVER use ×12/365

### Monetary Rounding
- All monetary amounts: **2 decimal places, half-up rounding**
- Format: `RD$ 1,234.56`
- Use a dedicated `roundHalfUp(value, 2)` utility — never rely on JS default rounding

### Overtime
- Default threshold: **44 hours/week** (Código Laboral RD)
- Default OT rate: **35% additional** (multiplier 1.35×)
- Default holiday rate: **100% additional** (multiplier 2.0×)
- All configurable in Settings → Payroll

## API Integration Rules
- **BambooHR:** All calls via `/api/bamboohr` proxy (CORS). Basic Auth: `apiKey:x` in base64
- **Hubstaff:** All calls via `/api/hubstaff` proxy
- **API keys NEVER in frontend code or localStorage** — always in environment variables
- All serverless functions validate required parameters (return 400 with message if missing)

## TypeScript Rules
- No `any` types — ever
- All API responses must have defined interfaces
- Props must be fully typed (no implicit any from missing type annotations)

## Storage Abstraction
The `storage.ts` module wraps localStorage with a typed interface designed for migration to Supabase:
- `get<T>(key: string): T | null`
- `set<T>(key: string, value: T): void`
- `remove(key: string): void`
- Keys prefixed with `spectra_` to avoid collisions

## Vacations (Future Phase)
The vacation module (Código Laboral RD) is NOT implemented in v1. Architecture is prepared:
- `hireDate` field is synced from BambooHR
- Employee profile has a reserved section for vacation info
- Do NOT implement vacation calculation logic

## Environment Variables
See `.env.example` for all required variables. Never commit actual keys.
