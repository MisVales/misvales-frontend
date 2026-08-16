import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DistribuidorasStore } from '../../state/distribuidoras.store';
import { ResumenDistribuidoraComponent } from '../../components/resumen-distribuidora/resumen-distribuidora.component';
import { HistorialCategoriasComponent } from '../../components/historial-categorias/historial-categorias.component';
import { AsignarCategoriaDialogComponent } from '../../dialogs/asignar-categoria-dialog/asignar-categoria-dialog.component';
import { ReenviarInvitacionDialogComponent } from '../../dialogs/reenviar-invitacion-dialog/reenviar-invitacion-dialog.component';
import { DistribuidorasApiService } from '../../data-access/api/distribuidoras-api.service';
import { firstValueFrom } from 'rxjs';
import { AlertService } from '../../../../shared/services/alert.service';

@Component({
  selector: 'app-detalle-distribuidora-page',
  standalone: true,
  imports: [
    CommonModule, 
    ResumenDistribuidoraComponent, 
    HistorialCategoriasComponent,
    AsignarCategoriaDialogComponent,
    ReenviarInvitacionDialogComponent
  ],
  templateUrl: './detalle-distribuidora-page.component.html',
  styleUrls: ['./detalle-distribuidora-page.component.css']
})
export class DetalleDistribuidoraPageComponent implements OnInit, OnDestroy {
  store = inject(DistribuidorasStore);
  route = inject(ActivatedRoute);
  router = inject(Router);
  api = inject(DistribuidorasApiService);
  private readonly alerts = inject(AlertService);
  readonly activeSection = signal<'informacion' | 'credito' | 'historial'>('informacion');

  mostrarModalCategoria = false;
  mostrarModalReenvio = false;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.store.cargarDetalle(id);
      }
    });
  }

  ngOnDestroy() {
    this.store.limpiarDetalle();
  }

  abrirModalCategoria() {
    this.mostrarModalCategoria = true;
  }

  cerrarModalCategoria() {
    this.mostrarModalCategoria = false;
  }

  async guardarCategoria(event: any) {
    const d = this.store.detalle();
    if (d) {
      try {
        await firstValueFrom(this.api.asignarCategoria(d.id, d.versionBloqueo, event));
        this.cerrarModalCategoria();
        this.store.cargarDetalle(d.id); // Recargar para obtener la nueva versión e historial
      } catch (e: any) {
        this.alerts.showAlert(e?.error?.message || 'No fue posible asignar la categoría.', 'error');
      }
    }
  }

  abrirModalReenvio() {
    this.mostrarModalReenvio = true;
  }

  cerrarModalReenvio() {
    this.mostrarModalReenvio = false;
  }

  async reenviarInvitacion(event: any) {
    const d = this.store.detalle();
    if (d) {
      try {
        await firstValueFrom(this.api.reenviarInvitacion(d.id, event));
        this.cerrarModalReenvio();
        this.alerts.showAlert('Invitación reenviada.', 'success');
      } catch (e: any) {
        this.alerts.showAlert(e?.error?.message || 'No fue posible reenviar la invitación.', 'error');
      }
    }
  }

  volver() {
    this.router.navigate(['/distribuidoras']);
  }
}
