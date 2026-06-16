import type { CustomDeduction, FiscalParameters, PayrollSettings } from '@/types'

export interface CalculationInput {
  employeeId: string
  hourlyRate: number
  regularHours: number
  otHours: number
  holidayHours: number
  customDeductions: CustomDeduction[]
  fiscal: FiscalParameters
  payroll: PayrollSettings
  frequency: 'biweekly' | 'weekly'
  // Period start date (YYYY-MM-DD). Used to auto-detect DR biweekly quincena rule:
  //   day 1-15  → 1st quincena: ISR calculated but retained = 0
  //   day 16-31 → 2nd quincena: ISR retained = isrCalculated × 2
  periodStart?: string
}

export interface CalculationResult {
  regularPay: number
  otPay: number
  holidayPay: number
  grossPay: number
  afpBase: number
  afpAmount: number
  sfsBase: number
  sfsAmount: number
  tssTotal: number
  taxableIncome: number
  isrMonthly: number
  // ISR calculated for this period (gross × 24 → annual ISR ÷ 24)
  isrCalculated: number
  // ISR actually retained this period: 0 on 1st quincena, isrCalculated+prev on 2nd, normal otherwise
  isrPeriod: number
  customDeductionsBreakdown: Array<{ name: string; amount: number }>
  customDeductions: number
  totalDeductions: number
  netPay: number
}
