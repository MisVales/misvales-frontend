import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Banknote, ChevronRight, CircleUserRound, CreditCard, LayoutDashboard, LucideAngularModule, Ticket, TicketCheck, Wallet, X } from 'lucide-angular';
import { MobileNavigationComponent, MobileNavigationSection } from './mobile-navigation.component';

describe('MobileNavigationComponent', () => {
  const sections: MobileNavigationSection[] = [
    { id: 'credit', title: 'Crédito', icon: 'wallet', route: '/credito' },
    { id: 'vouchers', title: 'Vales', icon: 'ticket', route: '/vales' },
    { id: 'home', title: 'Inicio', icon: 'layout-dashboard', route: '/inicio', prominent: true },
    { id: 'payments', title: 'Pagos', icon: 'credit-card', items: [{ id: 'payments', title: 'Pagos', icon: 'banknote', route: '/pagos', group: 'Pagos' }] },
    { id: 'account', title: 'Cuenta', icon: 'circle-user-round', route: '/seguridad' },
  ];

  beforeEach(() => TestBed.configureTestingModule({
    imports: [MobileNavigationComponent, LucideAngularModule.pick({ Banknote, ChevronRight, CircleUserRound, CreditCard, LayoutDashboard, Ticket, TicketCheck, Wallet, X })],
    providers: [provideRouter([])],
  }));

  it('muestra exactamente cinco destinos y hace Inicio prominente', () => {
    const fixture = TestBed.createComponent(MobileNavigationComponent);
    fixture.componentRef.setInput('sections', sections);
    fixture.detectChanges();
    const nav = fixture.nativeElement.querySelector('nav');
    expect(nav.querySelectorAll('.bottom-nav__item')).toHaveLength(5);
    expect(nav.textContent).not.toContain('Más');
    expect(nav.querySelector('.bottom-nav__item--home')?.textContent).toContain('Inicio');
  });

  it('envía Crédito y Vales directamente a su única vista', () => {
    const fixture = TestBed.createComponent(MobileNavigationComponent);
    fixture.componentRef.setInput('sections', sections);
    fixture.detectChanges();
    const links = fixture.nativeElement.querySelectorAll('a.bottom-nav__item');
    expect(links[0].getAttribute('href')).toBe('/credito');
    expect(links[1].getAttribute('href')).toBe('/vales');
    expect(fixture.nativeElement.querySelector('.section-menu')).toBeNull();
  });
});
