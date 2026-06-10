import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, XCircle, Loader2, Plug } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useSettingsStore } from '@/store/settingsStore'
import { toast } from '@/hooks/useToast'

function ConnectorStatus({ connected, testing }: { connected: boolean; testing: boolean }) {
  const { t } = useTranslation()
  if (testing) return <Badge variant="secondary"><Loader2 className="mr-1 h-3 w-3 animate-spin" />{t('connectors.status.testing')}</Badge>
  if (connected) return <Badge variant="default"><CheckCircle2 className="mr-1 h-3 w-3" />{t('connectors.status.connected')}</Badge>
  return <Badge variant="secondary"><XCircle className="mr-1 h-3 w-3" />{t('connectors.status.notConfigured')}</Badge>
}

function BambooHRConnector() {
  const { t } = useTranslation()
  const bamboohr = useSettingsStore((s) => s.bamboohr)
  const updateBambooHR = useSettingsStore((s) => s.updateBambooHR)
  const [testing, setTesting] = useState(false)

  const handleTest = async () => {
    if (!bamboohr.subdomain || !bamboohr.apiKey) {
      toast({ variant: 'destructive', title: t('errors.apiKeyMissing') })
      return
    }
    setTesting(true)
    try {
      const res = await fetch(
        `/api/bamboohr?path=/v1/employees/directory&subdomain=${encodeURIComponent(bamboohr.subdomain)}&apiKey=${encodeURIComponent(bamboohr.apiKey)}`,
      )
      if (!res.ok) throw new Error(await res.text())
      updateBambooHR({ connected: true })
      toast({ variant: 'success', title: t('connectors.status.connected'), description: t('connectors.bamboohr.connected') })
    } catch (err) {
      updateBambooHR({ connected: false })
      const msg = err instanceof Error ? err.message : t('errors.connectionFailed')
      toast({ variant: 'destructive', title: t('connectors.status.error'), description: msg })
    } finally {
      setTesting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
              <Plug className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <CardTitle className="text-base">{t('connectors.bamboohr.title')}</CardTitle>
              <CardDescription>{t('connectors.bamboohr.description')}</CardDescription>
            </div>
          </div>
          <ConnectorStatus connected={bamboohr.connected} testing={testing} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label>{t('connectors.bamboohr.subdomain')}</Label>
          <div className="flex items-center gap-2">
            <Input
              placeholder={t('connectors.bamboohr.subdomainPlaceholder')}
              value={bamboohr.subdomain}
              onChange={(e) => updateBambooHR({ subdomain: e.target.value, connected: false })}
            />
            <span className="shrink-0 text-sm text-gray-400">.bamboohr.com</span>
          </div>
          <p className="text-xs text-gray-400">{t('connectors.bamboohr.subdomainHelp')}</p>
        </div>
        <div className="space-y-1.5">
          <Label>{t('connectors.bamboohr.apiKey')}</Label>
          <Input
            type="password"
            placeholder={t('connectors.bamboohr.apiKeyPlaceholder')}
            value={bamboohr.apiKey}
            onChange={(e) => updateBambooHR({ apiKey: e.target.value, connected: false })}
          />
          <p className="text-xs text-gray-400">{t('connectors.bamboohr.apiKeyHelp')}</p>
        </div>
        <Button onClick={handleTest} disabled={testing} variant="outline">
          {testing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {t('common.testConnection')}
        </Button>
      </CardContent>
    </Card>
  )
}

function HubstaffConnector() {
  const { t } = useTranslation()
  const hubstaff = useSettingsStore((s) => s.hubstaff)
  const updateHubstaff = useSettingsStore((s) => s.updateHubstaff)
  const [testing, setTesting] = useState(false)

  const handleTest = async () => {
    if (!hubstaff.accessToken || !hubstaff.organizationId) {
      toast({ variant: 'destructive', title: t('errors.apiKeyMissing') })
      return
    }
    setTesting(true)
    try {
      const res = await fetch(
        `/api/hubstaff?endpoint=organizations/${encodeURIComponent(hubstaff.organizationId)}/members&token=${encodeURIComponent(hubstaff.accessToken)}`,
      )
      if (!res.ok) throw new Error(await res.text())
      updateHubstaff({ connected: true })
      toast({ variant: 'success', title: t('connectors.status.connected') })
    } catch (err) {
      updateHubstaff({ connected: false })
      const msg = err instanceof Error ? err.message : t('errors.connectionFailed')
      toast({ variant: 'destructive', title: t('connectors.status.error'), description: msg })
    } finally {
      setTesting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
              <Plug className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-base">{t('connectors.hubstaff.title')}</CardTitle>
              <CardDescription>{t('connectors.hubstaff.description')}</CardDescription>
            </div>
          </div>
          <ConnectorStatus connected={hubstaff.connected} testing={testing} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label>{t('connectors.hubstaff.accessToken')}</Label>
          <Input
            type="password"
            placeholder={t('connectors.hubstaff.accessTokenPlaceholder')}
            value={hubstaff.accessToken}
            onChange={(e) => updateHubstaff({ accessToken: e.target.value, connected: false })}
          />
        </div>
        <div className="space-y-1.5">
          <Label>{t('connectors.hubstaff.organizationId')}</Label>
          <Input
            placeholder={t('connectors.hubstaff.organizationIdPlaceholder')}
            value={hubstaff.organizationId}
            onChange={(e) => updateHubstaff({ organizationId: e.target.value, connected: false })}
          />
        </div>
        <Button onClick={handleTest} disabled={testing} variant="outline">
          {testing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {t('common.testConnection')}
        </Button>
      </CardContent>
    </Card>
  )
}

export default function Connectors() {
  const { t } = useTranslation()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('connectors.title')}</h1>
        <p className="mt-1 text-sm text-gray-500">{t('connectors.subtitle')}</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-1 xl:grid-cols-1 max-w-2xl">
        <BambooHRConnector />
        <HubstaffConnector />
      </div>
    </div>
  )
}
