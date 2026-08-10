import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule } from '@angular/forms';
import { SolicitudDetalleStore } from '../../state/solicitud-detalle.store';
import { FamiliarFormFactory } from '../../forms/familiar-form.factory';
import { SolicitudesDistribuidoraApiService } from '../../data-access/solicitudes-distribuidora-api.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-familiares-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './familiares-form.component.html',
  styleUrls: ['./familiares-form.component.css']
})
export class FamiliaresFormComponent implements OnInit {
  protected store = inject(SolicitudDetalleStore);
  private fb = inject(FormBuilder);
  private api = inject(SolicitudesDistribuidoraApiService);
  private cdr = inject(ChangeDetectorRef);

  familiaresArray: FormArray = FamiliarFormFactory.createArray(this.fb);
  cargando = false;

  get familiaresGroups(): FormGroup[] {
    return this.familiaresArray.controls as FormGroup[];
  }

  async ngOnInit() {
    await this.esperarDetalle();
    await this.cargarFamiliares();
  }

  private esperarDetalle(): Promise<void> {
    return new Promise((resolve) => {
      const check = () => {
        if (this.store.detalle()?.id) {
          resolve();
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    });
  }

  async cargarFamiliares() {
    const id = this.store.detalle()?.id;
    if (!id) return;

    this.cargando = true;
    this.cdr.markForCheck();
    try {
      const data = await firstValueFrom(this.api.listarFamiliares(id));
      this.familiaresArray.clear();
      (data || []).forEach((familiar: any) => {
        const form = FamiliarFormFactory.create(this.fb);
        form.patchValue(familiar);
        this.familiaresArray.push(form);
      });
    } catch (e) {
      console.error(e);
    } finally {
      this.cargando = false;
      this.cdr.markForCheck();
    }
  }

  agregarFamiliar() {
    this.familiaresArray.push(FamiliarFormFactory.create(this.fb));
    this.cdr.markForCheck();
  }

  removerFamiliarVisual(index: number) {
    this.familiaresArray.removeAt(index);
    this.cdr.markForCheck();
  }

  async guardarFamiliar(index: number) {
    const formGroup = this.familiaresArray.at(index) as FormGroup;
    if (formGroup.invalid) {
      formGroup.markAllAsTouched();
      this.cdr.markForCheck();
      return;
    }

    const idSolicitud = this.store.detalle()?.id;
    if (!idSolicitud) return;

    const payload = { ...formGroup.value };
    const idFamiliar = payload.id;
    delete payload.id;

    try {
      if (idFamiliar) {
        await firstValueFrom(this.api.actualizarFamiliar(idSolicitud, idFamiliar, payload, this.store.detalle()!.versionBloqueo));
      } else {
        await firstValueFrom(this.api.crearFamiliar(idSolicitud, payload, this.store.detalle()!.versionBloqueo));
      }
      await this.store.cargarDetalle(idSolicitud);
      await this.cargarFamiliares();
    } catch (e: any) {
      if (e?.status === 409) {
        await this.store.cargarDetalle(idSolicitud);
        alert('Versión desactualizada. Se recargó la información. Intenta guardar de nuevo.');
      }
    } finally {
      this.cdr.markForCheck();
    }
  }

  async eliminarFamiliarAPI(index: number, idFamiliar: string) {
    const confirmacion = confirm('¿Estás seguro de que deseas eliminar a este familiar?');
    if (!confirmacion) return;

    const idSolicitud = this.store.detalle()?.id;
    if (!idSolicitud) return;

    try {
      await firstValueFrom(this.api.eliminarFamiliar(idSolicitud, idFamiliar, this.store.detalle()!.versionBloqueo));
      this.removerFamiliarVisual(index);
      await this.store.cargarDetalle(idSolicitud);
    } catch (e) {
      console.error(e);
    } finally {
      this.cdr.markForCheck();
    }
  }
}
