import { describe, expect, it } from 'vitest';
import { dashboardConfigForRoles } from './dashboard.config';

describe('dashboardConfigForRoles', () => {
  it('presenta al administrador como una vista de consulta sin accesos rápidos', () => {
    const config = dashboardConfigForRoles(['admin']);

    expect(config.eyebrow).toBe('Consulta global · Solo lectura');
    expect(config.title).toBe('Centro de consulta y auditoría');
    expect(config.showQuickActions).toBe(false);
    expect(config.showReports).toBe(true);
  });

  it('configura la composición móvil y las acciones de distribuidora', () => {
    const config = dashboardConfigForRoles(['distributor']);

    expect(config.experience).toBe('mobile');
    expect(config.showQuickActions).toBe(true);
    expect(config.quickActionIds).toEqual([
      'vouchers',
      'relations',
      'payments',
      'credit-increases',
    ]);
  });

  it('organiza Inicio de Caja con sus cuatro accesos y bloques operativos', () => {
    const config = dashboardConfigForRoles(['cashier']);

    expect(config.title).toBe('Operación de caja');
    expect(config.quickActionIds).toEqual([
      'cashier',
      'payments',
      'reconciliation',
      'clarifications',
    ]);
    expect(config.sectionOrder).toEqual([
      'cashier-activity',
      'cashier-pending',
      'cashier-movements',
    ]);
  });

  it('no inventa un perfil cuando el rol no está resuelto', () => {
    expect(dashboardConfigForRoles([]).title).toBe('MisVales');
  });
});
