import { useTranslation } from 'react-i18next'
import { History as HistoryIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { usePayrollStore } from '@/store/payrollStore'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { PayrollPeriod } from '@/types'

function statusVariant(status: PayrollPeriod['status']): 'default' | 'secondary' | 'warning' {
  if (status === 'approved') return 'default'
  if (status === 'sent') return 'info' as 'default'
  return 'secondary'
}

export default function History() {
  const { t } = useTranslation()
  const history = usePayrollStore((s) => s.history)
  const sorted = [...history].reverse()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('history.title')}</h1>
        <p className="mt-1 text-sm text-gray-500">{t('history.subtitle')}</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                <HistoryIcon className="h-7 w-7 text-gray-400" />
              </div>
              <p className="mt-3 text-sm text-gray-500">{t('history.noHistory')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{t('history.table.period')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{t('history.table.processedDate')}</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">{t('history.table.employees')}</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">{t('history.table.totalGross')}</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">{t('history.table.totalNet')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{t('history.table.status')}</th>
                    <th className="px-6 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {sorted.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {formatDate(p.startDate)} – {formatDate(p.endDate)}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {p.processedDate ? formatDate(p.processedDate) : '—'}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-600">{p.totals.employeeCount}</td>
                      <td className="px-6 py-4 text-right font-medium text-gray-900">{formatCurrency(p.totals.totalGross)}</td>
                      <td className="px-6 py-4 text-right font-semibold text-emerald-700">{formatCurrency(p.totals.totalNet)}</td>
                      <td className="px-6 py-4">
                        <Badge variant={statusVariant(p.status)}>
                          {t(`history.status.${p.status}`)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Button variant="ghost" size="sm">{t('history.viewPayroll')}</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
