import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule } from '@angular/forms';
import { SolicitudDetalleStore } from '../../state/solicitud-detalle.store';
import { PatrimonioFormFactory } from '../../forms/patrimonio-form.factory';
import { SolicitudesDistribuidoraApiService } from '../../data-access/solicitudes-distribuidora-api.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-patrimonio-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './patrimonio-form.component.html',
  styleUrls: ['./patrimonio-form.component.css']
})
export class PatrimonioFormComponent implements OnInit {
  protected store = inject(SolicitudDetalleStore);
  private fb = inject(FormBuilder);
  private api = inject(SolicitudesDistribuidoraApiService);

  patrimonioArray: FormArray = PatrimonioFormFactory.createArray(this.fb);
  cargando = false;
  
  tipoActivo: 'ASSET' | 'LIABILITY' | 'ACTIVE_COMMITMENT' = 'ASSET';

  get patrimonioGroups(): FormGroup[] {
    return this.patrimonioArray.controls as FormGroup[];
  }

  get gruposFiltrados(): FormGroup[] {
    return this.patrimonioGroups.filter(g => g.value.entry_type === this.tipoActivo);
  }

  async ngOnInit() {
    await this.esperarDetalle();
    await this.cargarPatrimonio();
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

  async cargarPatrimonio() {
    const id = this.store.detalle()?.id;
    if (!id) return;

    this.cargando = true;
    try {
      const data = await firstValueFrom(this.api.listarPatrimonio(id));
      this.patrimonioArray.clear();
      (data || []).forEach((item: any) => {
        const form = PatrimonioFormFactory.create(this.fb);
        form.patchValue(item);
        this.patrimonioArray.push(form);
      });
    } catch (e) {
      console.error(e);
    } finally {
      this.cargando = false;
    }
  }

  setTipoTab(tipo: 'ASSET' | 'LIABILITY' | 'ACTIVE_COMMITMENT') {
    this.tipoActivo = tipo;
  }

  agregarRegistro() {
    const form = PatrimonioFormFactory.create(this.fb);
    form.patchValue({ entry_type: this.tipoActivo });
    this.patrimonioArray.push(form);
  }

  removerRegistroVisual(formGroup: FormGroup) {
    const index = this.patrimonioGroups.findIndex(g => g === formGroup);
    if (index !== -1) {
      this.patrimonioArray.removeAt(index);
    }
  }

  async guardarRegistro(formGroup: FormGroup) {
    if (formGroup.invalid) {
      formGroup.markAllAsTouched();
      return;
    }

    const idSolicitud = this.store.detalle()?.id;
    if (!idSolicitud) return;

    const payload = { ...formGroup.value };
    const idRegistro = payload.id;
    delete payload.id;

    try {
      if (idRegistro) {
        await firstValueFrom(this.api.actualizarPatrimonio(idSolicitud, idRegistro, payload, this.store.detalle()!.versionBloqueo));
      } else {
        await firstValueFrom(this.api.crearPatrimonio(idSolicitud, payload, this.store.detalle()!.versionBloqueo));
      }
      await this.store.cargarDetalle(idSolicitud);
      await this.cargarPatrimonio();
    } catch (e: any) {
      if (e?.status === 409) {
        await this.store.cargarDetalle(idSolicitud);
        alert('Versión desactualizada. Se recargó la información. Intenta guardar de nuevo.');
      }
    }
  }

  async eliminarRegistroAPI(formGroup: FormGroup, idRegistro: string) {
    const confirmacion = confirm('¿Estás seguro de que deseas eliminar este registro patrimonial?');
    if (!confirmacion) return;

    const idSolicitud = this.store.detalle()?.id;
    if (!idSolicitud) return;

    try {
      await firstValueFrom(this.api.eliminarPatrimonio(idSolicitud, idRegistro, this.store.detalle()!.versionBloqueo));
      this.removerRegistroVisual(formGroup);
      await this.store.cargarDetalle(idSolicitud);
    } catch (e) {
      console.error(e);
    }
  }
}
