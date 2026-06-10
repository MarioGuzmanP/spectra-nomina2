import type { ISRBracket } from '@/types'
import type { CalculationInput, CalculationResult } from './types'

/**
 * Half-up rounding to n decimal places.
 * JavaScript's default rounding can give wrong results for monetary values.
 */
export function roundHalfUp(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals)
  return Math.round((value + Number.EPSILON) * factor) / factor
}

/**
 * Format a monetary value as RD$ 1,234.56
 */
export function formatCurrency(value: number): string {
  const rounded = roundHalfUp(value, 2)
  return `RD$ ${rounded.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/**
 * Calculate hourly earnings (regular, OT, holiday).
 */
function calculateHourlyEarnings(
  hourlyRate: number,
  regularHours: number,
  otHours: number,
  holidayHours: number,
  otRatePercent: number,
  holidayRatePercent: number,
): { regularPay: number; otPay: number; holidayPay: number; grossPay: number } {
  const regularPay = roundHalfUp(hourlyRate * regularHours)
  const otMultiplier = 1 + otRatePercent / 100
  const holidayMultiplier = 1 + holidayRatePercent / 100
  const otPay = roundHalfUp(hourlyRate * otHours * otMultiplier)
  const holidayPay = roundHalfUp(hourlyRate * holidayHours * holidayMultiplier)
  const grossPay = roundHalfUp(regularPay + otPay + holidayPay)
  return { regularPay, otPay, holidayPay, grossPay }
}

/**
 * Calculate AFP deduction with cap.
 * Cap = afpCapMultiplier × minCotizableSalary (monthly equivalent).
 * For hourly employees the gross is the period gross; cap is applied on same basis.
 */
function calculateAFP(
  grossPay: number,
  afpRate: number,
  minCotizableSalary: number,
  afpCapMultiplier: number,
): { afpBase: number; afpAmount: number } {
  const cap = roundHalfUp(minCotizableSalary * afpCapMultiplier)
  const afpBase = Math.min(grossPay, cap)
  const afpAmount = roundHalfUp(afpBase * (afpRate / 100))
  return { afpBase, afpAmount }
}

/**
 * Calculate SFS deduction with cap.
 * Cap = sfsCapMultiplier × minCotizableSalary.
 */
function calculateSFS(
  grossPay: number,
  sfsRate: number,
  minCotizableSalary: number,
  sfsCapMultiplier: number,
): { sfsBase: number; sfsAmount: number } {
  const cap = roundHalfUp(minCotizableSalary * sfsCapMultiplier)
  const sfsBase = Math.min(grossPay, cap)
  const sfsAmount = roundHalfUp(sfsBase * (sfsRate / 100))
  return { sfsBase, sfsAmount }
}

/**
 * Calculate annual ISR from annualized taxable income.
 * Applies DGII 4-bracket scale.
 */
export function calculateAnnualISR(annualTaxable: number, brackets: ISRBracket[]): number {
  if (annualTaxable <= 0) return 0

  const sortedBrackets = [...brackets].sort((a, b) => a.minAmount - b.minAmount)

  for (const bracket of sortedBrackets) {
    const isInBracket =
      annualTaxable >= bracket.minAmount &&
      (bracket.maxAmount === null || annualTaxable <= bracket.maxAmount)

    if (isInBracket) {
      if (bracket.rate === 0) return 0
      const excess = roundHalfUp(annualTaxable - bracket.minAmount + 0.01)
      return roundHalfUp(bracket.fixedAmount + excess * (bracket.rate / 100))
    }
  }

  return 0
}

/**
 * Calculate ISR for a pay period.
 * Method: annualize the period gross → calculate annual ISR → pro-rate to period.
 *
 * For biweekly: periods per year = 24 (or 26 for weekly).
 * Strictly: annualized = grossPay × periodsPerYear.
 * Period ISR = annual ISR / periodsPerYear.
 */
function calculateISR(
  grossAfterTSS: number,
  frequency: 'biweekly' | 'weekly',
  brackets: ISRBracket[],
): { taxableIncome: number; isrMonthly: number; isrPeriod: number } {
  const periodsPerYear = frequency === 'biweekly' ? 24 : 52
  const annualTaxable = roundHalfUp(grossAfterTSS * periodsPerYear)
  const annualISR = calculateAnnualISR(annualTaxable, brackets)
  const isrPeriod = roundHalfUp(annualISR / periodsPerYear)
  const isrMonthly = roundHalfUp(annualISR / 12)
  return { taxableIncome: annualTaxable, isrMonthly, isrPeriod }
}

/**
 * Calculate custom deductions (fixed + percentage of gross).
 * Only active deductions are applied.
 */
function calculateCustomDeductions(
  grossPay: number,
  deductions: CalculationInput['customDeductions'],
): { breakdown: Array<{ name: string; amount: number }>; total: number } {
  const breakdown: Array<{ name: string; amount: number }> = []

  for (const deduction of deductions) {
    if (!deduction.active) continue
    let amount: number
    if (deduction.type === 'fixed') {
      amount = roundHalfUp(deduction.amount)
    } else {
      amount = roundHalfUp(grossPay * (deduction.amount / 100))
    }
    breakdown.push({ name: deduction.name, amount })
  }

  const total = roundHalfUp(breakdown.reduce((sum, d) => sum + d.amount, 0))
  return { breakdown, total }
}

/**
 * Main payroll calculation function.
 * Pure function — no side effects, no UI dependencies.
 */
export function calculatePayroll(input: CalculationInput): CalculationResult {
  const { hourlyRate, regularHours, otHours, holidayHours } = input
  const { fiscal, payroll, frequency } = input

  if (hourlyRate <= 0 || (regularHours + otHours + holidayHours) === 0) {
    return {
      regularPay: 0,
      otPay: 0,
      holidayPay: 0,
      grossPay: 0,
      afpBase: 0,
      afpAmount: 0,
      sfsBase: 0,
      sfsAmount: 0,
      tssTotal: 0,
      taxableIncome: 0,
      isrMonthly: 0,
      isrPeriod: 0,
      customDeductionsBreakdown: [],
      customDeductions: 0,
      totalDeductions: 0,
      netPay: 0,
    }
  }

  const earnings = calculateHourlyEarnings(
    hourlyRate,
    regularHours,
    otHours,
    holidayHours,
    payroll.otRatePercent,
    payroll.holidayRatePercent,
  )

  const afp = calculateAFP(
    earnings.grossPay,
    fiscal.afpRate,
    fiscal.minCotizableSalary,
    fiscal.afpCapMultiplier,
  )

  const sfs = calculateSFS(
    earnings.grossPay,
    fiscal.sfsRate,
    fiscal.minCotizableSalary,
    fiscal.sfsCapMultiplier,
  )

  const tssTotal = roundHalfUp(afp.afpAmount + sfs.sfsAmount)
  const grossAfterTSS = roundHalfUp(earnings.grossPay - tssTotal)

  const isr = calculateISR(grossAfterTSS, frequency, fiscal.isrBrackets)

  const customDeds = calculateCustomDeductions(earnings.grossPay, input.customDeductions)

  const totalDeductions = roundHalfUp(tssTotal + isr.isrPeriod + customDeds.total)
  const netPay = roundHalfUp(earnings.grossPay - totalDeductions)

  return {
    regularPay: earnings.regularPay,
    otPay: earnings.otPay,
    holidayPay: earnings.holidayPay,
    grossPay: earnings.grossPay,
    afpBase: afp.afpBase,
    afpAmount: afp.afpAmount,
    sfsBase: sfs.sfsBase,
    sfsAmount: sfs.sfsAmount,
    tssTotal,
    taxableIncome: isr.taxableIncome,
    isrMonthly: isr.isrMonthly,
    isrPeriod: isr.isrPeriod,
    customDeductionsBreakdown: customDeds.breakdown,
    customDeductions: customDeds.total,
    totalDeductions,
    netPay,
  }
}

/**
 * Split total hours for a week into regular and OT based on threshold.
 * Returns { regularHours, otHours }
 */
export function splitOTHours(
  totalHours: number,
  threshold: number,
): { regularHours: number; otHours: number } {
  if (totalHours <= threshold) {
    return { regularHours: totalHours, otHours: 0 }
  }
  return { regularHours: threshold, otHours: roundHalfUp(totalHours - threshold) }
}
