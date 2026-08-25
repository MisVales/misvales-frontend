import { importProvidersFrom } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Loader2, LucideAngularModule, TriangleAlert, UserRound } from 'lucide-angular';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { DistribuidorasApiService } from '../../data-access/api/distribuidoras-api.service';
import { CategoriaDistribuidora } from '../../models/categoria-distribuidora.model';
import { HistorialCategoriasComponent } from './historial-categorias.component';

describe('HistorialCategoriasComponent', () => {
  it('distingue la carga de una respuesta vacía confirmada por la API', async () => {
    const respuesta = new Subject<CategoriaDistribuidora[]>();
    const api = {
      obtenerHistorialCategorias: vi.fn(() => respuesta.asObservable()),
    };

    TestBed.configureTestingModule({
      imports: [HistorialCategoriasComponent],
      providers: [
        { provide: DistribuidorasApiService, useValue: api },
        importProvidersFrom(LucideAngularModule.pick({ Loader2, TriangleAlert, UserRound })),
      ],
    });

    const fixture = TestBed.createComponent(HistorialCategoriasComponent);
    fixture.componentRef.setInput('distribuidoraId', 'distributor-1');
    fixture.detectChanges();
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.history-loading')?.textContent).toContain('Cargando historial');
    expect(root.querySelector('app-empty-state')).toBeNull();

    respuesta.next([]);
    respuesta.complete();
    await vi.waitFor(() => expect(fixture.componentInstance.cargando).toBe(false));
    fixture.detectChanges();

    const updatedRoot = fixture.nativeElement as HTMLElement;
    expect(updatedRoot.querySelector('.history-loading')).toBeNull();
    expect(updatedRoot.querySelector('app-empty-state')?.textContent).toContain(
      'Sin cambios de categoría',
    );
    expect(updatedRoot.querySelector('app-empty-state img')?.getAttribute('src')).toBe(
      '/no-found-2.png',
    );
  });
});
