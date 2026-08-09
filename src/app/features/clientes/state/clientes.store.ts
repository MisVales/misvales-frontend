import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { ClientesApiService } from '../data-access/api/clientes-api.service';
import { CarteraApiService } from '../data-access/api/cartera-api.service';
import { Cliente } from '../models/cliente.model';
import { FiltroClientes } from '../models/filtro-clientes.model';
import { CuentaBancariaCliente } from '../models/cuenta-bancaria-cliente.model';
import { MovimientoCartera } from '../models/movimiento-cartera.model';
import { ResumenCartera } from '../models/resumen-cartera.model';
import { CreateClientRequestDto } from '../data-access/dtos/create-client-request.dto';
import { CreateClientBankAccountRequestDto } from '../data-access/dtos/create-client-bank-account-request.dto';
import { CreateClientPortfolioEntryRequestDto } from '../data-access/dtos/create-client-portfolio-entry-request.dto';
import { handleClientError } from '../utils/error-handler.util';
import { catchError, of, tap } from 'rxjs';

export interface ClientesState {
  listado: Cliente[];
  detalle: Cliente | null;
  filtros: FiltroClientes;
  paginacion: { total: number, page: number };
  cuentasBancarias: CuentaBancariaCliente[];
  movimientosCartera: MovimientoCartera[];
  resumenCartera: ResumenCartera | null;
  
  cargandoListado: boolean;
  cargandoDetalle: boolean;
  creandoCliente: boolean;
  creandoCuenta: boolean;
  registrandoMovimiento: boolean;
  actualizandoMovimiento: boolean;
  
  error: string | null;
  conflictoVersion: boolean;
}

const initialState: ClientesState = {
  listado: [],
  detalle: null,
  filtros: {},
  paginacion: { total: 0, page: 1 },
  cuentasBancarias: [],
  movimientosCartera: [],
  resumenCartera: null,
  
  cargandoListado: false,
  cargandoDetalle: false,
  creandoCliente: false,
  creandoCuenta: false,
  registrandoMovimiento: false,
  actualizandoMovimiento: false,
  
  error: null,
  conflictoVersion: false
};

export const ClientesStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, 
               clientesApi = inject(ClientesApiService),
               carteraApi = inject(CarteraApiService)) => ({
    
    actualizarFiltros(filtros: FiltroClientes) {
      patchState(store, { filtros, cargandoListado: true, error: null });
      clientesApi.listar(filtros).pipe(
        tap(res => patchState(store, { listado: res.data, paginacion: { ...store.paginacion(), total: res.total }, cargandoListado: false })),
        catchError(err => {
          patchState(store, { error: handleClientError(err), cargandoListado: false });
          return of(null);
        })
      ).subscribe();
    },

    cargarListado() {
      patchState(store, { cargandoListado: true, error: null });
      clientesApi.listar(store.filtros()).pipe(
        tap(res => patchState(store, { listado: res.data, paginacion: { ...store.paginacion(), total: res.total }, cargandoListado: false })),
        catchError(err => {
          patchState(store, { error: handleClientError(err), cargandoListado: false });
          return of(null);
        })
      ).subscribe();
    },

    cargarDetalle(id: string) {
      patchState(store, { cargandoDetalle: true, error: null, conflictoVersion: false });
      clientesApi.obtener(id).pipe(
        tap(cliente => patchState(store, { detalle: cliente, resumenCartera: cliente.resumenCartera, cargandoDetalle: false })),
        catchError(err => {
          patchState(store, { error: handleClientError(err), cargandoDetalle: false });
          return of(null);
        })
      ).subscribe();
    },

    crearCliente(entrada: CreateClientRequestDto, idempotencyKey: string) {
      patchState(store, { creandoCliente: true, error: null });
      return clientesApi.crear(entrada, idempotencyKey).pipe(
        tap(cliente => patchState(store, { detalle: cliente, creandoCliente: false })),
        catchError(err => {
          patchState(store, { error: handleClientError(err), creandoCliente: false });
          throw err;
        })
      );
    },

    crearCuentaBancaria(id: string, entrada: CreateClientBankAccountRequestDto) {
      patchState(store, { creandoCuenta: true, error: null });
      return clientesApi.crearCuenta(id, entrada).pipe(
        tap(cuentaDto => {
          const cuentaMapeada: CuentaBancariaCliente = {
            id: cuentaDto.id,
            banco: cuentaDto.bank_name,
            titular: cuentaDto.account_holder_name,
            cuentaEnmascarada: cuentaDto.account_number_masked,
            clabeEnmascarada: cuentaDto.clabe_masked,
            vigenteDesde: cuentaDto.starts_at
          };
          patchState(store, { cuentasBancarias: [...store.cuentasBancarias(), cuentaMapeada], creandoCuenta: false });
          this.cargarDetalle(id); // Reload to update current account
        }),
        catchError(err => {
          patchState(store, { error: handleClientError(err), creandoCuenta: false });
          throw err;
        })
      );
    },

    cargarCartera(id: string) {
      patchState(store, { error: null });
      carteraApi.listarCartera(id).pipe(
        tap(res => patchState(store, { movimientosCartera: res.data, resumenCartera: res.summary })),
        catchError(err => {
          patchState(store, { error: handleClientError(err) });
          return of(null);
        })
      ).subscribe();
    },

    registrarMovimiento(id: string, entrada: CreateClientPortfolioEntryRequestDto, idempotencyKey: string) {
      patchState(store, { registrandoMovimiento: true, error: null });
      return carteraApi.registrarMovimiento(id, entrada, idempotencyKey).pipe(
        tap(movimiento => {
          patchState(store, { 
            movimientosCartera: [movimiento, ...store.movimientosCartera()],
            registrandoMovimiento: false 
          });
          this.cargarDetalle(id); // Refresh summary
        }),
        catchError(err => {
          if (err?.error?.code === 'RESOURCE_VERSION_CONFLICT' || err?.status === 409) {
            patchState(store, { conflictoVersion: true });
          }
          patchState(store, { error: handleClientError(err), registrandoMovimiento: false });
          throw err;
        })
      );
    },

    limpiarDetalle() {
      // Regla: No persistir el detalle sensible en almacenamiento
      patchState(store, { detalle: null, resumenCartera: null, movimientosCartera: [], cuentasBancarias: [], error: null, conflictoVersion: false });
    },

    setConflictoVersion(isConflict: boolean) {
      patchState(store, { conflictoVersion: isConflict });
    }
  }))
);
