import type { Employee } from '@/types'

interface BambooReportEmployee {
  id: string | number
  firstName?: string
  lastName?: string
  workEmail?: string
  payRate?: string
  payType?: string
  hireDate?: string
  employmentHistoryStatus?: string
  jobTitle?: string
  department?: string
}

interface BambooReportResponse {
  employees: BambooReportEmployee[]
}

/**
 * Parses BambooHR payRate string ("15.00 USD", "850.00 DOP", "").
 * Returns { rate, currency } where currency is "" when not configured.
 */
function parsePayRate(raw: string | null | undefined): { rate: number; currency: string } {
  if (!raw || !raw.trim()) return { rate: 0, currency: '' }
  const parts = raw.trim().split(' ')
  const rate = parseFloat(parts[0] ?? '0') || 0
  const currency = parts[1] ?? ''
  return { rate, currency }
}

function mapStatus(raw: string | null | undefined): Employee['status'] {
  const s = (raw ?? '').toLowerCase().trim()
  if (s === 'active') return 'Active'
  if (s === 'terminated') return 'Terminated'
  if (s === 'inactive') return 'Inactive'
  // Default: if no status in the report, assume Active (they're in the system)
  return 'Active'
}

export async function fetchBambooDirectory(
  subdomain: string,
  apiKey: string,
): Promise<Employee[]> {
  // Use custom report to get payRate, hireDate, and employmentHistoryStatus
  // which are NOT available via the /employees/directory endpoint
  const qs = new URLSearchParams({
    path: '/v1/reports/custom',
    subdomain,
    apiKey,
    format: 'JSON',
  })

  const res = await fetch(`/api/bamboohr?${qs.toString()}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fields: [
        'id',
        'firstName',
        'lastName',
        'workEmail',
        'payRate',
        'payType',
        'hireDate',
        'employmentHistoryStatus',
        'jobTitle',
        'department',
      ],
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' })) as { error?: string }
    throw new Error(err.error ?? `BambooHR error ${res.status}`)
  }

  const data = await res.json() as BambooReportResponse
  return (data.employees ?? []).map((e): Employee => {
    const { rate, currency } = parsePayRate(e.payRate)
    return {
      id: String(e.id),
      firstName: e.firstName ?? '',
      lastName: e.lastName ?? '',
      workEmail: e.workEmail ?? '',
      payRate: rate,
      payRateCurrency: currency,
      payType: e.payType === 'Hourly' ? 'Hourly' : 'Salary',
      jobTitle: e.jobTitle ?? '',
      department: e.department ?? '',
      hireDate: e.hireDate ?? '',
      status: mapStatus(e.employmentHistoryStatus),
      customDeductions: [],
    }
  })
}
