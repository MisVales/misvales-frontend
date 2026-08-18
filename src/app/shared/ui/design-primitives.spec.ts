import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AlertTriangle, Inbox, Loader2, Lock, LucideAngularModule } from 'lucide-angular';
import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component';
import { PageHeaderComponent } from './page-header/page-header.component';
import { StatusBadgeComponent } from './status-badge/status-badge.component';
import { ViewStateComponent } from './view-state/view-state.component';

describe('design primitives', () => {
  it('renders the page title and description with an accessible heading', async () => {
    await TestBed.configureTestingModule({ imports: [PageHeaderComponent] }).compileComponents();
    const fixture = TestBed.createComponent(PageHeaderComponent);
    fixture.componentRef.setInput('title', 'Solicitudes');
    fixture.componentRef.setInput('description', 'Seguimiento de expedientes');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain('Solicitudes');
    expect(fixture.nativeElement.querySelector('header')?.getAttribute('aria-labelledby')).toBe('page-title');
  });

  it('marks the final breadcrumb as the current page', async () => {
    await TestBed.configureTestingModule({
      imports: [BreadcrumbsComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(BreadcrumbsComponent);
    fixture.componentRef.setInput('items', [{ label: 'Inicio', url: '/' }, { label: 'Sucursales' }]);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[aria-current="page"]')?.textContent).toContain('Sucursales');
  });

  it('announces an error and emits its recovery action', async () => {
    await TestBed.configureTestingModule({
      imports: [
        ViewStateComponent,
        LucideAngularModule.pick({ AlertTriangle, Inbox, Loader2, Lock }),
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(ViewStateComponent);
    fixture.componentRef.setInput('kind', 'error');
    fixture.componentRef.setInput('title', 'No fue posible cargar');
    fixture.componentRef.setInput('actionLabel', 'Reintentar');
    const action = vi.fn();
    fixture.componentInstance.action.subscribe(action);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('button')?.click();

    expect(fixture.nativeElement.querySelector('section')?.getAttribute('role')).toBe('alert');
    expect(action).toHaveBeenCalledOnce();
  });

  it('uses a semantic tone for statuses', async () => {
    await TestBed.configureTestingModule({ imports: [StatusBadgeComponent] }).compileComponents();
    const fixture = TestBed.createComponent(StatusBadgeComponent);
    fixture.componentRef.setInput('tone', 'success');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-tone="success"]')).not.toBeNull();
  });
});
