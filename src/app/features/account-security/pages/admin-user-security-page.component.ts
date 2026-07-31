import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { UiStateComponent } from '@shared/components/ui-state.component';

@Component({
  selector: 'mv-admin-user-security-page',
  imports: [RouterLink, UiStateComponent],
  template: `
    <section class="mv-panel">
      <p class="mv-eyebrow">Cuentas</p>
      <h1>Seguridad del usuario</h1>
      <mv-ui-state
        kind="error"
        title="Acciones no disponibles"
        message="El recurso organizacional no publica capacidades para elegir de forma segura entre acción directa y solicitud. No se muestran controles de desactivación, reactivación o recuperación."
      />
      <a routerLink="../..">Volver al usuario</a>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminUserSecurityPageComponent {}
