import { describe, it, expect, beforeEach } from 'vitest'
import {
  defaultVacationRules, getVacationRules, isVacationConfigured, saveVacationRules,
  getVacationDays, calculateVacationPay,
} from '../vacations'

beforeEach(() => localStorage.clear())

describe('vacation rules', () => {
  it('DR is pre-configured with statutory tiers; others are not', () => {
    expect(isVacationConfigured('Dominican Republic')).toBe(true)
    expect(isVacationConfigured('Kenya')).toBe(false)
    const dr = getVacationRules('Dominican Republic')!
    expect(dr.tiers.map((t) => t.days)).toEqual([14, 18, 23])
    expect(dr.payStubLanguage).toBe('es')
    expect(getVacationRules('Kenya')).toBeNull()
  })

  it('default language is Spanish for Mexico, English for others', () => {
    expect(defaultVacationRules('Mexico').payStubLanguage).toBe('es')
    expect(defaultVacationRules('Jamaica').payStubLanguage).toBe('en')
  })

  it('getVacationDays maps seniority to the right tier', () => {
    const dr = getVacationRules('Dominican Republic')!
    expect(getVacationDays(dr.tiers, 3)).toBe(14)
    expect(getVacationDays(dr.tiers, 7)).toBe(18)
    expect(getVacationDays(dr.tiers, 12)).toBe(23)
    expect(getVacationDays(dr.tiers, 0)).toBe(0)
  })

  it('calculateVacationPay uses the formula (avgMonthly ÷ divisor × days)', () => {
    const r = calculateVacationPay('Dominican Republic', 200, 3)!
    // avgMonthly = 200×40×50/12 = 33,333.33; daily = /23.83 = 1,398.80; gross = ×14
    expect(r.days).toBe(14)
    expect(r.averageMonthlySalary).toBeCloseTo(33333.33, 2)
    expect(r.gross).toBeCloseTo(r.dailySalary * 14, 2)
    expect(r.net).toBeLessThan(r.gross) // SFS + AFP deducted by default
  })

  it('reflects edited parameters saved to storage (not hardcoded)', () => {
    const before = calculateVacationPay('Dominican Republic', 200, 3)!.gross
    const rules = getVacationRules('Dominican Republic')!
    saveVacationRules('Dominican Republic', { ...rules, formula: { ...rules.formula, weeksPerYear: 52 } })
    const after = calculateVacationPay('Dominican Republic', 200, 3)!.gross
    expect(after).toBeGreaterThan(before)
  })

  it('returns null for an unconfigured country', () => {
    expect(calculateVacationPay('Kenya', 200, 3)).toBeNull()
  })
})
