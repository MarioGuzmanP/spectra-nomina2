import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/toaster'
import { getSuiteModule, type SuiteModuleId } from '@/lib/suiteModules'

/**
 * Two-panel shell for a placeholder Suite module (RRHH, Facturación, Gastos):
 * a module-specific sidebar (back button + module header, no nav items yet) and a
 * Coming Soon content area. The Nómina module uses its own Layout/Sidebar.
 */
export function ModuleShell({ moduleId }: { moduleId: SuiteModuleId }) {
  const { t } = useTranslation()
  const mod = getSuiteModule(moduleId)
  const name = t(`suite.modules.${moduleId}`)

  useEffect(() => { document.title = `${name} | Spectra Suite` }, [name])

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Module sidebar */}
      <aside className="flex h-full w-60 flex-col border-r border-gray-100 bg-white">
        <div className="border-b border-gray-100 px-4 py-3">
          <Link to="/suite" className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-emerald-700">
            <ArrowLeft className="h-3.5 w-3.5" /> {t('suite.back')}
          </Link>
        </div>
        <div className="flex items-center gap-2.5 border-b border-gray-100 px-6 py-4">
          <span className="text-xl leading-none">{mod.icon}</span>
          <span className="text-sm font-bold uppercase tracking-wide text-gray-900">{name}</span>
        </div>
        <nav className="flex-1 p-3" />
      </aside>

      {/* Coming Soon content */}
      <main className="flex flex-1 flex-col items-center justify-center gap-4 overflow-auto p-6 text-center">
        <span className="text-6xl leading-none">{mod.icon}</span>
        <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
        <p className="max-w-sm text-sm text-gray-500">{t('suite.comingSoonText')}</p>
        <Button variant="outline" asChild>
          <Link to="/suite">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> {t('suite.backToSuite')}
          </Link>
        </Button>
      </main>
      <Toaster />
    </div>
  )
}
