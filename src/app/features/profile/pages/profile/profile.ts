import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionStore } from '../../../../core/session/session.store';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './profile.html',
})
export class Profile {
  sessionStore = inject(SessionStore);
}
