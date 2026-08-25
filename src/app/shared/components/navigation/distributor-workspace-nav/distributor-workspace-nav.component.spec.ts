import { importProvidersFrom } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import {
  ArrowLeft,
  Banknote,
  CreditCard,
  History,
  LayoutDashboard,
  LucideAngularModule,
} from 'lucide-angular';
import { describe, expect, it } from 'vitest';
import { DistributorWorkspaceNavComponent } from './distributor-workspace-nav.component';

describe('DistributorWorkspaceNavComponent', () => {
  it('connects the distributor summary, credit, payments and history with real URLs', async () => {
    TestBed.configureTestingModule({
      imports: [DistributorWorkspaceNavComponent],
      providers: [
        provideRouter([]),
        importProvidersFrom(
          LucideAngularModule.pick({ ArrowLeft, Banknote, CreditCard, History, LayoutDashboard }),
        ),
      ],
    });
    const fixture = TestBed.createComponent(DistributorWorkspaceNavComponent);
    fixture.componentRef.setInput('distributorId', 'distributor-1');
    fixture.componentRef.setInput('distributorNumber', 'DIS-0001');
    fixture.componentRef.setInput('active', 'payments');

    fixture.detectChanges();
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;
    const hrefs = Array.from(
      root.querySelectorAll<HTMLAnchorElement>('.workspace-nav__links a'),
      (link) => link.getAttribute('href'),
    );
    expect(hrefs).toEqual([
      '/distribuidoras/distributor-1',
      '/distribuidoras/distributor-1?section=credito',
      '/relaciones-pagos/pagos?distribuidora=DIS-0001&distributorId=distributor-1',
      '/distribuidoras/distributor-1?section=historial',
    ]);
    expect(root.querySelector('.is-active')?.textContent).toContain('Pagos');
  });
});
