import { importProvidersFrom } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChevronDown, LucideAngularModule, Search, TriangleAlert } from 'lucide-angular';
import { of } from 'rxjs';
import { ErrorCatalogService } from '../../data-access/error-catalog.service';
import { ErrorCatalogComponent } from './error-catalog.component';

describe('ErrorCatalogComponent', () => {
  let fixture: ComponentFixture<ErrorCatalogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorCatalogComponent],
      providers: [{
        provide: ErrorCatalogService,
        useValue: {
          list: () => of({
            data: [{
              code: 'AUTH_SCOPE_DENIED',
              client_definition: 'No tienes permiso.',
              internal_definition: 'Alcance de autorización insuficiente.',
              admin_definition: 'Respuesta API con HTTP 403.',
              http_statuses: [403],
              sources: ['app/Http/Middleware/RequirePermission.php'],
              occurrences: 3,
            }],
            meta: { total: 1 },
          }),
        },
      }, importProvidersFrom(LucideAngularModule.pick({ ChevronDown, Search, TriangleAlert }))],
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorCatalogComponent);
    fixture.detectChanges();
  });

  it('muestra las tres definiciones y el código real', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('AUTH_SCOPE_DENIED');
    expect(text).toContain('No tienes permiso.');
    expect(text).toContain('Alcance de autorización insuficiente.');
    expect(text).toContain('Respuesta API con HTTP 403.');
  });

  it('filtra por búsqueda y estado HTTP', () => {
    fixture.componentInstance.setQuery('inexistente');
    expect(fixture.componentInstance.filtered()).toHaveLength(0);
    fixture.componentInstance.setQuery('permiso');
    fixture.componentInstance.setStatus('403');
    expect(fixture.componentInstance.filtered()).toHaveLength(1);
  });
});
