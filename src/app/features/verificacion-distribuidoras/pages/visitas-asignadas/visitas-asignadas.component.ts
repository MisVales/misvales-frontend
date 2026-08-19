import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { VerificacionDistribuidorasFacade } from '../../state/verificacion-distribuidoras.facade';
import { StatusLabelPipe } from '../../../../shared/pipes/status-label.pipe';

@Component({
  selector: 'app-visitas-asignadas',
  standalone: true,
  imports: [DatePipe, RouterLink, StatusLabelPipe],
  templateUrl: './visitas-asignadas.component.html',
  styleUrl: './visitas-asignadas.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VisitasAsignadasComponent implements OnInit {
  protected readonly facade = inject(VerificacionDistribuidorasFacade);

  ngOnInit() {
    this.facade.cargarVisitasAsignadas(1, 20);
  }

  onPageChange(page: number) {
    this.facade.cargarVisitasAsignadas(page, this.facade.perPageVisitas());
  }
}
