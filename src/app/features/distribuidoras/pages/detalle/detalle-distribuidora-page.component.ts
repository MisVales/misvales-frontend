import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DistribuidorasStore } from '../../state/distribuidoras.store';
import { ResumenDistribuidoraComponent } from '../../components/resumen-distribuidora/resumen-distribuidora.component';
import { HistorialCategoriasComponent } from '../../components/historial-categorias/historial-categorias.component';
import { AsignarCategoriaDialogComponent } from '../../dialogs/asignar-categoria-dialog/asignar-categoria-dialog.component';
import { ReenviarInvitacionDialogComponent } from '../../dialogs/reenviar-invitacion-dialog/reenviar-invitacion-dialog.component';
import { DistribuidorasApiService } from '../../data-access/api/distribuidoras-api.service';
import { firstValueFrom } from 'rxjs';

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
        alert(e?.error?.message || 'Error al asignar categoría');
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
        alert('Invitación reenviada con éxito');
      } catch (e: any) {
        alert(e?.error?.message || 'Error al reenviar invitación');
      }
    }
  }

  irAActivacion() {
    const id = this.store.detalle()?.id;
    if (id) {
      this.router.navigate(['/distribuidoras', id, 'activacion']);
    }
  }

  volver() {
    this.router.navigate(['/distribuidoras']);
  }
}
