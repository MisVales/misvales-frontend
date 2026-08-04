import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SolicitudesListadoStore } from '../../state/solicitudes-listado.store';

@Component({
  selector: 'app-listado-solicitudes-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './listado-solicitudes-page.component.html',
  styleUrls: ['./listado-solicitudes-page.component.css']
})
export class ListadoSolicitudesPageComponent implements OnInit {
  protected store = inject(SolicitudesListadoStore);
  private fb = inject(FormBuilder);

  filtrosForm = this.fb.group({
    application_number: [''],
    status: [''],
    branch_id: [''],
    coordinator_id: [''],
    date_from: ['']
  });

  ngOnInit() {
    this.store.listar();

    this.filtrosForm.valueChanges.subscribe(() => {
      this.store.listar(1, 10, this.getFiltrosVigentes());
    });
  }

  getFiltrosVigentes(): Record<string, string> {
    const val = this.filtrosForm.value;
    const filtrosActivos: Record<string, string> = {};
    Object.keys(val).forEach(key => {
      const value = (val as any)[key];
      if (value) filtrosActivos[key] = value;
    });
    return filtrosActivos;
  }

  getProgresoAncho(completadas: number, totales: number): string {
    if (!totales) return '0%';
    return `${(completadas / totales) * 100}%`;
  }
}
