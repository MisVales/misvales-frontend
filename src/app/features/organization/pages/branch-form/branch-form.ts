import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { OrganizationFacade } from '../../state/organization.facade';
import { CreateBranchPayload, UpdateBranchPayload } from '../../data-access/organization.dtos';

@Component({
  selector: 'app-branch-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="p-6 md:p-8 max-w-3xl mx-auto font-sans">
      
      <!-- Alerta de Concurrencia (409) -->
      <div *ngIf="facade.error()?.includes('concurrencia')" class="mb-6 p-4 bg-[#E9F5E9] border border-[#A3B18A] rounded-lg shadow-sm flex items-start gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-[#386641] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div class="flex-grow">
          <h3 class="font-bold text-[#386641]">Atención</h3>
          <p class="text-[#5A7A54] text-sm mt-1">{{ facade.error() }}</p>
        </div>
        <button (click)="reload()" class="p-2 hover:bg-[#D5E8D4] rounded-full transition-colors text-[#386641]" title="Recargar datos">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
      
      <!-- Error general -->
      <div *ngIf="facade.error() && !facade.error()?.includes('concurrencia')" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
        {{ facade.error() }}
      </div>

      <div class="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
        <h2 class="text-2xl font-bold text-[#386641] mb-2">Alta/Edición de Sucursal</h2>
        <p class="text-gray-500 text-sm mb-8">Complete la información requerida para registrar o actualizar los datos de la sucursal.</p>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <!-- Código -->
            <div>
              <label class="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Código de Sucursal *</label>
              <input type="text" formControlName="code" placeholder="Ej. SUC-001" 
                     [readonly]="isEditMode"
                     class="block w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-[#386641] focus:ring-1 focus:ring-[#386641] sm:text-sm read-only:bg-gray-100 read-only:text-gray-500">
              <div *ngIf="form.get('code')?.touched && form.get('code')?.invalid" class="mt-1 text-xs text-red-500">
                El código es requerido.
              </div>
            </div>

            <!-- Estado Toggle -->
            <div>
              <label class="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Estado de la Sucursal</label>
              <div class="flex items-center gap-3 mt-2">
                <button type="button" 
                        role="switch" 
                        [attr.aria-checked]="form.get('isActive')?.value"
                        (click)="toggleStatus()"
                        class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#386641] focus:ring-offset-2"
                        [ngClass]="form.get('isActive')?.value ? 'bg-[#386641]' : 'bg-gray-200'">
                  <span class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                        [ngClass]="form.get('isActive')?.value ? 'translate-x-5' : 'translate-x-0'"></span>
                </button>
                <span class="text-sm font-medium" [ngClass]="form.get('isActive')?.value ? 'text-[#386641]' : 'text-gray-500'">
                  {{ form.get('isActive')?.value ? 'Activa' : 'Inactiva' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Nombre -->
          <div>
            <label class="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Nombre de la Sucursal *</label>
            <input type="text" formControlName="name" placeholder="Nombre descriptivo de la ubicación"
                   class="block w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-[#386641] focus:ring-1 focus:ring-[#386641] sm:text-sm">
            <div *ngIf="form.get('name')?.touched && form.get('name')?.invalid" class="mt-1 text-xs text-red-500">
              El nombre es requerido.
            </div>
          </div>

          <!-- Checkbox: Matriz -->
          <div class="flex items-center gap-2 mt-4">
            <input type="checkbox" id="isHeadquarters" formControlName="isHeadquarters" class="h-4 w-4 text-[#386641] focus:ring-[#386641] border-gray-300 rounded">
            <label for="isHeadquarters" class="text-sm font-medium text-gray-700">Esta sucursal es la Sede Principal (Matriz)</label>
          </div>

          <!-- Botones -->
          <div class="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-8">
            <button type="button" (click)="goBack()" class="px-5 py-2.5 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button type="submit" [disabled]="form.invalid || facade.isLoading()" class="px-5 py-2.5 rounded-xl shadow-md text-sm font-medium text-white bg-[#386641] hover:bg-[#6A994E] disabled:bg-[#386641]/70 transition-colors flex items-center gap-2">
              <svg *ngIf="facade.isLoading()" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <svg *ngIf="!facade.isLoading()" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class BranchForm implements OnInit {
  facade = inject(OrganizationFacade);
  fb = inject(FormBuilder);
  router = inject(Router);
  route = inject(ActivatedRoute);

  isEditMode = false;
  branchId: string | null = null;
  lockVersion = 0;

  form: FormGroup = this.fb.group({
    code: ['', Validators.required],
    name: ['', Validators.required],
    isActive: [true],
    isHeadquarters: [false]
  });

  async ngOnInit() {
    this.facade.clearError();
    this.branchId = this.route.snapshot.paramMap.get('id');
    
    if (this.branchId) {
      this.isEditMode = true;
      await this.facade.getBranchById(this.branchId);
      
      const branch = this.facade.selectedBranch();
      if (branch) {
        this.lockVersion = branch.lock_version;
        this.form.patchValue({
          code: branch.code,
          name: branch.name,
          isActive: branch.status === 'ACTIVE',
          isHeadquarters: branch.is_headquarters
        });
      }
    }
  }

  toggleStatus() {
    const current = this.form.get('isActive')?.value;
    this.form.get('isActive')?.setValue(!current);
    this.form.markAsDirty();
  }

  async reload() {
    if (this.isEditMode && this.branchId) {
      this.facade.clearError();
      await this.facade.getBranchById(this.branchId);
      const branch = this.facade.selectedBranch();
      if (branch) {
        this.lockVersion = branch.lock_version;
        this.form.patchValue({
          name: branch.name,
          isActive: branch.status === 'ACTIVE',
          isHeadquarters: branch.is_headquarters
        });
      }
    }
  }

  goBack() {
    this.router.navigate(['/organizacion/sucursales']);
  }

  async onSubmit() {
    if (this.form.invalid) return;

    const formValue = this.form.value;

    if (this.isEditMode && this.branchId) {
      const data: UpdateBranchPayload = {
        name: formValue.name
      };
      
      // Manejar el toggle de estado también si cambió
      const branch = this.facade.selectedBranch();
      if (branch && (branch.status === 'ACTIVE') !== formValue.isActive) {
        // En un mundo real, esto podría requerir un endpoint separado o incluirse en update.
        // Simularemos que se actualiza el estado si cambió.
        await this.facade.toggleBranchStatus(this.branchId, formValue.isActive);
        // lockVersion se invalidaría tras esta llamada, así que recargamos.
        this.lockVersion++; 
      }

      const success = await this.facade.updateBranch(this.branchId, data);
      if (success) this.goBack();
      
    } else {
      const data: CreateBranchPayload = {
        code: formValue.code,
        name: formValue.name
      };
      
      const success = await this.facade.createBranch(data);
      if (success) this.goBack();
    }
  }
}
