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
  isrPeriod: number
  customDeductionsBreakdown: Array<{ name: string; amount: number }>
  customDeductions: number
  totalDeductions: number
  netPay: number
}
