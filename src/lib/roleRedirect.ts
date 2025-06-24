/**
 * Utility function to get the correct dashboard URL based on user role
 */
export function getDashboardUrl(role: string): string {
  switch (role) {
    case 'admin':
      return '/dashboard/admin';
    case 'antrenor':
      return '/dashboard/antrenor';
    case 'membru':
    default:
      return '/dashboard/membru';
  }
}