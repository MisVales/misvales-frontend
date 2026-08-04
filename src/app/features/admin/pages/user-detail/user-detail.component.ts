import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDetailComponent {
  private route = inject(ActivatedRoute);
  
  userId = signal<string | null>(null);
  
  // Modals state
  isBlockModalOpen = signal(false);
  isDisableModalOpen = signal(false);
  isRoleModalOpen = signal(false);

  constructor() {
    this.userId.set(this.route.snapshot.paramMap.get('id'));
  }

  openBlockModal() {
    this.isBlockModalOpen.set(true);
  }

  closeBlockModal() {
    this.isBlockModalOpen.set(false);
  }

  confirmBlock() {
    // LLamar al API
    alert('Usuario bloqueado exitosamente.');
    this.closeBlockModal();
  }

  openDisableModal() {
    this.isDisableModalOpen.set(true);
  }

  closeDisableModal() {
    this.isDisableModalOpen.set(false);
  }

  confirmDisable() {
    alert('Usuario deshabilitado exitosamente.');
    this.closeDisableModal();
  }
}
