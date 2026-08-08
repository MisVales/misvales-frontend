import { Component, inject, OnInit } from '@angular/core';
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

  familiaresArray: FormArray = FamiliarFormFactory.createArray(this.fb);
  cargando = false;

  get familiaresGroups(): FormGroup[] {
    return this.familiaresArray.controls as FormGroup[];
  }

  async ngOnInit() {
    await this.cargarFamiliares();
  }

  async cargarFamiliares() {
    const id = this.store.detalle()?.id;
    if (!id) return;

    this.cargando = true;
    try {
      const data = await firstValueFrom(this.api.listarFamiliares(id));
      this.familiaresArray.clear();
      data.forEach((familiar: any) => {
        const form = FamiliarFormFactory.create(this.fb);
        form.patchValue(familiar);
        this.familiaresArray.push(form);
      });
    } catch (e) {
      console.error(e);
    } finally {
      this.cargando = false;
    }
  }

  agregarFamiliar() {
    this.familiaresArray.push(FamiliarFormFactory.create(this.fb));
  }

  removerFamiliarVisual(index: number) {
    this.familiaresArray.removeAt(index);
  }

  async guardarFamiliar(index: number) {
    const formGroup = this.familiaresArray.at(index) as FormGroup;
    if (formGroup.invalid) {
      formGroup.markAllAsTouched();
      return;
    }

    const idSolicitud = this.store.detalle()?.id;
    const version = this.store.detalle()?.versionBloqueo;
    if (!idSolicitud || version === undefined) return;

    const payload = formGroup.value;
    const idFamiliar = payload.id;
    delete payload.id;

    try {
      if (idFamiliar) {
        await firstValueFrom(this.api.actualizarFamiliar(idSolicitud, idFamiliar, payload, version));
      } else {
        await firstValueFrom(this.api.crearFamiliar(idSolicitud, payload, version));
      }
      // Re-cargar para obtener IDs frescos
      await this.cargarFamiliares();
      
      // Update local store locking version effectively (handled by store usually or we just reload detail)
      this.store.cargarDetalle(idSolicitud);
    } catch (e: any) {
      if (e?.status === 409) {
        alert('El expediente fue modificado por otro usuario. Recarga la información antes de continuar.');
      }
    }
  }

  async eliminarFamiliarAPI(index: number, idFamiliar: string) {
    const confirmacion = confirm('¿Estás seguro de que deseas eliminar a este familiar?');
    if (!confirmacion) return;

    const idSolicitud = this.store.detalle()?.id;
    const version = this.store.detalle()?.versionBloqueo;
    if (!idSolicitud || version === undefined) return;

    try {
      await firstValueFrom(this.api.eliminarFamiliar(idSolicitud, idFamiliar, version));
      this.removerFamiliarVisual(index);
      this.store.cargarDetalle(idSolicitud); // Refresca avance y version
    } catch (e) {
      console.error(e);
    }
  }
}
