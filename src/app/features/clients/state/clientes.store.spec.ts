import { TestBed } from '@angular/core/testing';
import { ClientesStore } from './clientes.store';
import { ClientesApiService } from '../data-access/api/clientes-api.service';
import { CarteraApiService } from '../data-access/api/cartera-api.service';

// Mocking API services directly or relying on HTTP testing module
// Since ClientesStore uses API services that use HttpClient, we can test it at HTTP boundary
// But it's easier to mock the API services directly for the Signal Store

import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { HttpErrorResponse } from '@angular/common/http';

describe('ClientesStore', () => {
  let mockClientesApi: any;
  let mockCarteraApi: any;

  beforeEach(() => {
    mockClientesApi = {
      listar: vi.fn().mockReturnValue(of({ data: [], total: 0 })),
      obtener: vi.fn().mockReturnValue(of(null)),
      crear: vi.fn().mockReturnValue(throwError(() => new HttpErrorResponse({
        status: 409,
        error: { code: 'CLIENT_CURP_EXISTS' },
      })))
    };

    mockCarteraApi = {
      registrarMovimiento: vi.fn().mockReturnValue(throwError(() => new HttpErrorResponse({ status: 409 })))
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: ClientesApiService, useValue: mockClientesApi },
        { provide: CarteraApiService, useValue: mockCarteraApi }
      ]
    });
  });

  it('should map CLIENT_CURP_EXISTS error friendly', async () => {
    const store = TestBed.inject(ClientesStore);
    
    try {
      // Simulate create client which throws CLIENT_CURP_EXISTS
      await store.crearCliente({} as any, 'key').toPromise();
    } catch (e) {
      // Expected to throw, but store error should be updated
    }

    expect(store.error()).toBe('La CURP ya se encuentra registrada.');
    expect(store.creandoCliente()).toBe(false);
  });

  it('should set conflictoVersion to true on 409', async () => {
    const store = TestBed.inject(ClientesStore);
    
    try {
      // Simulate registrarMovimiento which throws 409
      await store.registrarMovimiento('1', {} as any, 'key').toPromise();
    } catch (e) {
      // Expected to throw
    }

    expect(store.conflictoVersion()).toBe(true);
    expect(store.registrandoMovimiento()).toBe(false);
    expect(store.error()).toBe('Conflicto al procesar la solicitud (Duplicidad o Versión).');
  });
});
