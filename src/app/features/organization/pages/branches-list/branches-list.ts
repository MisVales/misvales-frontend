import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrganizationFacade } from '../../state/organization.facade';
import { FormsModule } from '@angular/forms';
import { BranchStatusBadgeComponent } from '@shared/ui/branch-status-badge/branch-status-badge.component';
import { SessionStore } from '@core/session/session.store';

@Component({
  selector: 'app-branches-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, BranchStatusBadgeComponent],
  template: `
    <div class="p-6 md:p-8 max-w-7xl mx-auto">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 class="text-3xl font-extrabold text-[#386641] tracking-tight">Gestión de Sucursales</h1>
        <!-- Ocultar botón si no tiene permisos (ej: si es rol que no maneja sucursales) -->
        <a *ngIf="canManage()" routerLink="nueva" class="mt-4 md:mt-0 bg-[#386641] hover:bg-[#6A994E] text-white font-medium py-2.5 px-5 rounded-xl transition-all shadow-md flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nueva Sucursal
        </a>
      </div>

      <!-- Filtros -->
      <div class="flex flex-col sm:flex-row gap-4 mb-6">
        <div class="relative flex-grow max-w-md">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input type="text" [(ngModel)]="searchTerm" (ngModelChange)="onSearch()" placeholder="Buscar sucursal..." class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-[#386641] focus:ring-1 focus:ring-[#386641] sm:text-sm">
        </div>
        <select [(ngModel)]="statusFilter" (ngModelChange)="onSearch()" class="block w-48 pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#386641] focus:ring-1 focus:ring-[#386641] sm:text-sm">
          <option value="">Estado</option>
          <option value="active">Activa</option>
          <option value="inactive">Inactiva</option>
        </select>
      </div>

      <!-- Loading State -->
      <div *ngIf="facade.isLoading()" class="flex justify-center py-12">
        <svg class="animate-spin h-8 w-8 text-[#386641]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <!-- Tabla -->
      <div *ngIf="!facade.isLoading()" class="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Código</th>
                <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nombre</th>
                <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tipo</th>
                <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Personal Activo</th>
                <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
                <th scope="col" class="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-100">
              <tr *ngFor="let branch of facade.branches()" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ branch.code }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{{ branch.name }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium" 
                        [ngClass]="branch.is_headquarters ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'">
                    {{ branch.is_headquarters ? 'Matriz' : 'Foránea' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{{ 0 }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <app-branch-status-badge [isActive]="branch.status === 'ACTIVE'"></app-branch-status-badge>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <button [routerLink]="[branch.id]" class="text-gray-400 hover:text-[#386641] transition-colors p-2 rounded-full hover:bg-green-50">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>
                </td>
              </tr>
              <tr *ngIf="facade.branches().length === 0">
                <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                  No se encontraron sucursales.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Paginación Simple -->
        <div class="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <div class="text-sm text-gray-500">
            Mostrando <span class="font-medium">{{ ((facade.page() - 1) * facade.perPage()) + 1 }}</span> a <span class="font-medium">{{ Math.min(facade.page() * facade.perPage(), facade.total()) }}</span> de <span class="font-medium">{{ facade.total() }}</span> sucursales
          </div>
          <div class="flex gap-2">
            <button (click)="changePage(-1)" [disabled]="facade.page() === 1" class="p-1 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </button>
            <button (click)="changePage(1)" [disabled]="facade.page() * facade.perPage() >= facade.total()" class="p-1 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BranchesList implements OnInit {
  facade = inject(OrganizationFacade);
  sessionStore = inject(SessionStore);
  
  searchTerm = '';
  statusFilter = '';
  Math = Math;
  searchTimeout: any;

  ngOnInit() {
    this.facade.loadBranches();
  }

  canManage(): boolean {
    const roles = this.sessionStore.roles();
    const permissions = this.sessionStore.permissions();
    // Assuming 'Administrador' cannot edit (based on requirements) or only 'manage_branches' can.
    return permissions.includes('manage_branches');
  }

  onSearch() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.facade.loadBranches(1, 10, this.searchTerm, this.statusFilter);
    }, 300);
  }

  changePage(delta: number) {
    const newPage = this.facade.page() + delta;
    this.facade.loadBranches(newPage, this.facade.perPage(), this.searchTerm, this.statusFilter);
  }
}
