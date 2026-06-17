import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { formatCurrencyWithSymbol } from '@/lib/payroll/calculations'
import { getCurrencySymbol } from '@/lib/payroll/rules'
import { getPaystubLang } from '@/lib/pdf/paystubLabels'
import { calculateVacationPayForDays } from '@/lib/vacations'
import type { Employee } from '@/types'

const RECEIPT_LABELS = {
  en: {
    title: 'Vacation Receipt', period: 'Vacation Period', entitledDays: 'Entitled days',
    daysTaken: 'Days taken this period', avgMonthly: 'Average monthly salary', monthlySalary: 'Monthly salary',
    dailySalary: 'Daily salary',
    gross: 'Gross vacation pay', sfs: 'SFS (3.04%)', afp: 'AFP (2.87%)', isr: 'ISR (applies)',
    net: 'Net to pay', close: 'Close', approve: 'Approve payment',
  },
  es: {
    title: 'Recibo de Vacaciones', period: 'Período de vacaciones', entitledDays: 'Días con derecho',
    daysTaken: 'Días tomados este período', avgMonthly: 'Salario mensual promedio', monthlySalary: 'Salario mensual',
    dailySalary: 'Salario diario',
    gross: 'Pago de vacaciones (bruto)', sfs: 'SFS (3.04%)', afp: 'AFP (2.87%)', isr: 'ISR (aplica)',
    net: 'Neto a pagar', close: 'Cerrar', approve: 'Aprobar pago',
  },
}

export interface VacationPaymentResult {
  date: string
  amount: number
  gross: number
  days: number
  periodLabel?: string
}

interface Props {
  employee: Employee
  country: string
  payRate: number
  /** Entitled days from seniority (14 / 18 / 23) — drives the pay. */
  entitledDays: number
  /** Days actually taken in the triggering BambooHR request — informational only. */
  daysTaken?: number
  periodLabel?: string
  /** When provided, an "Approve payment" button records the once-per-year payment. */
  onConfirm?: (payment: VacationPaymentResult) => void
  onClose: () => void
}

export function VacationReceiptModal({ employee, country, payRate, entitledDays, daysTaken, periodLabel, onConfirm, onClose }: Props) {
  const lang = getPaystubLang(country)
  const L = RECEIPT_LABELS[lang]
  const sym = getCurrencySymbol(country)
  const fmt = (n: number) => formatCurrencyWithSymbol(n, sym)

  // Pay is computed on the ENTITLED days, never the BambooHR request days.
  // Salary employees: payRate IS the monthly salary; Hourly: annualized via the formula.
  const result = calculateVacationPayForDays(country, payRate, entitledDays, employee.payType)
  const monthlyLabel = employee.payType === 'Salary' ? L.monthlySalary : L.avgMonthly

  const confirm = () => {
    if (!result || !onConfirm) return
    onConfirm({
      date: new Date().toISOString(),
      amount: result.net,
      gross: result.gross,
      days: entitledDays,
      periodLabel,
    })
  }

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{L.title}</DialogTitle>
          <DialogDescription className="sr-only">{employee.firstName} {employee.lastName}</DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border border-gray-100 overflow-hidden text-sm">
          <div className="bg-gray-50 border-l-4 border-l-emerald-500 px-4 py-3">
            <p className="font-bold text-gray-900">{employee.firstName} {employee.lastName}</p>
            {periodLabel && <p className="text-xs text-gray-500 mt-0.5">{L.period}: {periodLabel}</p>}
          </div>
          {result ? (
            <table className="w-full">
              <tbody className="divide-y divide-gray-50">
                <Row label={L.entitledDays} value={String(entitledDays)} bold />
                {daysTaken != null && <Row label={L.daysTaken} value={String(daysTaken)} muted />}
                <Row label={monthlyLabel} value={fmt(result.averageMonthlySalary)} />
                <Row label={L.dailySalary} value={fmt(result.dailySalary)} />
                <Row label={L.gross} value={fmt(result.gross)} bold />
                {result.sfsAmount > 0 && <Row label={L.sfs} value={`(${fmt(result.sfsAmount)})`} red />}
                {result.afpAmount > 0 && <Row label={L.afp} value={`(${fmt(result.afpAmount)})`} red />}
                {result.isrApplies && <Row label={L.isr} value="✓" muted />}
              </tbody>
              <tfoot>
                <tr className="bg-emerald-50 border-t border-emerald-200">
                  <td className="px-4 py-3 font-extrabold text-emerald-800">{L.net}</td>
                  <td className="px-4 py-3 text-right font-extrabold text-emerald-600 text-base">{fmt(result.net)}</td>
                </tr>
              </tfoot>
            </table>
          ) : (
            <p className="px-4 py-6 text-center text-sm text-gray-400">—</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{L.close}</Button>
          {onConfirm && result && <Button onClick={confirm}>{L.approve}</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Row({ label, value, bold, red, muted }: { label: string; value: string; bold?: boolean; red?: boolean; muted?: boolean }) {
  return (
    <tr>
      <td className={`px-4 py-2 ${muted ? 'text-gray-400' : 'text-gray-700'}`}>{label}</td>
      <td className={`px-4 py-2 text-right ${bold ? 'font-bold text-gray-900' : red ? 'text-red-600' : 'text-gray-700'}`}>{value}</td>
    </tr>
  )
}
