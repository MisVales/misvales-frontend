import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

export type DistributorWorkspaceSection = 'summary' | 'credit' | 'payments' | 'history';

@Component({
  selector: 'app-distributor-workspace-nav',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './distributor-workspace-nav.component.html',
  styleUrl: './distributor-workspace-nav.component.css',
  host: {
    '[class.workspace-nav-host--header]': "variant === 'header'",
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DistributorWorkspaceNavComponent {
  @Input({ required: true }) distributorNumber = '';
  @Input() distributorId: string | null = null;
  @Input({ required: true }) active: DistributorWorkspaceSection = 'summary';
  @Input() backRoute = '/distribuidoras';
  @Input() variant: 'page' | 'header' = 'page';
}
