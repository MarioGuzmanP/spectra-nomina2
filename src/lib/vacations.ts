import { storage, STORAGE_KEYS } from './storage'
import { generateId } from './utils'
import { roundHalfUp } from './payroll/calculations'
import { getPaystubLang } from './pdf/paystubLabels'

export interface SeniorityTier {
  id: string
  minYears: number
  maxYears: number | null // null = open-ended ("10+ years")
  days: number
}

export interface VacationFormula {
  hoursPerWeek: number
  weeksPerYear: number
  monthsPerYear: number
  dailyDivisor: number
}

export interface VacationDeductions {
  sfs: boolean
  afp: boolean
  isr: boolean
}

export interface VacationRules {
  tiers: SeniorityTier[]
  formula: VacationFormula
  deductions: VacationDeductions
  payStubLanguage: 'en' | 'es'
  lastModified?: string
}

export type VacationRulesStore = Record<string, VacationRules>

export const VACATION_COUNTRIES = [
  'Dominican Republic', 'Mexico', 'United States', 'Jamaica', 'Philippines', 'Kenya',
] as const

// DR daily divisor (Código Laboral) — also mirrored in Payroll/Fiscal settings.
const DEFAULT_DAILY_DIVISOR = 23.83

/** Default ruleset (Dominican Republic statutory tiers) for a country. */
export function defaultVacationRules(country: string, dailyDivisor = DEFAULT_DAILY_DIVISOR): VacationRules {
  return {
    tiers: [
      { id: generateId(), minYears: 1, maxYears: 4, days: 14 },
      { id: generateId(), minYears: 5, maxYears: 9, days: 18 },
      { id: generateId(), minYears: 10, maxYears: null, days: 23 },
    ],
    formula: { hoursPerWeek: 40, weeksPerYear: 50, monthsPerYear: 12, dailyDivisor },
    deductions: { sfs: true, afp: true, isr: true },
    payStubLanguage: getPaystubLang(country),
  }
}

function loadStore(): VacationRulesStore {
  return storage.get<VacationRulesStore>(STORAGE_KEYS.VACATION_RULES) ?? {}
}

/**
 * Stored vacation rules for a country. Dominican Republic is pre-configured: when
 * nothing is stored yet it returns the statutory default (so DR is always "configured").
 * Other countries return null until an admin configures them.
 */
export function getVacationRules(country: string): VacationRules | null {
  const stored = loadStore()[country]
  if (stored) return stored
  if (country === 'Dominican Republic') return defaultVacationRules(country)
  return null
}

export function isVacationConfigured(country: string): boolean {
  return country === 'Dominican Republic' || !!loadStore()[country]
}

/** Persists rules for a country, stamping lastModified. Returns the saved rules. */
export function saveVacationRules(country: string, rules: VacationRules): VacationRules {
  const store = loadStore()
  const saved: VacationRules = { ...rules, lastModified: new Date().toISOString() }
  store[country] = saved
  storage.set(STORAGE_KEYS.VACATION_RULES, store)
  return saved
}

/** Vacation days for a given seniority, from the rule's tiers (0 if none match). */
export function getVacationDays(tiers: SeniorityTier[], yearsOfService: number): number {
  const tier = tiers.find((tr) => yearsOfService >= tr.minYears && (tr.maxYears === null || yearsOfService <= tr.maxYears))
  return tier?.days ?? 0
}

export interface VacationPayResult {
  days: number
  averageMonthlySalary: number
  dailySalary: number
  gross: number
  sfsAmount: number
  afpAmount: number
  isrApplies: boolean
  net: number
}

/**
 * Vacation pay for an employee, using the parameters stored in 'vacation_rules' for
 * their country (NOT hardcoded) — so edits in Settings → Vacation Rules take effect.
 *   avgMonthly = (hourlyRate × hoursPerWeek × weeksPerYear) ÷ monthsPerYear
 *   dailySalary = avgMonthly ÷ dailyDivisor
 *   gross = dailySalary × vacationDays
 * SFS/AFP are deducted when toggled (rates from fiscal params, DR defaults otherwise).
 * Returns null when the country has no configured rules.
 */
export function calculateVacationPay(
  country: string,
  hourlyRate: number,
  yearsOfService: number,
  rates: { sfsRate?: number; afpRate?: number } = {},
): VacationPayResult | null {
  const rules = getVacationRules(country)
  if (!rules) return null

  const { hoursPerWeek, weeksPerYear, monthsPerYear, dailyDivisor } = rules.formula
  const days = getVacationDays(rules.tiers, yearsOfService)
  const averageMonthlySalary = roundHalfUp((hourlyRate * hoursPerWeek * weeksPerYear) / (monthsPerYear || 1))
  const dailySalary = roundHalfUp(averageMonthlySalary / (dailyDivisor || 1))
  const gross = roundHalfUp(dailySalary * days)

  const sfsRate = rates.sfsRate ?? 3.04
  const afpRate = rates.afpRate ?? 2.87
  const sfsAmount = rules.deductions.sfs ? roundHalfUp(gross * (sfsRate / 100)) : 0
  const afpAmount = rules.deductions.afp ? roundHalfUp(gross * (afpRate / 100)) : 0
  const net = roundHalfUp(gross - sfsAmount - afpAmount)

  return { days, averageMonthlySalary, dailySalary, gross, sfsAmount, afpAmount, isrApplies: rules.deductions.isr, net }
}
