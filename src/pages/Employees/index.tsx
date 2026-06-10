import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RefreshCw, Search, User } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Pagination } from '@/components/ui/pagination'
import { useEmployeesStore } from '@/store/employeesStore'
import { useSettingsStore } from '@/store/settingsStore'
import { fetchBambooDirectory } from '@/lib/connectors/bamboohr'
import { toast } from '@/hooks/useToast'
import { formatCurrency, formatDate, getInitials } from '@/lib/utils'
import type { Employee } from '@/types'

const PAGE_SIZE = 25

function statusVariant(status: Employee['status']): 'default' | 'secondary' | 'destructive' {
  if (status === 'Active') return 'default'
  if (status === 'Inactive') return 'secondary'
  return 'destructive'
}

export default function Employees() {
  const { t } = useTranslation()
  const employees = useEmployeesStore((s) => s.employees)
  const setEmployees = useEmployeesStore((s) => s.setEmployees)
  const setLastSync = useEmployeesStore((s) => s.setLastSync)
  const bamboohr = useSettingsStore((s) => s.bamboohr)
  const [search, setSearch] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [page, setPage] = useState(1)

  const filtered = employees.filter((e) => {
    const q = search.toLowerCase()
    return (
      `${e.firstName} ${e.lastName}`.toLowerCase().includes(q) ||
      e.workEmail.toLowerCase().includes(q) ||
      e.department.toLowerCase().includes(q) ||
      e.jobTitle.toLowerCase().includes(q)
    )
  })

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleSync = async () => {
    if (!bamboohr.subdomain || !bamboohr.apiKey) {
      toast({ variant: 'destructive', title: t('errors.apiKeyMissing'), description: t('connectors.bamboohr.notConnected') })
      return
    }
    setSyncing(true)
    try {
      const synced = await fetchBambooDirectory(bamboohr.subdomain, bamboohr.apiKey)
      // Preserve existing customDeductions and hubstaffUserId when re-syncing
      const merged = synced.map((fresh) => {
        const existing = employees.find((e) => e.id === fresh.id)
        return existing
          ? { ...fresh, customDeductions: existing.customDeductions, hubstaffUserId: existing.hubstaffUserId }
          : fresh
      })
      setEmployees(merged)
      setLastSync(new Date().toISOString())
      setPage(1)
      toast({ variant: 'success', title: t('employees.syncSuccess') })
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('errors.syncFailed')
      toast({ variant: 'destructive', title: t('employees.syncError'), description: msg })
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('employees.title')}</h1>
          <p className="mt-1 text-sm text-gray-500">{t('employees.subtitle')}</p>
        </div>
        <Button onClick={handleSync} disabled={syncing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? t('common.syncing') : t('employees.syncButton')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder={t('common.search')}
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9"
              />
            </div>
            <CardDescription className="whitespace-nowrap">
              {t('common.showing', { count: filtered.length, total: employees.length })}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                <User className="h-7 w-7 text-gray-400" />
              </div>
              <p className="mt-3 text-sm text-gray-500">{t('employees.noEmployees')}</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{t('employees.table.name')}</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{t('employees.table.department')}</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{t('employees.table.jobTitle')}</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">{t('employees.table.payRate')}</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{t('employees.table.hireDate')}</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{t('employees.table.status')}</th>
                      <th className="px-6 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {paginated.map((emp) => (
                      <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">
                              {getInitials(emp.firstName, emp.lastName)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{emp.firstName} {emp.lastName}</p>
                              <p className="text-xs text-gray-400">{emp.workEmail}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{emp.department || '—'}</td>
                        <td className="px-6 py-4 text-gray-600">{emp.jobTitle || '—'}</td>
                        <td className="px-6 py-4 text-right font-medium text-gray-900">
                          {formatCurrency(emp.payRate)}/hr
                        </td>
                        <td className="px-6 py-4 text-gray-500">{formatDate(emp.hireDate)}</td>
                        <td className="px-6 py-4">
                          <Badge variant={statusVariant(emp.status)}>
                            {t(`employees.status.${emp.status.toLowerCase()}`)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/employees/${emp.id}`}>{t('common.viewDetails')}</Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                page={page}
                pageSize={PAGE_SIZE}
                total={filtered.length}
                onPage={setPage}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
