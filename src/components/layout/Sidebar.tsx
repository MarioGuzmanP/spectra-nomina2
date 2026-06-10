import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard,
  Users,
  DollarSign,
  History,
  Plug,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSettingsStore } from '@/store/settingsStore'

const navItems = [
  { key: 'dashboard', to: '/', icon: LayoutDashboard, end: true },
  { key: 'employees', to: '/employees', icon: Users, end: false },
  { key: 'payroll', to: '/payroll', icon: DollarSign, end: false },
  { key: 'history', to: '/history', icon: History, end: false },
  { key: 'connectors', to: '/connectors', icon: Plug, end: false },
  { key: 'settings', to: '/settings', icon: Settings, end: false },
]

export function Sidebar() {
  const { t } = useTranslation()
  const company = useSettingsStore((s) => s.company)

  return (
    <aside className="flex h-full w-60 flex-col border-r border-gray-100 bg-white">
      {/* Logo / company name */}
      <div className="flex h-16 items-center gap-3 border-b border-gray-100 px-6">
        {company.logoBase64 ? (
          <img src={company.logoBase64} alt="logo" className="h-8 w-8 rounded-lg object-contain" />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-xs font-bold text-white">
            {company.name.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="truncate text-sm font-semibold text-gray-900">{company.name}</span>
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

      {/* Footer */}
      <div className="border-t border-gray-100 p-4">
        <p className="text-xs text-gray-400">Spectra Payroll v0.1</p>
      </div>
    </aside>
  )
}
