import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import FlexiSpaceHome from './pages/FlexiSpaceHome'
import FindWorkspace from './pages/FindWorkspace'
import Register from './pages/Register'
import Login from './pages/Login'
import WorkspaceOps from './pages/WorkspaceOps'
import Support from './pages/Support'
import AccountSettings from './pages/AccountSettings'
import Checkout from './pages/Checkout'
import FinancialReports from './pages/FinancialReports'
import MyBookings from './pages/MyBookings'
import Ticket from './pages/Ticket'
import CommandCenter from './pages/CommandCenter'
import AccessLogs from './pages/AccessLogs'
import OwnerDashboard from './pages/OwnerDashboard'
import BookingsCommandCenter from './pages/BookingsCommandCenter'
import NodeManager from './pages/NodeManager'
import AssetCommand from './pages/AssetCommand'
import FacilityOpsHub from './pages/FacilityOpsHub'
import ScannerControl from './pages/ScannerControl'
import TodaysBookings from './pages/TodaysBookings'
import UserManagement from './pages/UserManagement'
import BillingHistory from './pages/BillingHistory'
import OfficeDetails from './pages/OfficeDetails'
import { getRoleHome, loadProfileRole, normalizeRole } from './lib/authRoles'
import { useI18n } from './i18n'

function LoadingScreen() {
  const { t } = useI18n()
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <span className="font-inter text-[11px] uppercase tracking-[.1em] text-neutral-2">{t('common.loading')}</span>
    </div>
  )
}

function ProtectedRoute({ session, role, loadingRole, allowedRoles, children }) {
  if (!session) return <Navigate to="/login" replace />

  const normalizedRole = normalizeRole(role)

  // Show loading screen until role is resolved so we never flash wrong content
  if (allowedRoles?.length && loadingRole) return <LoadingScreen />

  // If a role whitelist is defined, any role not in it (including null) gets redirected
  if (allowedRoles?.length && !allowedRoles.includes(normalizedRole)) {
    return <Navigate to={getRoleHome(normalizedRole)} replace />
  }

  return children
}

export default function App() {
  const [session, setSession] = useState(null)
  const [loadingSession, setLoadingSession] = useState(true)
  const [profileRole, setProfileRole] = useState(null)
  const [loadingProfileRole, setLoadingProfileRole] = useState(false)

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession()
      .then(({ data }) => {
        if (!mounted) return
        setSession(data.session)
        setLoadingSession(false)
      })
      .catch(() => {
        if (!mounted) return
        setSession(null)
        setLoadingSession(false)
      })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      if (!nextSession) {
        setProfileRole(null)
        setLoadingProfileRole(false)
      }
      setLoadingSession(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    let mounted = true

    if (!session?.user) return () => { mounted = false }

    async function refreshProfileRole() {
      setLoadingProfileRole(true)
      try {
        const role = await loadProfileRole(supabase, session.user)
        if (!mounted) return
        setProfileRole(role)
        setLoadingProfileRole(false)
      } catch {
        if (!mounted) return
        setProfileRole(null)
        setLoadingProfileRole(false)
      }
    }

    refreshProfileRole()

    return () => { mounted = false }
  }, [session])

  if (loadingSession) {
    return <LoadingScreen />
  }

  const protect = (element, options = {}) => (
    <ProtectedRoute
      session={session}
      role={profileRole}
      loadingRole={loadingProfileRole}
      allowedRoles={options.allowedRoles}
    >
      {element}
    </ProtectedRoute>
  )

  const operatorMode = normalizeRole(profileRole) === 'OPERATOR'
  const operationalRoles = ['ADMIN', 'OWNER', 'OPERATOR']
  const userOnly = ['USER']
  const ownerPages = ['OWNER', 'ADMIN']

  return (
    <BrowserRouter basename="/FlexiSpace-Platform">
      <Routes>
        <Route path="/" element={<FlexiSpaceHome />} />
        <Route path="/find-workspace" element={protect(<FindWorkspace />, { allowedRoles: userOnly })} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/workspace-ops" element={protect(<WorkspaceOps />, { allowedRoles: ownerPages })} />
        <Route path="/support" element={<Support />} />
        <Route path="/settings" element={protect(<AccountSettings />)} />
        <Route path="/checkout" element={protect(<Checkout />, { allowedRoles: userOnly })} />
        <Route path="/billing" element={protect(<FinancialReports />, { allowedRoles: ownerPages })} />
        <Route path="/bookings" element={protect(<MyBookings />, { allowedRoles: userOnly })} />
        <Route path="/ticket" element={protect(<Ticket />, { allowedRoles: userOnly })} />
        <Route path="/command-center" element={protect(<CommandCenter />, { allowedRoles: operationalRoles })} />
        <Route path="/access-logs" element={protect(<AccessLogs operatorMode={operatorMode} />, { allowedRoles: operationalRoles })} />
        <Route path="/owner-dashboard" element={protect(<OwnerDashboard />, { allowedRoles: ownerPages })} />
        <Route path="/bookings-command-center" element={protect(<BookingsCommandCenter />, { allowedRoles: ownerPages })} />
        <Route path="/node-manager" element={protect(<NodeManager operatorMode={operatorMode} />, { allowedRoles: operationalRoles })} />
        <Route path="/asset-command" element={protect(<AssetCommand />, { allowedRoles: ownerPages })} />
        <Route path="/facility-ops-hub" element={protect(<FacilityOpsHub operatorMode={operatorMode} />, { allowedRoles: operationalRoles })} />
        <Route path="/scanner-control" element={protect(<ScannerControl />, { allowedRoles: operationalRoles })} />
        <Route path="/todays-bookings" element={protect(<TodaysBookings operatorMode={operatorMode} />, { allowedRoles: operationalRoles })} />
        <Route path="/admin/users" element={protect(<UserManagement />, { allowedRoles: ownerPages })} />
        <Route path="/billing-history" element={protect(<BillingHistory />, { allowedRoles: ownerPages })} />
        <Route path="/office/:id" element={protect(<OfficeDetails />, { allowedRoles: userOnly })} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
