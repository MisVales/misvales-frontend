import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ViewStateComponent } from '../../../../shared/ui/view-state/view-state.component';

@Component({
  selector: 'app-service-unavailable', standalone: true, imports: [ViewStateComponent],
  template: `<main class="mx-auto w-full max-w-3xl p-6 lg:p-10"><app-view-state kind="error" title="Servicio no disponible" message="No fue posible validar tu sesión. Conservamos tu sesión y puedes reintentar." actionLabel="Reintentar" (action)="retry()" /></main>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceUnavailableComponent {
  private readonly router = inject(Router);
  retry(): void { void this.router.navigateByUrl('/inicio'); }
}
