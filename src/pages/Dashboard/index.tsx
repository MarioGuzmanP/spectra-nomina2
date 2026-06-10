import { useTranslation } from 'react-i18next'
import { DollarSign, Users, TrendingDown, TrendingUp, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { usePayrollStore } from '@/store/payrollStore'
import { useEmployeesStore } from '@/store/employeesStore'
import { formatCurrency } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  colorClass: string
  bgClass: string
}

function StatCard({ title, value, icon: Icon, colorClass, bgClass }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
          </div>
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${bgClass}`}>
            <Icon className={`h-6 w-6 ${colorClass}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function Dashboard() {
  const { t } = useTranslation()
  const history = usePayrollStore((s) => s.history)
  const employees = useEmployeesStore((s) => s.employees)

  const lastPayroll = history[history.length - 1]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.title')}</h1>
        <p className="mt-1 text-sm text-gray-500">{t('dashboard.subtitle')}</p>
      </div>

      {lastPayroll ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title={t('dashboard.totalGross')}
              value={formatCurrency(lastPayroll.totals.totalGross)}
              icon={DollarSign}
              colorClass="text-emerald-600"
              bgClass="bg-emerald-50"
            />
            <StatCard
              title={t('dashboard.totalDeductions')}
              value={formatCurrency(lastPayroll.totals.totalDeductions)}
              icon={TrendingDown}
              colorClass="text-red-500"
              bgClass="bg-red-50"
            />
            <StatCard
              title={t('dashboard.totalNet')}
              value={formatCurrency(lastPayroll.totals.totalNet)}
              icon={TrendingUp}
              colorClass="text-blue-500"
              bgClass="bg-blue-50"
            />
            <StatCard
              title={t('dashboard.employeeCount')}
              value={String(lastPayroll.totals.employeeCount)}
              icon={Users}
              colorClass="text-purple-500"
              bgClass="bg-purple-50"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.recentPayrolls')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...history].reverse().slice(0, 5).map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {p.startDate} – {p.endDate}
                      </p>
                      <p className="text-xs text-gray-500">
                        {p.totals.employeeCount} {t('common.employees')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCurrency(p.totals.totalNet)}
                      </p>
                      <p className="text-xs text-gray-400">{t('dashboard.net')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
              <DollarSign className="h-8 w-8 text-emerald-600" />
            </div>
            <p className="mt-4 text-sm text-gray-500">{t('dashboard.noPayrollData')}</p>
            <Button asChild className="mt-4">
              <Link to="/payroll">
                {t('dashboard.processPayroll')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.quickActions')}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/payroll">{t('dashboard.processPayroll')}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/employees">{t('dashboard.syncEmployees')}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/history">{t('nav.history')}</Link>
          </Button>
        </CardContent>
      </Card>

      {employees.length === 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <p className="text-sm text-amber-700">
              No employees found.{' '}
              <Link to="/connectors" className="font-medium underline">
                Configure BambooHR
              </Link>{' '}
              and sync employees to get started.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
