import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { formatCurrencyWithSymbol } from '@/lib/payroll/calculations'
import { getCurrencySymbol } from '@/lib/payroll/rules'
import { getPaystubLang } from '@/lib/pdf/paystubLabels'
import { calculateVacationPayForDays } from '@/lib/vacations'
import type { Employee } from '@/types'

const RECEIPT_LABELS = {
  en: {
    title: 'Vacation Receipt', period: 'Period', days: 'Vacation days',
    avgMonthly: 'Average monthly salary', dailySalary: 'Daily salary',
    gross: 'Vacation pay (gross)', sfs: 'SFS (3.04%)', afp: 'AFP (2.87%)', isr: 'ISR (applies)',
    net: 'Net to pay', close: 'Close',
  },
  es: {
    title: 'Recibo de Vacaciones', period: 'Período', days: 'Días de vacaciones',
    avgMonthly: 'Salario mensual promedio', dailySalary: 'Salario diario',
    gross: 'Pago de vacaciones (bruto)', sfs: 'SFS (3.04%)', afp: 'AFP (2.87%)', isr: 'ISR (aplica)',
    net: 'Neto a pagar', close: 'Cerrar',
  },
}

interface Props {
  employee: Employee
  country: string
  payRate: number
  days: number
  periodLabel?: string
  onClose: () => void
}

export function VacationReceiptModal({ employee, country, payRate, days, periodLabel, onClose }: Props) {
  const lang = getPaystubLang(country)
  const L = RECEIPT_LABELS[lang]
  const sym = getCurrencySymbol(country)
  const fmt = (n: number) => formatCurrencyWithSymbol(n, sym)

  const result = calculateVacationPayForDays(country, payRate, days)

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
                <Row label={L.days} value={String(result.days)} />
                <Row label={L.avgMonthly} value={fmt(result.averageMonthlySalary)} />
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
