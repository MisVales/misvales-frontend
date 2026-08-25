import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertTriangle, Lock, LucideAngularModule } from 'lucide-angular';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpStatusPageComponent } from './http-status-page.component';

describe('HttpStatusPageComponent', () => {
  const route = { snapshot: { data: {} as Record<string, unknown> } };
  const router = { navigate: vi.fn().mockResolvedValue(true) };

  beforeEach(() => {
    vi.clearAllMocks();
    route.snapshot.data = {};
    TestBed.configureTestingModule({
      imports: [
        HttpStatusPageComponent,
        LucideAngularModule.pick({ AlertTriangle, Lock }),
      ],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        { provide: Router, useValue: router },
      ],
    });
  });

  it('renders a dedicated access-denied page and returns to a safe route', () => {
    route.snapshot.data = { statusPage: 'forbidden' };
    const fixture = TestBed.createComponent(HttpStatusPageComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Acceso denegado');
    expect(fixture.nativeElement.textContent).toContain('No tienes permiso');

    (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();

    expect(router.navigate).toHaveBeenCalledWith(['/inicio']);
  });

  it('distinguishes an unknown route with a non-technical not-found page', () => {
    route.snapshot.data = { statusPage: 'not-found' };
    const fixture = TestBed.createComponent(HttpStatusPageComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Página no encontrada');
    expect(fixture.nativeElement.textContent).not.toContain('404');
  });
});
