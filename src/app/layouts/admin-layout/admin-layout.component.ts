import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../shared/ui/sidebar/sidebar.component';
import { ShellHeaderComponent } from '../../shared/ui/shell-header/shell-header.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, ShellHeaderComponent],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'layout-desktop',
  },
})
export class AdminLayoutComponent {}

