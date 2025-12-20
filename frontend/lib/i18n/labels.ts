export type ModuleStatus = 'active' | 'partial' | 'inactive';

export const moduleLabels: Record<string, string> = {
  trends: 'روندها',
  weak_signals: 'نشانه‌های ضعیف',
  critical_uncertainties: 'عدم‌قطعیت‌های کلیدی',
  scenarios: 'سناریوها',
  roadmapping: 'نقشه راه'
};

export const moduleStatusLabels: Record<ModuleStatus, string> = {
  active: 'فعال',
  partial: 'جزئی',
  inactive: 'غیرفعال'
};

export const moduleStatusBadges: Record<ModuleStatus, string> = {
  active: 'badge-success',
  partial: 'badge-warning',
  inactive: 'badge-muted'
};

export const getModuleLabel = (key: string) => moduleLabels[key] ?? key;
export const getModuleStatusLabel = (status: ModuleStatus | string) =>
  moduleStatusLabels[status as ModuleStatus] ?? status;
export const getModuleStatusBadge = (status: ModuleStatus | string) =>
  moduleStatusBadges[status as ModuleStatus] ?? 'badge-muted';
