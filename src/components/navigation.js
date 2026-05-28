const NAV_LABEL_KEYS = {
  'Command Center': 'nav.commandCenter',
  Command: 'nav.command',
  "Today's Bookings": 'nav.todaysBookings',
  "Today's": 'nav.todays',
  'Scanner Control': 'nav.scannerControl',
  Scanner: 'nav.scanner',
  'Live Access Feed': 'nav.liveAccessFeed',
  Access: 'nav.access',
  'Facility Ops Hub': 'nav.facilityOpsHub',
  Facility: 'nav.facility',
  Overview: 'nav.overview',
  Operations: 'nav.operations',
  'Space Assets': 'nav.spaceAssets',
  'IoT Infrastructure': 'nav.iotInfrastructure',
  Financials: 'nav.financials',
  Members: 'nav.members',
  Dashboard: 'nav.dashboard',
  'Live Operations': 'nav.liveOperations',
  'Bookings Command': 'nav.bookingsCommand',
  'Asset Management': 'nav.assetManagement',
  'Maintenance Hub': 'nav.maintenanceHub',
  'IoT Nodes': 'nav.iotNodes',
  'Access Control': 'nav.accessControl',
  'Financial Reports': 'nav.financialReports',
  'User Management': 'nav.userManagement',
  'Find Workspace': 'nav.findWorkspace',
  'My Bookings': 'nav.myBookings',
  Favorites: 'nav.favorites',
  Profile: 'nav.profile',
  Explore: 'nav.explore',
  Bookings: 'nav.bookings',
  Network: 'nav.network',
  Support: 'common.support',
  Payments: 'nav.payments',
  'Billing History': 'nav.billingHistory',
  Workspaces: 'nav.workspaces',
  Analytics: 'nav.analytics',
  Settings: 'common.settings',
}

const STATUS_KEYS = {
  PENDING_APPROVAL: 'status.PENDING_APPROVAL',
  PAYMENT_PENDING: 'status.PAYMENT_PENDING',
  CONFIRMED: 'status.CONFIRMED',
  CHECKED_IN: 'status.CHECKED_IN',
  CHECKED_OUT: 'status.CHECKED_OUT',
  COMPLETED: 'status.COMPLETED',
  CANCELLED: 'status.CANCELLED',
  REJECTED: 'status.REJECTED',
  APPROVED: 'status.APPROVED',
  EXPIRED: 'status.EXPIRED',
  NO_SHOW: 'status.NO_SHOW',
  REFUNDED: 'status.REFUNDED',
  'pending-ack': 'status.pendingAck',
  granted: 'status.granted',
  denied: 'status.denied',
  revoked: 'status.revoked',
  ACTIVE: 'status.active',
  INACTIVE: 'status.inactive',
  MAINTENANCE: 'status.maintenance',
  active: 'status.active',
  inactive: 'status.inactive',
  maintenance: 'status.maintenance',
  open: 'status.open',
  assigned: 'status.assigned',
  in_progress: 'status.inProgress',
  completed: 'status.completed',
}

export function translateNavLabel(label, t) {
  return t(NAV_LABEL_KEYS[label] ?? label)
}

export function translateStatusLabel(status, t, fallback) {
  if (status == null) return fallback ?? ''
  const key = STATUS_KEYS[status]
  if (key) return t(key)
  return fallback ?? String(status).replace(/[_-]+/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase())
}

export function translateNavItem(item, t) {
  return {
    ...item,
    label: translateNavLabel(item.label, t),
    shortLabel: item.shortLabel ? translateNavLabel(item.shortLabel, t) : item.shortLabel,
  }
}

export function translateNavGroup(group, t) {
  return {
    ...group,
    label: translateNavLabel(group.label, t),
    items: group.items?.map((item) => translateNavItem(item, t)),
  }
}
