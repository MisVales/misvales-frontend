import { CLIENTES_ROUTES } from './clientes.routes';

describe('CLIENTES_ROUTES', () => {
  it('protege todas las vistas de clientes con permisos efectivos', () => {
    expect(CLIENTES_ROUTES.every(route => (route.canActivate?.length ?? 0) > 0)).toBe(true);
  });

  it('resuelve cartera antes del parámetro dinámico', () => {
    const cartera = CLIENTES_ROUTES.findIndex(route => route.path === 'cartera');
    const detalle = CLIENTES_ROUTES.findIndex(route => route.path === ':id');
    expect(cartera).toBeGreaterThan(-1);
    expect(cartera).toBeLessThan(detalle);
  });
});
