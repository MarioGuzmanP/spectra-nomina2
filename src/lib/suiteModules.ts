// Spectra Suite module registry. The Nómina module is the existing payroll app;
// the others are placeholders with a Coming Soon screen.

export type SuiteModuleId = 'rrhh' | 'nomina' | 'facturacion' | 'gastos'

export interface SuiteModule {
  id: SuiteModuleId
  icon: string   // emoji
  path: string
  active: boolean
}

// Order matches the 2×2 suite grid: RRHH | Nómina / Facturación | Gastos.
export const SUITE_MODULES: SuiteModule[] = [
  { id: 'rrhh', icon: '🏢', path: '/rrhh', active: false },
  { id: 'nomina', icon: '💵', path: '/nomina', active: true },
  { id: 'facturacion', icon: '🧾', path: '/facturacion', active: false },
  { id: 'gastos', icon: '💸', path: '/gastos', active: false },
]

export const getSuiteModule = (id: SuiteModuleId): SuiteModule =>
  SUITE_MODULES.find((m) => m.id === id)!
