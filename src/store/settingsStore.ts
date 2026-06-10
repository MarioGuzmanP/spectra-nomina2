import { create } from 'zustand'
import { storage, STORAGE_KEYS } from '@/lib/storage'
import { DEFAULT_FISCAL_PARAMETERS, DEFAULT_PAYROLL_SETTINGS } from '@/lib/payroll/constants'
import type {
  AppSettings,
  BambooHRConfig,
  CompanySettings,
  EmailConfig,
  EmailTemplate,
  FiscalParameters,
  HubstaffConfig,
  PayrollSettings,
} from '@/types'

const defaultCompany: CompanySettings = {
  name: 'My Company',
  rnc: '',
  address: '',
  phone: '',
  email: '',
  accentColor: '#059669',
}

const defaultBambooHR: BambooHRConfig = {
  subdomain: '',
  apiKey: '',
  connected: false,
}

const defaultHubstaff: HubstaffConfig = {
  accessToken: '',
  organizationId: '',
  connected: false,
  employeeMapping: [],
}

const defaultEmail: EmailConfig = {
  provider: 'resend',
  fromName: '',
  fromEmail: '',
  connected: false,
}

const defaultEmailTemplate: EmailTemplate = {
  subject: 'Pay Stub - {period} | {company}',
  body: 'Dear {name},\n\nPlease find attached your pay stub for the period {period}.\n\nBest regards,\n{company}',
  payStubLanguage: 'es',
}

interface SettingsState extends AppSettings {
  updateCompany: (data: Partial<CompanySettings>) => void
  updatePayrollSettings: (data: Partial<PayrollSettings>) => void
  updateFiscalParameters: (data: Partial<FiscalParameters>) => void
  resetFiscalParameters: () => void
  updateBambooHR: (data: Partial<BambooHRConfig>) => void
  updateHubstaff: (data: Partial<HubstaffConfig>) => void
  updateEmailConfig: (data: Partial<EmailConfig>) => void
  updateEmailTemplate: (data: Partial<EmailTemplate>) => void
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  company: storage.get<CompanySettings>(STORAGE_KEYS.COMPANY) ?? defaultCompany,
  payroll: storage.get<PayrollSettings>(STORAGE_KEYS.PAYROLL_SETTINGS) ?? DEFAULT_PAYROLL_SETTINGS,
  fiscal: storage.get<FiscalParameters>(STORAGE_KEYS.FISCAL_PARAMETERS) ?? DEFAULT_FISCAL_PARAMETERS,
  bamboohr: storage.get<BambooHRConfig>(STORAGE_KEYS.BAMBOOHR_CONFIG) ?? defaultBambooHR,
  hubstaff: storage.get<HubstaffConfig>(STORAGE_KEYS.HUBSTAFF_CONFIG) ?? defaultHubstaff,
  email: storage.get<EmailConfig>(STORAGE_KEYS.EMAIL_CONFIG) ?? defaultEmail,
  emailTemplate: storage.get<EmailTemplate>(STORAGE_KEYS.EMAIL_TEMPLATE) ?? defaultEmailTemplate,

  updateCompany: (data) => {
    const updated = { ...get().company, ...data }
    storage.set(STORAGE_KEYS.COMPANY, updated)
    set({ company: updated })
  },

  updatePayrollSettings: (data) => {
    const updated = { ...get().payroll, ...data }
    storage.set(STORAGE_KEYS.PAYROLL_SETTINGS, updated)
    set({ payroll: updated })
  },

  updateFiscalParameters: (data) => {
    const updated = { ...get().fiscal, ...data }
    storage.set(STORAGE_KEYS.FISCAL_PARAMETERS, updated)
    set({ fiscal: updated })
  },

  resetFiscalParameters: () => {
    storage.set(STORAGE_KEYS.FISCAL_PARAMETERS, DEFAULT_FISCAL_PARAMETERS)
    set({ fiscal: DEFAULT_FISCAL_PARAMETERS })
  },

  updateBambooHR: (data) => {
    const updated = { ...get().bamboohr, ...data }
    storage.set(STORAGE_KEYS.BAMBOOHR_CONFIG, updated)
    set({ bamboohr: updated })
  },

  updateHubstaff: (data) => {
    const updated = { ...get().hubstaff, ...data }
    storage.set(STORAGE_KEYS.HUBSTAFF_CONFIG, updated)
    set({ hubstaff: updated })
  },

  updateEmailConfig: (data) => {
    const updated = { ...get().email, ...data }
    storage.set(STORAGE_KEYS.EMAIL_CONFIG, updated)
    set({ email: updated })
  },

  updateEmailTemplate: (data) => {
    const updated = { ...get().emailTemplate, ...data }
    storage.set(STORAGE_KEYS.EMAIL_TEMPLATE, updated)
    set({ emailTemplate: updated })
  },
}))
