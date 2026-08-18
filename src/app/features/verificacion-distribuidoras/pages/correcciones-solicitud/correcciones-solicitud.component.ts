import { ChangeDetectionStrategy, Component, inject, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VerificacionDistribuidorasFacade } from '../../state/verificacion-distribuidoras.facade';
import { ComparadorCorreccionesComponent } from '../../components/comparador-correcciones/comparador-correcciones.component';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../../../shared/services/alert.service';
import { ConfirmationService } from '../../../../shared/services/confirmation.service';

@Component({
  selector: 'app-correcciones-solicitud',
  standalone: true,
  imports: [ComparadorCorreccionesComponent, FormsModule],
  templateUrl: './correcciones-solicitud.component.html',
  styleUrl: './correcciones-solicitud.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CorreccionesSolicitudComponent implements OnInit, OnDestroy {
  protected readonly facade = inject(VerificacionDistribuidorasFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly alerts = inject(AlertService);
  private readonly confirmation = inject(ConfirmationService);

  mostrarFormularioCorreccion = signal<boolean>(false);
  diferenciaSeleccionada = signal<any>(null);

  // Form State
  valorCorregido = signal<string>('');
  motivoCorreccion = signal<string>('');

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.facade.cargarSolicitud(id);
    }
  }

  ngOnDestroy() {
    this.facade.limpiarSeleccion();
  }

  // Obtenemos todas las diferencias reportadas en las visitas
  diferenciasPendientes = computed(() => {
    const solicitud = this.facade.solicitudSeleccionada();
    if (!solicitud) return [];
    
    // Simplificación: juntar todas las diferencias de todas las visitas
    const diferencias = solicitud.visitas.flatMap(v => v.diferencias);
    
    // Filtrar aquellas que no tengan una corrección aplicada ya (mismo seccion y campo)
    return diferencias.filter(d => 
      !solicitud.correcciones.some(c => c.seccion === d.seccion && c.campo === d.campo)
    );
  });

  abrirCorreccion(diferencia: any) {
    this.diferenciaSeleccionada.set(diferencia);
    this.valorCorregido.set(diferencia.datoObservado || '');
    this.motivoCorreccion.set('');
    this.mostrarFormularioCorreccion.set(true);
  }

  cerrarCorreccion() {
    this.mostrarFormularioCorreccion.set(false);
    this.diferenciaSeleccionada.set(null);
  }

  async aplicarCorreccion() {
    const solicitud = this.facade.solicitudSeleccionada();
    const dif = this.diferenciaSeleccionada();
    if (!solicitud || !dif) return;

    if (!this.valorCorregido() || !this.motivoCorreccion()) {
      this.alerts.showAlert('Ingresa el dato corregido y el motivo de la corrección.', 'warning');
      return;
    }

    const req = {
      visit_id: solicitud.visitas.at(-1)?.id || '',
      seccion: dif.seccion,
      campo: dif.campo,
      valor_original: dif.datoDeclarado,
      valor_observado: dif.datoObservado,
      valor_corregido: this.valorCorregido(),
      motivo: this.motivoCorreccion(),
      lock_version: solicitud.lockVersion
    };

    const success = await this.facade.aplicarCorreccion(solicitud.id, req);
    if (success) {
      this.cerrarCorreccion();
    }
  }

  async finalizarCorrecciones() {
    const solicitud = this.facade.solicitudSeleccionada();
    if (!solicitud) return;

    if (this.diferenciasPendientes().length > 0) {
      if (!await this.confirmation.confirm({ title: 'Hay diferencias pendientes', message: 'El expediente aún contiene diferencias sin corregir. Si continúas, avanzará con ese registro pendiente.', confirmLabel: 'Finalizar de todos modos', tone: 'danger' })) {
        return;
      }
    } else {
      if (!await this.confirmation.confirm({ title: 'Finalizar correcciones', message: 'El expediente avanzará a la siguiente etapa con el historial original, observado y corregido.', confirmLabel: 'Finalizar correcciones' })) {
        return;
      }
    }

    const success = await this.facade.finalizarCorrecciones(solicitud.id, { lock_version: solicitud.lockVersion });
    if (success) {
      this.alerts.showAlert('Correcciones finalizadas y expediente actualizado.', 'success');
      this.router.navigate(['/verificacion-distribuidoras/solicitudes-distribuidora', solicitud.id]);
    }
  }

  onCancel() {
    const solicitud = this.facade.solicitudSeleccionada();
    if (solicitud) {
      this.router.navigate(['/verificacion-distribuidoras/solicitudes-distribuidora', solicitud.id]);
    }
  }
}
