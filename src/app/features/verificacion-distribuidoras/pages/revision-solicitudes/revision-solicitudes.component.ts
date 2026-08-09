import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { VerificacionDistribuidorasFacade } from '../../state/verificacion-distribuidoras.facade';
import { EstadoSolicitudComponent } from '../../components/estado-solicitud/estado-solicitud.component';

@Component({
  selector: 'app-revision-solicitudes',
  standalone: true,
  imports: [DatePipe, RouterLink, EstadoSolicitudComponent],
  templateUrl: './revision-solicitudes.component.html',
  styleUrl: './revision-solicitudes.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RevisionSolicitudesComponent implements OnInit {
  protected readonly facade = inject(VerificacionDistribuidorasFacade);

  ngOnInit() {
    void this.facade.cargarSolicitudes(1, 20);
  }

  onPageChange(page: number) {
    void this.facade.cargarSolicitudes(page, this.facade.perPageSolicitudes());
  }
}
