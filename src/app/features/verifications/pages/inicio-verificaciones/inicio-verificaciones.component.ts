import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SessionStore } from '../../../../core/session/session.store';

export function rutaInicialVerificaciones(permisos: readonly string[]): string[] {
  const expediente = [
    'verification.verifiers.assign',
    'verification.corrections.manage',
    'verification.evaluations.decide',
    'verification.authorizations.decide',
  ];

  if (permisos.includes('all') || expediente.some((permiso) => permisos.includes(permiso))) {
    return ['/verificacion-distribuidoras/solicitudes-distribuidora/revision'];
  }

  if (permisos.includes('verification.visits.view')) {
    return ['/verificacion-distribuidoras/verificaciones/asignadas'];
  }

  return ['/inicio'];
}

@Component({
  selector: 'app-inicio-verificaciones',
  standalone: true,
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InicioVerificacionesComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly sessionStore = inject(SessionStore);

  ngOnInit(): void {
    void this.router.navigate(rutaInicialVerificaciones(this.sessionStore.permissions()), {
      replaceUrl: true,
    });
  }
}
