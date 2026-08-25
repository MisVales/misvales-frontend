import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../layouts/desktop/sidebar/sidebar.component';
import { ShellHeaderComponent } from '../../layouts/desktop/header/shell-header.component';
import { SessionStore } from '../../core/session/session.store';

@Component({
  selector: 'app-desktop-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, ShellHeaderComponent],
  templateUrl: './desktop-layout.html',
  styleUrl: './desktop-layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'layout-desktop' },
})
export class DesktopLayoutComponent {
  private readonly session = inject(SessionStore);
  readonly isReadOnlyAdmin = computed(
    () =>
      this.session.roles().includes('admin') && !this.session.roles().includes('general_manager'),
  );
}
