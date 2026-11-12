/**
 * Shared formatting helpers for currency, dates, names, and roles.
 */

export const formatCurrency = (amount?: number | null): string => {
  const value = Number.isFinite(amount) ? Number(amount) : 0;
  return `₹${value.toLocaleString('en-IN')}`;
};

export const formatCompactCurrency = (amount?: number | null): string => {
  const value = Number.isFinite(amount) ? Number(amount) : 0;
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1_00_00_000) return `${sign}₹${(abs / 1_00_00_000).toFixed(2)} Cr`;
  if (abs >= 1_00_000) return `${sign}₹${(abs / 1_00_000).toFixed(2)} L`;
  if (abs >= 1_000) return `${sign}₹${(abs / 1_000).toFixed(1)} K`;
  return formatCurrency(value);
};

export const formatDate = (value?: string | Date | null): string => {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const getInitials = (name?: string | null, fallback = 'BF'): string => {
  if (!name || !name.trim()) return fallback;
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.trim().slice(0, 2).toUpperCase();
};

export const formatRoleLabel = (role?: string | null): string => {
  if (!role) return 'Admin';
  switch (role.toUpperCase()) {
    case 'SITE_SUPERVISOR':
    case 'SUPERVISOR':
      return 'Site Supervisor';
    case 'PROJECT_MANAGER':
      return 'Project Manager';
    case 'FINANCE_MANAGER':
      return 'Finance Manager';
    case 'CONTRACTOR':
      return 'Contractor';
    case 'ADMIN':
      return 'Admin';
    default:
      return role
        .toLowerCase()
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
  }
};

