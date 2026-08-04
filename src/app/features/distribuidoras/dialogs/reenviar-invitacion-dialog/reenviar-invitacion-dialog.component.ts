import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ResendDistributorInvitationRequestDto } from '../../data-access/dtos/resend-distributor-invitation-request.dto';

@Component({
  selector: 'app-reenviar-invitacion-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reenviar-invitacion-dialog.component.html',
  styleUrls: ['./reenviar-invitacion-dialog.component.css']
})
export class ReenviarInvitacionDialogComponent {
  @Output() confirmar = new EventEmitter<ResendDistributorInvitationRequestDto>();
  @Output() cancelar = new EventEmitter<void>();

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      reason: ['', Validators.required]
    });
  }

  submit() {
    if (this.form.valid) {
      this.confirmar.emit(this.form.value);
    }
  }

  cerrar() {
    this.cancelar.emit();
  }
}
