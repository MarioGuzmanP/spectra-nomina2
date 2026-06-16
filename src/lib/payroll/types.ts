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
  // DR biweekly rule: ISR deferred on 1st quincena, doubled on 2nd
  quincena?: 1 | 2 | null
  // ISR calculated (but deferred) from the 1st quincena — added to 2nd quincena retained amount
  // If undefined when quincena===2, falls back to current period's ISR (assumes same gross)
  previousQuincenaIsr?: number
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
