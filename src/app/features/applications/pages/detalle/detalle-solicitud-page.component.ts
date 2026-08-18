import { Component, inject, OnInit, effect } from '@angular/core';
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
import { AlertService } from '../../../../shared/services/alert.service';

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
    ResumenEnvioComponent
  ],
  templateUrl: './detalle-solicitud-page.component.html',
  styleUrls: ['./detalle-solicitud-page.component.css']
})
export class DetalleSolicitudPageComponent implements OnInit {
  protected store = inject(SolicitudDetalleStore);
  private route = inject(ActivatedRoute);
  private alerts = inject(AlertService);

  pasoActual: StepName = 'datos-personales';

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
    this.alerts.clear();
    this.pasoActual = paso;
  }

  getPasoCompletado(pasoId: StepName): boolean {
    const decl = this.store.detalle()?.declaracionesSeccion;
    if (!decl) return false;
    const map: Record<StepName, string | undefined> = {
      'datos-personales': decl.datosPersonales,
      'familiares': decl.referenciasFamiliares,
      'domicilios': decl.domicilios,
      'vehiculos': decl.vehiculos,
      'patrimonio': decl.bienes,
      'empleos': decl.empleos,
      'creditos': decl.creditosComerciales,
      'resumen': undefined,
    };
    return map[pasoId] === 'COMPLETED';
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
