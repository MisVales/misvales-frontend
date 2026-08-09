import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Branch } from '../../../features/organization/data-access/organization.dtos';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-branch-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative">
      <select 
        [ngModel]="selectedBranchId" 
        (ngModelChange)="onBranchChange($event)"
        class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#386641] focus:border-[#386641] sm:text-sm rounded-md"
      >
        <option [ngValue]="null" disabled>Seleccione una sucursal</option>
        <option *ngFor="let branch of branches" [ngValue]="branch.id">
          {{ branch.name }} ({{ branch.code }})
        </option>
      </select>
    </div>
  `,
  styles: []
})
export class BranchSelectorComponent {
  @Input() branches: Branch[] = [];
  @Input() selectedBranchId: string | null = null;
  @Output() selectionChange = new EventEmitter<string>();

  onBranchChange(id: string) {
    this.selectionChange.emit(id);
  }
}
