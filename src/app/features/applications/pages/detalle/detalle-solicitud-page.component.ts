import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SolicitudDetalleStore } from '../../state/solicitud-detalle.store';
import { DatosPersonalesFormComponent } from '../../components/datos-personales-form/datos-personales-form.component';
import { FamiliaresFormComponent } from '../../components/familiares-form/familiares-form.component';
import { DomiciliosFormComponent } from '../../components/domicilios-form/domicilios-form.component';
import { VehiculosFormComponent } from '../../components/vehiculos-form/vehiculos-form.component';
import { PatrimonioFormComponent } from '../../components/patrimonio-form/patrimonio-form.component';
import { EmpleosFormComponent } from '../../components/empleos-form/empleos-form.component';
import { CreditosComercialesFormComponent } from '../../components/creditos-comerciales-form/creditos-comerciales-form.component';
import { ResumenEnvioComponent } from '../../components/resumen-envio/resumen-envio.component';
import { AlertService } from '../../../../shared/components/alerts/alert.service';
import { StatusLabelPipe } from '../../../../shared/pipes/status-label.pipe';

type StepName = 'datos-personales' | 'familiares' | 'domicilios' | 'vehiculos' | 'patrimonio' | 'empleos' | 'creditos' | 'resumen';

@Component({
  selector: 'app-detalle-solicitud-page',
  standalone: true,
  imports: [
    CommonModule,
    DatosPersonalesFormComponent,
    FamiliaresFormComponent,
    DomiciliosFormComponent,
    VehiculosFormComponent,
    PatrimonioFormComponent,
    EmpleosFormComponent,
    CreditosComercialesFormComponent,
    ResumenEnvioComponent,
    StatusLabelPipe,
  ],
  templateUrl: './detalle-solicitud-page.component.html',
  styleUrls: ['./detalle-solicitud-page.component.css']
})
export class DetalleSolicitudPageComponent implements OnInit {
  protected store = inject(SolicitudDetalleStore);
  private route = inject(ActivatedRoute);
  private alerts = inject(AlertService);

  pasoActual: StepName = 'datos-personales';

  @ViewChild(DatosPersonalesFormComponent)
  private datosPersonalesForm?: DatosPersonalesFormComponent;

  @ViewChild(FamiliaresFormComponent)
  private familiaresForm?: FamiliaresFormComponent;

  @ViewChild(DomiciliosFormComponent)
  private domiciliosForm?: DomiciliosFormComponent;

  @ViewChild(VehiculosFormComponent)
  private vehiculosForm?: VehiculosFormComponent;

  @ViewChild(PatrimonioFormComponent)
  private patrimonioForm?: PatrimonioFormComponent;

  @ViewChild(EmpleosFormComponent)
  private empleosForm?: EmpleosFormComponent;

  @ViewChild(CreditosComercialesFormComponent)
  private creditosForm?: CreditosComercialesFormComponent;

  pasos: { id: StepName; label: string }[] = [
    { id: 'datos-personales', label: 'Datos Personales' },
    { id: 'familiares', label: 'Familiares' },
    { id: 'domicilios', label: 'Domicilios' },
    { id: 'vehiculos', label: 'Vehículos' },
    { id: 'patrimonio', label: 'Patrimonio' },
    { id: 'empleos', label: 'Empleos' },
    { id: 'creditos', label: 'Créditos' },
    { id: 'resumen', label: 'Resumen' },
  ];

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('application_id');
      if (id) {
        this.store.cargarDetalle(id);
      }
    });
  }

  cambiarPaso(paso: StepName) {
    if (paso !== this.pasoActual) {
      const seccionActual = this.obtenerSeccionActual();
      if (seccionActual && !seccionActual.puedeCambiarDePaso()) {
        this.alerts.showAlert(
          seccionActual.mensajeBloqueoCambio ?? 'Corrige los campos marcados antes de cambiar de pestaña.',
          'warning',
        );
        return;
      }
    }

    this.alerts.clear();
    this.pasoActual = paso;
    const id = this.store.detalle()?.id;
    if (id && paso === 'resumen') {
      this.store.refrescarDetalleSilencioso(id);
    }
  }

  private obtenerSeccionActual(): SeccionValidable | undefined {
    return {
      'datos-personales': this.datosPersonalesForm,
      familiares: this.familiaresForm,
      domicilios: this.domiciliosForm,
      vehiculos: this.vehiculosForm,
      patrimonio: this.patrimonioForm,
      empleos: this.empleosForm,
      creditos: this.creditosForm,
      resumen: undefined,
    }[this.pasoActual];
  }

  getPasoCompletado(pasoId: StepName): boolean {
    const detalle = this.store.detalle();
    const decl = detalle?.declaracionesSeccion;
    if (!decl) return false;

    switch (pasoId) {
      case 'datos-personales':
        return decl.datosPersonales === 'COMPLETED';
      case 'familiares':
        return decl.referenciasFamiliares === 'COMPLETED' || decl.hijos === 'COMPLETED' || decl.pareja === 'COMPLETED';
      case 'domicilios':
        return decl.domicilios === 'COMPLETED';
      case 'vehiculos':
        return decl.vehiculos === 'COMPLETED';
      case 'patrimonio':
        return decl.bienes === 'COMPLETED' || decl.pasivos === 'COMPLETED';
      case 'empleos':
        return decl.empleos === 'COMPLETED';
      case 'creditos':
        return decl.creditosComerciales === 'COMPLETED';
      case 'resumen':
        return detalle?.estado !== 'DRAFT';
      default:
        return false;
    }
  }

  getProgresoAncho(): string {
    const avance = this.store.detalle()?.avance;
    if (!avance || !avance.seccionesTotales) return '0%';
    return `${Math.round((avance.seccionesCompletadas / avance.seccionesTotales) * 100)}%`;
  }

  getProgresoPorcentaje(): number {
    const avance = this.store.detalle()?.avance;
    if (!avance || !avance.seccionesTotales) return 0;
    return Math.round((avance.seccionesCompletadas / avance.seccionesTotales) * 100);
  }

  isEditable(): boolean {
    return this.store.detalle()?.estado === 'DRAFT';
  }
}

interface SeccionValidable {
  mensajeBloqueoCambio?: string;
  puedeCambiarDePaso(): boolean;
}
