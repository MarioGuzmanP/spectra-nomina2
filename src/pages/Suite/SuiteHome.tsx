import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSettingsStore } from '@/store/settingsStore'
import { SUITE_MODULES } from '@/lib/suiteModules'
import { Toaster } from '@/components/ui/toaster'

export default function SuiteHome() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const company = useSettingsStore((s) => s.company)

  useEffect(() => { document.title = 'Spectra Suite' }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-6 py-4">
          {company.logoBase64 ? (
            <img src={company.logoBase64} alt="logo" className="h-9 w-9 rounded-lg object-contain" />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-sm font-bold text-white">
              S
            </div>
          )}
          <div>
            <h1 className="text-lg font-bold text-gray-900">{t('suite.title')}</h1>
            <p className="text-xs text-gray-500">{company.name}</p>
          </div>
        </div>
      </header>

      {/* Module cards */}
      <main className="mx-auto max-w-3xl px-6 py-12">
        <p className="mb-6 text-center text-sm text-gray-500">{t('suite.subtitle')}</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {SUITE_MODULES.map((m) => {
            const clickable = m.active
            return (
              <button
                key={m.id}
                type="button"
                disabled={!clickable}
                onClick={() => clickable && navigate(m.path)}
                className={cn(
                  'group flex flex-col items-start gap-3 rounded-2xl border p-6 text-left transition-all',
                  clickable
                    ? 'cursor-pointer border-emerald-200 bg-white hover:border-emerald-400 hover:shadow-md'
                    : 'cursor-not-allowed border-gray-100 bg-gray-50 opacity-60',
                )}
              >
                <span className="text-3xl leading-none">{m.icon}</span>
                <span className="text-base font-semibold text-gray-900">{t(`suite.modules.${m.id}`)}</span>
                {clickable ? (
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600">
                    {t('suite.active')} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                ) : (
                  <span className="rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-semibold text-gray-500">
                    {t('suite.comingSoon')}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </main>
      <Toaster />
    </div>
  )
}
