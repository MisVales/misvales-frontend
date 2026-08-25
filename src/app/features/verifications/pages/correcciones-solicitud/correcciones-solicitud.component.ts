import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  OnDestroy,
  signal,
  computed,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VerificacionDistribuidorasFacade } from '../../state/verificacion-distribuidoras.facade';
import { ComparadorCorreccionesComponent } from '../../components/comparador-correcciones/comparador-correcciones.component';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../../../shared/components/alerts/alert.service';
import { ConfirmationService } from '../../../../shared/dialogs/confirmation.service';
import { RefactorSelectComponent } from '@shared/components/inputs/refactor-select/refactor-select.component';

@Component({
  selector: 'app-correcciones-solicitud',
  standalone: true,
  imports: [ComparadorCorreccionesComponent, FormsModule, RefactorSelectComponent],
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
  registroSeleccionado = signal<string>('');

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
    const diferencias = solicitud.visitas.flatMap((v) => v.diferencias);

    // Filtrar aquellas que no tengan una corrección aplicada ya (mismo seccion y campo)
    return diferencias.filter(
      (d) => !solicitud.correcciones.some((c) => c.indiceDiferencia === d.indice),
    );
  });

  abrirCorreccion(diferencia: any) {
    this.diferenciaSeleccionada.set(diferencia);
    this.registroSeleccionado.set(diferencia.registroId || '');
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

    if (this.requiereRegistro(dif) && !this.registroSeleccionado()) {
      this.alerts.showAlert('Selecciona el registro indicado por el verificador.', 'warning');
      return;
    }

    const req = {
      visit_id: solicitud.visitas.at(-1)?.id || '',
      seccion: dif.seccion,
      campo: dif.campo,
      valor_original: dif.datoDeclarado,
      valor_observado: dif.datoObservado,
      lock_version: solicitud.lockVersion,
      record_id: this.registroSeleccionado() || undefined,
      difference_index: dif.indice,
    };

    const success = await this.facade.aplicarCorreccion(solicitud.id, req);
    if (success) {
      this.cerrarCorreccion();
    }
  }

  etiquetaSeccion(seccion: string): string {
    return (
      (
        {
          personal_data: 'Datos personales',
          personal_info: 'Datos personales',
          family_members: 'Familiares y referencias',
          residences: 'Domicilios',
          vehicles: 'Vehículos',
          assets_liabilities: 'Bienes y compromisos',
          employments: 'Empleos',
          commercial_credits: 'Créditos comerciales',
        } as Record<string, string>
      )[seccion] || 'Datos de la solicitud'
    );
  }

  etiquetaCampo(campo: string): string {
    return (
      (
        {
          has_identification_evidence: 'Identificación oficial',
          school_name: 'Escuela',
          proof_reference: 'Referencia del comprobante',
          first_name: 'Nombre(s)',
          first_last_name: 'Apellido paterno',
          second_last_name: 'Apellido materno',
          company_name: 'Empresa',
          brand: 'Marca',
          model: 'Modelo',
          name: 'Nombre',
          employer_name: 'Empleador',
        } as Record<string, string>
      )[campo] || campo.replaceAll('_', ' ')
    );
  }

  requiereRegistro(dif: any): boolean {
    return [
      'family_members',
      'residences',
      'vehicles',
      'assets_liabilities',
      'employments',
      'commercial_credits',
    ].includes(dif.seccion);
  }

  opcionesRegistro(dif: any): Array<{ id: string; nombre: string }> {
    const registros = this.facade.solicitudSeleccionada()?.datosDeclarados?.[dif.seccion];
    if (!Array.isArray(registros)) return [];
    return registros
      .filter((r) => r?.id)
      .map((r) => ({ id: String(r.id), nombre: this.nombreRegistro(dif.seccion, r) }));
  }

  private nombreRegistro(seccion: string, r: Record<string, any>): string {
    if (seccion === 'family_members')
      return (
        [r['first_name'], r['first_last_name'], r['second_last_name']].filter(Boolean).join(' ') ||
        'Familiar'
      );
    if (seccion === 'commercial_credits') return r['company_name'] || 'Crédito comercial';
    if (seccion === 'vehicles')
      return [r['brand'], r['model'], r['model_year']].filter(Boolean).join(' ') || 'Vehículo';
    if (seccion === 'assets_liabilities') return r['name'] || 'Bien o compromiso';
    if (seccion === 'employments') return r['employer_name'] || 'Empleo';
    return (
      [r['street'], r['exterior_number'], r['neighborhood']].filter(Boolean).join(' ') ||
      'Domicilio'
    );
  }

  async finalizarCorrecciones() {
    const solicitud = this.facade.solicitudSeleccionada();
    if (!solicitud) return;

    if (this.diferenciasPendientes().length > 0) {
      if (
        !(await this.confirmation.confirm({
          title: 'Hay diferencias pendientes',
          message:
            'El expediente aún contiene diferencias sin corregir. Si continúas, avanzará con ese registro pendiente.',
          confirmLabel: 'Finalizar de todos modos',
          tone: 'danger',
        }))
      ) {
        return;
      }
    } else {
      if (
        !(await this.confirmation.confirm({
          title: 'Finalizar correcciones',
          message:
            'El expediente avanzará a la siguiente etapa con el historial original, observado y corregido.',
          confirmLabel: 'Finalizar correcciones',
        }))
      ) {
        return;
      }
    }

    const success = await this.facade.finalizarCorrecciones(solicitud.id, {
      lock_version: solicitud.lockVersion,
    });
    if (success) {
      this.alerts.showAlert('Correcciones finalizadas y expediente actualizado.', 'success');
      this.router.navigate([
        '/verificacion-distribuidoras/solicitudes-distribuidora',
        solicitud.id,
      ]);
    }
  }

  onCancel() {
    const solicitud = this.facade.solicitudSeleccionada();
    if (solicitud) {
      this.router.navigate([
        '/verificacion-distribuidoras/solicitudes-distribuidora',
        solicitud.id,
      ]);
    }
  }
}
