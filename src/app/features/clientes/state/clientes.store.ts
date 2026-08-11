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
  filtros: { page: 1, perPage: 10 },
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
      const filtrosConPagina = { ...filtros, page: 1, perPage: store.filtros().perPage ?? 10 };
      patchState(store, { filtros: filtrosConPagina, cargandoListado: true, error: null, paginacion: { ...store.paginacion(), page: 1 } });
      clientesApi.listar(filtrosConPagina).pipe(
        tap(res => patchState(store, { listado: res.data, paginacion: { total: res.total, page: 1 }, cargandoListado: false })),
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

    cambiarPagina(page: number) {
      const ultimaPagina = Math.max(1, Math.ceil(store.paginacion().total / (store.filtros().perPage ?? 10)));
      if (page < 1 || page > ultimaPagina || page === store.paginacion().page) return;
      const filtros = { ...store.filtros(), page };
      patchState(store, { filtros, paginacion: { ...store.paginacion(), page }, cargandoListado: true, error: null });
      clientesApi.listar(filtros).pipe(
        tap(res => patchState(store, { listado: res.data, paginacion: { total: res.total, page }, cargandoListado: false })),
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
            titular: cuentaDto.account_holder,
            cuentaEnmascarada: cuentaDto.masked_account_number,
            clabeEnmascarada: cuentaDto.masked_clabe,
            vigenteDesde: cuentaDto.valid_from
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
        tap(res => patchState(store, { movimientosCartera: res.data })),
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
