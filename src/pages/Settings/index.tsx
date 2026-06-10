import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useSettingsStore } from '@/store/settingsStore'
import { toast } from '@/hooks/useToast'

type Tab = 'company' | 'payroll' | 'fiscal' | 'email'

function CompanyTab() {
  const { t } = useTranslation()
  const company = useSettingsStore((s) => s.company)
  const updateCompany = useSettingsStore((s) => s.updateCompany)
  const [form, setForm] = useState(company)

  const handleSave = () => {
    updateCompany(form)
    toast({ variant: 'success', title: t('common.success'), description: t('common.saveChanges') })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('settings.company.title')}</CardTitle>
        <CardDescription>{t('settings.company.subtitle')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 max-w-lg">
        <div className="space-y-1.5">
          <Label>{t('settings.company.name')}</Label>
          <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        </div>
        <div className="space-y-1.5">
          <Label>{t('settings.company.rnc')}</Label>
          <Input value={form.rnc} onChange={(e) => setForm((f) => ({ ...f, rnc: e.target.value }))} />
        </div>
        <div className="space-y-1.5">
          <Label>{t('settings.company.address')}</Label>
          <Input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>{t('settings.company.phone')}</Label>
            <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>{t('settings.company.email')}</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          </div>
        </div>
        <Button onClick={handleSave}>{t('common.saveChanges')}</Button>
      </CardContent>
    </Card>
  )
}

function PayrollTab() {
  const { t } = useTranslation()
  const payroll = useSettingsStore((s) => s.payroll)
  const updatePayrollSettings = useSettingsStore((s) => s.updatePayrollSettings)
  const [form, setForm] = useState(payroll)

  const handleSave = () => {
    updatePayrollSettings(form)
    toast({ variant: 'success', title: t('common.success') })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('settings.payroll.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 max-w-lg">
        <div className="space-y-1.5">
          <Label>{t('settings.payroll.frequency')}</Label>
          <Select
            value={form.frequency}
            onValueChange={(v) => setForm((f) => ({ ...f, frequency: v as 'biweekly' | 'weekly' }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="biweekly">{t('settings.payroll.biweekly')}</SelectItem>
              <SelectItem value="weekly">{t('settings.payroll.weekly')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>{t('settings.payroll.otThreshold')}</Label>
          <Input
            type="number"
            min={0}
            value={form.otThresholdHours}
            onChange={(e) => setForm((f) => ({ ...f, otThresholdHours: Number(e.target.value) }))}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>{t('settings.payroll.otRate')}</Label>
            <Input
              type="number"
              min={0}
              value={form.otRatePercent}
              onChange={(e) => setForm((f) => ({ ...f, otRatePercent: Number(e.target.value) }))}
            />
            <p className="text-xs text-gray-400">{t('settings.payroll.otRateHelp')}</p>
          </div>
          <div className="space-y-1.5">
            <Label>{t('settings.payroll.holidayRate')}</Label>
            <Input
              type="number"
              min={0}
              value={form.holidayRatePercent}
              onChange={(e) => setForm((f) => ({ ...f, holidayRatePercent: Number(e.target.value) }))}
            />
            <p className="text-xs text-gray-400">{t('settings.payroll.holidayRateHelp')}</p>
          </div>
        </div>
        <Button onClick={handleSave}>{t('common.saveChanges')}</Button>
      </CardContent>
    </Card>
  )
}

function FiscalTab() {
  const { t } = useTranslation()
  const fiscal = useSettingsStore((s) => s.fiscal)
  const updateFiscalParameters = useSettingsStore((s) => s.updateFiscalParameters)
  const resetFiscalParameters = useSettingsStore((s) => s.resetFiscalParameters)
  const [form, setForm] = useState(fiscal)

  const handleSave = () => {
    updateFiscalParameters(form)
    toast({ variant: 'success', title: t('common.success') })
  }

  const handleReset = () => {
    resetFiscalParameters()
    setForm(fiscal)
    toast({ title: 'Reset to defaults' })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('settings.fiscal.title')}</CardTitle>
        <CardDescription>{t('settings.fiscal.subtitle')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 max-w-lg">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>{t('settings.fiscal.afpRate')}</Label>
            <Input
              type="number"
              step="0.01"
              value={form.afpRate}
              onChange={(e) => setForm((f) => ({ ...f, afpRate: Number(e.target.value) }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t('settings.fiscal.sfsRate')}</Label>
            <Input
              type="number"
              step="0.01"
              value={form.sfsRate}
              onChange={(e) => setForm((f) => ({ ...f, sfsRate: Number(e.target.value) }))}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>{t('settings.fiscal.minCotizableSalary')}</Label>
          <Input
            type="number"
            step="0.01"
            value={form.minCotizableSalary}
            onChange={(e) => setForm((f) => ({ ...f, minCotizableSalary: Number(e.target.value) }))}
          />
          <p className="text-xs text-gray-400">{t('settings.fiscal.minCotizableSalaryHelp')}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>{t('settings.fiscal.afpCap')}</Label>
            <Input
              type="number"
              value={form.afpCapMultiplier}
              onChange={(e) => setForm((f) => ({ ...f, afpCapMultiplier: Number(e.target.value) }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t('settings.fiscal.sfsCap')}</Label>
            <Input
              type="number"
              value={form.sfsCapMultiplier}
              onChange={(e) => setForm((f) => ({ ...f, sfsCapMultiplier: Number(e.target.value) }))}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>{t('settings.fiscal.dailyDivisor')}</Label>
          <Input
            type="number"
            step="0.01"
            value={form.dailyDivisor}
            onChange={(e) => setForm((f) => ({ ...f, dailyDivisor: Number(e.target.value) }))}
          />
          <p className="text-xs text-gray-400">{t('settings.fiscal.dailyDivisorHelp')}</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleSave}>{t('common.saveChanges')}</Button>
          <Button variant="outline" onClick={handleReset}>{t('settings.fiscal.resetToDefaults')}</Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function Settings() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<Tab>('company')

  const tabs: { key: Tab; label: string }[] = [
    { key: 'company', label: t('settings.tabs.company') },
    { key: 'payroll', label: t('settings.tabs.payroll') },
    { key: 'fiscal', label: t('settings.tabs.fiscal') },
    { key: 'email', label: t('settings.tabs.email') },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('settings.title')}</h1>
      </div>

      <div className="flex gap-1 rounded-xl bg-gray-100 p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'company' && <CompanyTab />}
      {activeTab === 'payroll' && <PayrollTab />}
      {activeTab === 'fiscal' && <FiscalTab />}
      {activeTab === 'email' && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-sm text-gray-500">{t('settings.tabs.email')} — coming in Phase 7</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
