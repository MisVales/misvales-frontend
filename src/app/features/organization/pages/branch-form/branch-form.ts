import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { OrganizationFacade } from '../../state/organization.facade';
import { AddressFormComponent, AddressResult } from '../../../../shared/components/inputs/address-form/address-form';
import { InputErrorComponent } from '../../../../shared/components/inputs/input-error/input-error.component';
import { AlertComponent } from '../../../../shared/components/alerts/inline-alert/alert.component';
import { AlertService } from '../../../../shared/components/alerts/alert.service';

@Component({
  selector: 'app-branch-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AddressFormComponent, InputErrorComponent, AlertComponent],
  template: `
    <main class="mx-auto max-w-3xl space-y-6 p-6 md:p-8">
      <nav aria-label="Ruta de navegación" class="flex flex-wrap items-center gap-2 text-sm text-gray-500">
        <a routerLink="/organizacion/sucursales" class="transition-colors hover:text-[#386641]">Organización</a>
        <span aria-hidden="true">/</span>
        <a routerLink="/organizacion/sucursales" class="transition-colors hover:text-[#386641]">Sucursales</a>
        <span aria-hidden="true">/</span>
        <span class="font-medium text-gray-800">{{ isEditMode ? 'Editar sucursal' : 'Nueva sucursal' }}</span>
      </nav>

      @if (facade.error()) {
        <app-inline-alert
          type="error" 
          [message]="facade.error()"
          [actionText]="facade.error()?.includes('concurrencia') ? 'Recargar información' : undefined"
          (onAction)="reload()">
        </app-inline-alert>
      }

      <section class="rounded-2xl border border-gray-100 bg-white p-6 shadow-xl md:p-8">
        <div class="mb-8">
          <p class="text-sm font-semibold text-[#6A994E]">Paso 1 de 1</p>
          <h1 class="mt-1 text-2xl font-bold text-[#386641]">
            {{ isEditMode ? 'Editar sucursal' : 'Alta de sucursal' }}
          </h1>
          <p class="mt-2 text-sm text-gray-500">
            Complete la información requerida. La sucursal se registra activa y su código se genera automáticamente.
          </p>
        </div>

        <form data-manager-action [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
          <div>
            <label for="branch-name" class="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-700">
              Nombre de la sucursal <span class="text-red-600" aria-hidden="true">*</span><span class="sr-only"> obligatorio</span>
            </label>
            <input id="branch-name" type="text" formControlName="name" autocomplete="off"
                   (focus)="markNameErrorVisible()"
                   placeholder="Nombre descriptivo de la ubicación"
                   class="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-[#386641] focus:outline-none focus:ring-1 focus:ring-[#386641] sm:text-sm">
            <app-input-error [control]="form.controls.name" label="El nombre" [forceShow]="nameErrorVisible"></app-input-error>
          </div>

          <div>
            <label class="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-700">
              Dirección
            </label>
            <app-address-form #addressForm (addressChange)="onAddressChange($event)"></app-address-form>
            <p class="mt-2 flex items-start gap-2 text-xs text-gray-500">
              <span aria-hidden="true" class="text-[#6A994E]">✓</span>
              La dirección se normalizará y validará con nuestro catálogo antes de guardarse.
            </p>
            <app-input-error [control]="form.controls.address" label="La dirección"></app-input-error>
          </div>

          <div class="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
            <button type="button" (click)="goBack()"
                    class="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" [disabled]="form.invalid || facade.isLoading() || isSubmitting"
                    class="rounded-xl bg-[#386641] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-[#6A994E] disabled:cursor-not-allowed disabled:opacity-60">
              {{ (facade.isLoading() || isSubmitting) ? 'Guardando...' : (isEditMode ? 'Guardar cambios' : 'Crear sucursal') }}
            </button>
          </div>
        </form>
      </section>
    </main>
  `,
})
export class BranchForm implements OnInit {
  readonly facade = inject(OrganizationFacade);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly alerts = inject(AlertService);

  isEditMode = false;
  branchId: string | null = null;
  nameErrorVisible = false;
  isSubmitting = false;

  @ViewChild('addressForm') addressForm!: AddressFormComponent;

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    address: ['', [Validators.required, Validators.maxLength(500)]],
    lat: this.fb.control<number | null>(null),
    lng: this.fb.control<number | null>(null),
  });

  async ngOnInit(): Promise<void> {
    this.facade.clearError();
    this.branchId = this.route.snapshot.paramMap.get('id');
    if (!this.branchId) return;

    this.isEditMode = true;
    await this.loadBranch();
  }

  async reload(): Promise<void> {
    this.facade.clearError();
    await this.loadBranch();
  }

  goBack(): void {
    this.router.navigate(['/organizacion/sucursales']);
  }

  markNameErrorVisible(): void {
    this.nameErrorVisible = true;
    this.form.controls.name.markAsTouched();
  }

  onAddressChange(result: AddressResult): void {
    this.form.patchValue({ 
      address: result.full_address,
      lat: result.lat,
      lng: result.lng
    });
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid || this.isSubmitting) {
      this.form.markAllAsTouched();
      this.addressForm?.validarAntesDeSalir();
      return;
    }

    this.isSubmitting = true;
    try {
      // Geocode at submission time to get coordinates
      const coords = await this.addressForm.geocode();
      if (coords) {
        this.form.patchValue({ lat: coords.lat, lng: coords.lng });
      }

      const { name, address, lat, lng } = this.form.getRawValue();
      const success = this.isEditMode && this.branchId
        ? await this.facade.updateBranch(this.branchId, name.trim(), address.trim(), lat, lng)
        : await this.facade.createBranch({ name: name.trim(), address: address.trim(), lat, lng });

      if (success) {
        if (!this.isEditMode) {
          this.alerts.success('La sucursal se creó correctamente.');
        }
        this.goBack();
      }
    } finally {
      this.isSubmitting = false;
    }
  }

  private async loadBranch(): Promise<void> {
    if (!this.branchId) return;
    const branch = await this.facade.getBranchById(this.branchId);
    if (branch) {
      this.form.reset({ name: branch.name, address: branch.address ?? '' });
    }
  }
}
