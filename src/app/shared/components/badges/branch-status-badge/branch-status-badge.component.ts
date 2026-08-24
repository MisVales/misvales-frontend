import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-branch-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span 
      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
      [ngClass]="{
        'bg-green-100 text-green-800': isActive,
        'bg-red-100 text-red-800': !isActive
      }"
    >
      {{ isActive ? 'Activa' : 'Inactiva' }}
    </span>
  `,
  styles: []
})
export class BranchStatusBadgeComponent {
  @Input() isActive: boolean = false;
}
