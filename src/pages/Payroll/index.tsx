import { useTranslation } from 'react-i18next'
import { DollarSign } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

export default function Payroll() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('payroll.title')}</h1>
        <p className="mt-1 text-sm text-gray-500">{t('payroll.subtitle')}</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
            <DollarSign className="h-8 w-8 text-emerald-600" />
          </div>
          <p className="mt-4 font-medium text-gray-900">Payroll Processing</p>
          <p className="mt-1 text-sm text-gray-500">Full payroll flow coming in Phase 5.</p>
          <Button className="mt-4" asChild>
            <Link to="/connectors">Configure Connectors First</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
