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
    await this.cargarPatrimonio();
  }

  async cargarPatrimonio() {
    const id = this.store.detalle()?.id;
    if (!id) return;

    this.cargando = true;
    try {
      const data = await firstValueFrom(this.api.listarPatrimonio(id));
      this.patrimonioArray.clear();
      data.forEach((item: any) => {
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
    const version = this.store.detalle()?.versionBloqueo;
    if (!idSolicitud || version === undefined) return;

    const payload = formGroup.value;
    const idRegistro = payload.id;
    delete payload.id;

    try {
      if (idRegistro) {
        await firstValueFrom(this.api.actualizarPatrimonio(idSolicitud, idRegistro, payload, version));
      } else {
        await firstValueFrom(this.api.crearPatrimonio(idSolicitud, payload, version));
      }
      await this.cargarPatrimonio();
      this.store.cargarDetalle(idSolicitud);
    } catch (e: any) {
      if (e?.status === 409) {
        alert('El expediente fue modificado por otro usuario. Recarga la información antes de continuar.');
      }
    }
  }

  async eliminarRegistroAPI(formGroup: FormGroup, idRegistro: string) {
    const confirmacion = confirm('¿Estás seguro de que deseas eliminar este registro patrimonial?');
    if (!confirmacion) return;

    const idSolicitud = this.store.detalle()?.id;
    const version = this.store.detalle()?.versionBloqueo;
    if (!idSolicitud || version === undefined) return;

    try {
      await firstValueFrom(this.api.eliminarPatrimonio(idSolicitud, idRegistro, version));
      this.removerRegistroVisual(formGroup);
      this.store.cargarDetalle(idSolicitud);
    } catch (e) {
      console.error(e);
    }
  }
}
