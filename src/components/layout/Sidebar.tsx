import { NavLink, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard,
  Users,
  DollarSign,
  History,
  Plug,
  Settings,
  ArrowLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSettingsStore } from '@/store/settingsStore'

const navItems = [
  { key: 'dashboard', to: '/nomina/dashboard', icon: LayoutDashboard, end: false },
  { key: 'employees', to: '/nomina/employees', icon: Users, end: false },
  { key: 'payroll', to: '/nomina/payroll', icon: DollarSign, end: false },
  { key: 'history', to: '/nomina/history', icon: History, end: false },
  { key: 'connectors', to: '/nomina/connectors', icon: Plug, end: false },
  { key: 'settings', to: '/nomina/settings', icon: Settings, end: false },
]

export function Sidebar() {
  const { t } = useTranslation()
  const company = useSettingsStore((s) => s.company)

  return (
    <aside className="flex h-full w-60 flex-col border-r border-gray-100 bg-white">
      {/* Back to Spectra Suite */}
      <div className="border-b border-gray-100 px-4 py-3">
        <Link to="/suite" className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-emerald-700">
          <ArrowLeft className="h-3.5 w-3.5" /> {t('suite.back')}
        </Link>
      </div>

      {/* Module brand */}
      <div className="flex h-14 items-center gap-2.5 border-b border-gray-100 px-6">
        <span className="text-lg leading-none">💵</span>
        <span className="text-sm font-bold uppercase tracking-wide text-gray-900">{t('suite.modules.nomina')}</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map(({ key, to, icon: Icon, end }) => (
          <NavLink
            key={key}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {t(`nav.${key}`)}
          </NavLink>
        ))}
      </nav>

      {/* Footer: company + version */}
      <div className="flex items-center gap-2 border-t border-gray-100 p-4">
        {company.logoBase64 ? (
          <img src={company.logoBase64} alt="logo" className="h-6 w-6 rounded-md object-contain" />
        ) : (
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-600 text-[10px] font-bold text-white">
            {company.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-gray-700">{company.name}</p>
          <p className="text-[10px] text-gray-400">Spectra Payroll v0.1</p>
        </div>
      </div>
    </aside>
  )
}
