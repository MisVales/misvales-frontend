import { importProvidersFrom } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import {
  ArrowLeft,
  Banknote,
  ChevronDown,
  CircleUserRound,
  CreditCard,
  History,
  LayoutDashboard,
  LogOut,
  LucideAngularModule,
} from 'lucide-angular';
import { describe, expect, it } from 'vitest';
import { DistributorWorkspaceContextService } from '@shared/components/navigation/distributor-workspace-nav/distributor-workspace-context.service';
import { API_CONFIG, defaultApiConfig } from '@core/api/api.config';
import { TabletHeaderComponent } from './tablet-header.component';

describe('TabletHeaderComponent distributor context', () => {
  it('renders the opened distributor navigation inside the tablet header', async () => {
    TestBed.configureTestingModule({
      imports: [TabletHeaderComponent, HttpClientTestingModule],
      providers: [
        { provide: API_CONFIG, useValue: defaultApiConfig },
        provideRouter([]),
        importProvidersFrom(
          LucideAngularModule.pick({
            ArrowLeft,
            Banknote,
            ChevronDown,
            CircleUserRound,
            CreditCard,
            History,
            LayoutDashboard,
            LogOut,
          }),
        ),
      ],
    });
    const context = TestBed.inject(DistributorWorkspaceContextService);
    const owner = {};
    context.set(owner, {
      distributorId: 'distributor-1',
      distributorNumber: 'DIS-0001',
      active: 'payments',
      backRoute: '/coordinacion/distribuidoras',
    });

    const fixture = TestBed.createComponent(TabletHeaderComponent);
    fixture.componentRef.setInput('workspaceLabel', 'Coordinación');
    fixture.componentRef.setInput('userName', 'Jesus Guillen');
    fixture.componentRef.setInput('initials', 'JG');
    fixture.detectChanges();
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.header-workspace-nav')).toBeTruthy();
    expect(
      root.querySelector('.header-workspace-nav')?.classList.contains('workspace-nav-host--header'),
    ).toBe(true);
    expect(root.querySelector('.workspace-nav__context')?.textContent?.trim()).toBe('');
    expect(root.querySelector('.workspace-nav__context a')?.getAttribute('href')).toBe(
      '/coordinacion/distribuidoras',
    );
    expect(root.querySelector('.workspace-nav__links .is-active')?.textContent).toContain('Pagos');
    expect(
      Array.from(root.querySelectorAll<HTMLAnchorElement>('.workspace-nav__links a')).map((link) =>
        link.textContent?.trim(),
      ),
    ).toEqual([
      expect.stringContaining('Resumen'),
      expect.stringContaining('Crédito'),
      expect.stringContaining('Pagos'),
      expect.stringContaining('Historial'),
    ]);

    context.clear(owner);
  });
});
