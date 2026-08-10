import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule } from '@angular/forms';
import { SolicitudDetalleStore } from '../../state/solicitud-detalle.store';
import { DomicilioFormFactory } from '../../forms/domicilio-form.factory';
import { SolicitudesDistribuidoraApiService } from '../../data-access/solicitudes-distribuidora-api.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-domicilios-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './domicilios-form.component.html',
  styleUrls: ['./domicilios-form.component.css']
})
export class DomiciliosFormComponent implements OnInit {
  protected store = inject(SolicitudDetalleStore);
  private fb = inject(FormBuilder);
  private api = inject(SolicitudesDistribuidoraApiService);
  private cdr = inject(ChangeDetectorRef);

  domiciliosArray: FormArray = DomicilioFormFactory.createArray(this.fb);
  cargando = false;
  mostrandoFormulario = false;
  formularioActual: FormGroup | null = null;
  indiceEdicion: number | null = null;

  async ngOnInit() {
    await this.esperarDetalle();
    await this.cargarDomicilios();
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

  get domiciliosGroups(): FormGroup[] {
    return this.domiciliosArray.controls as FormGroup[];
  }

  async cargarDomicilios() {
    const id = this.store.detalle()?.id;
    if (!id) return;

    this.cargando = true;
    this.cdr.markForCheck();
    try {
      const data = await firstValueFrom(this.api.listarDomicilios(id));
      this.domiciliosArray.clear();
      (data || []).forEach((domicilio: any) => {
        const form = DomicilioFormFactory.create(this.fb);
        form.patchValue(domicilio);
        this.domiciliosArray.push(form);
      });
    } catch (e) {
      console.error(e);
    } finally {
      this.cargando = false;
      this.cdr.markForCheck();
    }
  }

  abrirFormulario(domicilioExistente?: FormGroup, index?: number) {
    if (domicilioExistente && index !== undefined) {
      this.formularioActual = DomicilioFormFactory.create(this.fb);
      this.formularioActual.patchValue(domicilioExistente.value);
      this.indiceEdicion = index;
    } else {
      this.formularioActual = DomicilioFormFactory.create(this.fb);
      this.indiceEdicion = null;
    }
    this.mostrandoFormulario = true;
    this.cdr.markForCheck();
  }

  cancelarFormulario() {
    this.mostrandoFormulario = false;
    this.formularioActual = null;
    this.indiceEdicion = null;
    this.cdr.markForCheck();
  }

  marcarComoActual(index: number) {
    const yaExisteActual = this.domiciliosGroups.some((g, i) => i !== index && g.value.is_current);
    if (yaExisteActual) {
      alert('Ya existe un domicilio marcado como actual. Al guardar este, el backend podría rechazarlo si no permite dos. Asegúrate de desmarcar el otro primero.');
    }
    this.domiciliosGroups[index].get('is_current')?.setValue(true);
    this.guardarDomicilioDirecto(this.domiciliosGroups[index]);
  }

  async guardarFormulario() {
    if (!this.formularioActual) return;
    
    if (this.formularioActual.invalid) {
      this.formularioActual.markAllAsTouched();
      this.cdr.markForCheck();
      return;
    }

    await this.guardarDomicilioDirecto(this.formularioActual);
    this.cancelarFormulario();
  }

  async guardarDomicilioDirecto(formGroup: FormGroup) {
    const idSolicitud = this.store.detalle()?.id;
    if (!idSolicitud) return;

    const payload = { ...formGroup.value };
    const idDomicilio = payload.id;
    delete payload.id;

    try {
      if (idDomicilio) {
        await firstValueFrom(this.api.actualizarDomicilio(idSolicitud, idDomicilio, payload, this.store.detalle()!.versionBloqueo));
      } else {
        await firstValueFrom(this.api.crearDomicilio(idSolicitud, payload, this.store.detalle()!.versionBloqueo));
      }
      await this.store.cargarDetalle(idSolicitud);
      await this.cargarDomicilios();
    } catch (e: any) {
      if (e?.status === 409) {
        await this.store.cargarDetalle(idSolicitud);
        alert('Versión desactualizada. Se recargó la información. Intenta guardar de nuevo.');
      } else {
        alert(e?.error?.message || 'Error al guardar domicilio');
      }
    } finally {
      this.cdr.markForCheck();
    }
  }

  async eliminarDomicilio(idDomicilio: string) {
    const confirmacion = confirm('¿Estás seguro de que deseas eliminar este domicilio?');
    if (!confirmacion) return;

    const idSolicitud = this.store.detalle()?.id;
    if (!idSolicitud) return;

    try {
      await firstValueFrom(this.api.eliminarDomicilio(idSolicitud, idDomicilio, this.store.detalle()!.versionBloqueo));
      await this.store.cargarDetalle(idSolicitud);
      await this.cargarDomicilios();
    } catch (e) {
      console.error(e);
    } finally {
      this.cdr.markForCheck();
    }
  }
}
