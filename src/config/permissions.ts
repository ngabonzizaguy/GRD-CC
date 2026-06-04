/**
 * Permission keys and labels for RBAC.
 * Must match backend models.Permission* constants.
 */
export const PERMISSION_OPTIONS: { value: string; label: string }[] = [
  { value: 'user_management', label: 'User management' },
  { value: 'driver_management', label: 'Driver management' },
  { value: 'vehicle_management', label: 'Vehicle management' },
  { value: 'order_management', label: 'Order management' },
  { value: 'payment_management', label: 'Payment management' },
  { value: 'financial_management', label: 'Financial management' },
  { value: 'system_config', label: 'System config' },
  { value: 'analytics', label: 'Analytics' },
  { value: 'customer_support', label: 'Customer support' },
  { value: 'admin_management', label: 'Admin management' },
  { value: 'audit_logs', label: 'Audit logs' },
  { value: 'emergency_actions', label: 'Emergency actions' },
  { value: 'verify_codes', label: 'Generated OTPs (view/expire/cleanup)' },
];

export const ADMIN_ROLES = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'admin', label: 'Admin' },
  { value: 'moderator', label: 'Moderator' },
  { value: 'support', label: 'Support' },
  { value: 'analyst', label: 'Analyst' },
] as const;
