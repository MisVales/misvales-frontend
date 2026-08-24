import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import {
  CoordinatorHomeComponent,
  type CoordinatorView,
} from '@features/dashboard/coordinator-home.component';

@Component({
  selector: 'app-coordinator-workspace-page',
  standalone: true,
  imports: [CoordinatorHomeComponent],
  template: `<app-coordinator-home [view]="view()" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoordinatorWorkspacePageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly routeParams = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });
  readonly view = computed<CoordinatorView>(() => {
    const value = this.routeParams().get('view');
    return value === 'pendientes' || value === 'alertas' ? value : 'distribuidoras';
  });
}
