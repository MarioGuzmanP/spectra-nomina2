import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Palmtree, Loader2, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useSettingsStore } from '@/store/settingsStore'
import { formatCurrencyWithSymbol } from '@/lib/payroll/calculations'
import { getCurrencySymbol } from '@/lib/payroll/rules'
import { formatDate } from '@/lib/utils'
import {
  getVacationRules, isVacationConfigured, getVacationDays, yearsOfService, calculateVacationPay,
} from '@/lib/vacations'
import {
  fetchVacations, getVacationsForEmployee, countVacationDays, type VacationRequest,
} from '@/lib/connectors/bamboohr-vacations'
import { VacationReceiptModal } from './VacationReceiptModal'
import type { Employee } from '@/types'

export function VacationInfoSection({ employee }: { employee: Employee }) {
  const { t } = useTranslation()
  const bamboo = useSettingsStore((s) => s.bamboohr)
  const year = new Date().getFullYear()
  const country = employee.country || ''
  const configured = isVacationConfigured(country)
  const rules = getVacationRules(country)
  const years = yearsOfService(employee.hireDate)
  const entitledDays = rules ? getVacationDays(rules.tiers, years) : 0
  const pay = calculateVacationPay(country, employee.payRate, years)
  const fmt = (n: number) => formatCurrencyWithSymbol(n, getCurrencySymbol(country))

  const [vacations, setVacations] = useState<VacationRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [receipt, setReceipt] = useState<{ days: number; label?: string } | null>(null)

  const connected = bamboo.connected && !!bamboo.subdomain && !!bamboo.apiKey

  useEffect(() => {
    if (!configured || !connected) return
    let cancelled = false
    setLoading(true)
    setError(false)
    fetchVacations(bamboo.subdomain, bamboo.apiKey, year)
      .then((all) => { if (!cancelled) setVacations(getVacationsForEmployee(employee.id, all)) })
      .catch(() => { if (!cancelled) setError(true) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [employee.id, configured, connected, bamboo.subdomain, bamboo.apiKey, year])

  if (!configured) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Palmtree className="h-4 w-4 text-emerald-600" /> {t('employees.vacation.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-400">{t('employees.vacation.notConfigured', { country: country || '—' })}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Palmtree className="h-4 w-4 text-emerald-600" /> {t('employees.vacation.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs text-gray-500">{t('employees.vacation.yearsOfService')}</dt>
            <dd className="mt-0.5 text-sm font-semibold text-gray-900">{years}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">{t('employees.vacation.entitledDays')}</dt>
            <dd className="mt-0.5 text-sm font-semibold text-gray-900">{entitledDays}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">{t('employees.vacation.estimatedPay')}</dt>
            <dd className="mt-0.5 text-sm font-semibold text-emerald-700">{pay ? fmt(pay.gross) : '—'}</dd>
          </div>
        </dl>

        {/* Vacation periods */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
            {t('employees.vacation.periods', { year })}
          </p>
          {!connected ? (
            <p className="text-sm text-gray-400">{t('employees.vacation.notConnected')}</p>
          ) : loading ? (
            <p className="flex items-center gap-2 text-sm text-gray-400"><Loader2 className="h-3.5 w-3.5 animate-spin" /> {t('employees.vacation.loading')}</p>
          ) : error ? (
            <p className="text-sm text-amber-600">{t('employees.vacation.fetchError')}</p>
          ) : vacations.length === 0 ? (
            <p className="text-sm text-gray-400">{t('employees.vacation.noPeriods', { year })}</p>
          ) : (
            <div className="space-y-1.5">
              {vacations.map((v) => {
                const realDays = countVacationDays(v.dates)
                const label = `${formatDate(v.start)} → ${formatDate(v.end)}`
                return (
                  <div key={v.id} className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2">
                    <div className="min-w-0">
                      <p className="text-sm text-gray-800">{label}</p>
                      <p className="text-xs text-gray-400">{t('employees.vacation.days', { count: realDays })}</p>
                    </div>
                    <Button variant="outline" size="sm" className="gap-1.5 shrink-0" onClick={() => setReceipt({ days: realDays, label })}>
                      <FileText className="h-3.5 w-3.5" /> {t('employees.vacation.receipt')}
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Entitlement-based receipt */}
        <Button onClick={() => setReceipt({ days: entitledDays })} className="gap-1.5">
          <FileText className="h-4 w-4" /> {t('employees.vacation.generateReceipt')}
        </Button>
      </CardContent>

      {receipt && (
        <VacationReceiptModal
          employee={employee}
          country={country}
          payRate={employee.payRate}
          days={receipt.days}
          periodLabel={receipt.label}
          onClose={() => setReceipt(null)}
        />
      )}
    </Card>
  )
}
