import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { OrganizationFacade } from '../../state/organization.facade';
import { BranchStatusBadgeComponent } from '@shared/ui/branch-status-badge/branch-status-badge.component';

@Component({
  selector: 'app-branch-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, BranchStatusBadgeComponent],
  template: `
    <div class="p-6 md:p-8 max-w-5xl mx-auto font-sans">
      <!-- Breadcrumb -->
      <div class="text-xs text-gray-500 mb-4 flex items-center gap-2">
        <a routerLink="/organizacion" class="hover:text-[#386641] transition-colors">Organización</a>
        <span>&gt;</span>
        <a routerLink="/organizacion/sucursales" class="hover:text-[#386641] transition-colors">Sucursales</a>
        <span>&gt;</span>
        <span class="font-medium text-gray-800">Detalle de Sucursal</span>
      </div>

      <!-- Error -->
      <div *ngIf="facade.error()" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
        {{ facade.error() }}
      </div>

      <!-- Header with Action -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 class="text-3xl font-extrabold text-[#386641] tracking-tight">Detalle de Sucursal</h1>
        
        <div class="flex gap-3" *ngIf="branch()">
          <button [routerLink]="['/organizacion/sucursales', branch()!.id, 'editar']" class="px-4 py-2 bg-white border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Editar
          </button>
          
          <button (click)="toggleStatus()" 
                  [disabled]="branch()!.is_headquarters || facade.isLoading()"
                  [title]="branch()!.is_headquarters ? 'No se puede desactivar la Sede Principal' : ''"
                  class="px-4 py-2 rounded-xl shadow-sm text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed border"
                  [ngClass]="branch()!.status === 'ACTIVE' ? 'bg-white border-red-200 text-red-600 hover:bg-red-50' : 'bg-[#386641] border-[#386641] text-white hover:bg-[#6A994E]'">
            
            <svg *ngIf="!facade.isLoading()" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <svg *ngIf="facade.isLoading()" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ branch()!.status === 'ACTIVE' ? 'Desactivar' : 'Activar' }}
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="facade.isLoading() && !branch()" class="flex justify-center py-12">
        <svg class="animate-spin h-8 w-8 text-[#386641]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <!-- Card -->
      <div *ngIf="branch()" class="bg-white shadow-xl rounded-2xl p-8 border border-gray-100 flex flex-col md:flex-row gap-8">
        <!-- Left: Icon/Badge -->
        <div class="flex flex-col items-center justify-start shrink-0">
          <div class="w-32 h-32 bg-[#E9F5E9] rounded-full flex items-center justify-center text-[#386641] mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold" 
                [ngClass]="branch()!.is_headquarters ? 'bg-[#386641] text-white' : 'bg-gray-200 text-gray-700'">
            {{ branch()!.is_headquarters ? 'Sede Principal' : 'Sucursal Foránea' }}
          </span>
        </div>

        <!-- Right: Info -->
        <div class="flex-grow">
          <div class="border-b border-gray-100 pb-4 mb-4 flex justify-between items-start">
            <div>
              <h2 class="text-2xl font-bold text-gray-900">{{ branch()!.name }}</h2>
              <p class="text-sm font-medium text-gray-500 mt-1">Código: {{ branch()!.code }}</p>
            </div>
            <app-branch-status-badge [isActive]="branch()!.status === 'ACTIVE'"></app-branch-status-badge>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Personal Activo</p>
              <p class="text-lg font-medium text-gray-900 mt-1 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#386641]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {{ 0 }} Empleados
              </p>
            </div>
            
            <div>
              <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Fecha de Creación</p>
              <p class="text-sm font-medium text-gray-900 mt-1">
                {{ branch()!.created_at | date:'mediumDate' }}
              </p>
            </div>

            <div>
              <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Última Actualización</p>
              <p class="text-sm font-medium text-gray-900 mt-1">
                {{ branch()!.updated_at | date:'medium' }}
              </p>
            </div>
            
            <div>
              <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Versión de Registro</p>
              <p class="text-sm font-medium text-gray-500 mt-1">
                v{{ branch()!.lock_version }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BranchDetail implements OnInit {
  facade = inject(OrganizationFacade);
  route = inject(ActivatedRoute);
  
  branchId: string | null = null;
  branch = this.facade.selectedBranch;

  ngOnInit() {
    this.branchId = this.route.snapshot.paramMap.get('id');
    if (this.branchId) {
      this.facade.getBranchById(this.branchId);
    }
  }

  toggleStatus() {
    const currentBranch = this.branch();
    if (!currentBranch || currentBranch.is_headquarters) return;

    this.facade.toggleBranchStatus(currentBranch.id, currentBranch.status !== 'ACTIVE');
  }
}
