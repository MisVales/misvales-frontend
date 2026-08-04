import { Component, inject, OnInit } from '@angular/core';
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

  pasoActual: StepName = 'domicilios'; // Set 'domicilios' default as per mockup

  pasos: { id: StepName; label: string; icon: string; completado: boolean }[] = [
    { id: 'datos-personales', label: 'Datos Personales', icon: 'check', completado: true },
    { id: 'familiares', label: 'Familiares', icon: 'check', completado: true },
    { id: 'domicilios', label: 'Domicilios', icon: 'circle', completado: false },
    { id: 'vehiculos', label: 'Vehículos', icon: 'circle', completado: false },
    { id: 'patrimonio', label: 'Patrimonio', icon: 'circle', completado: false },
    { id: 'empleos', label: 'Empleos', icon: 'circle', completado: false },
    { id: 'creditos', label: 'Créditos', icon: 'circle', completado: false },
    { id: 'resumen', label: 'Resumen', icon: 'lock', completado: false },
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
    this.pasoActual = paso;
  }

  getProgresoAncho(completadas: number, totales: number): string {
    if (!totales) return '0%';
    return `${(completadas / totales) * 100}%`;
  }
}
