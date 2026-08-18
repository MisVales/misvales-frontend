import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { PeriodosCanjeService } from '../../data-access/periodos-canje.service';
import { SessionStore } from '../../../../core/session/session.store';
import { InputErrorComponent } from '../../../../shared/ui/input-error/input-error.component';

@Component({
  selector: 'app-periodo-canje-formulario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, InputErrorComponent],
  templateUrl: './periodo-canje-formulario.component.html',
  styleUrls: ['./periodo-canje-formulario.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PeriodoCanjeFormularioComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(PeriodosCanjeService);
  private session = inject(SessionStore);

  protected isNew = computed(() => !this.route.snapshot.paramMap.get('id') || this.route.snapshot.paramMap.get('id') === 'nuevo');
  protected canWrite = computed(() => this.session.roles().includes('general_manager'));
  protected saving = signal(false);
  protected error = signal<string | null>(null);
  private lockVersion = 0;

  protected form = this.fb.group({
    code: ['', Validators.required],
    name: ['', Validators.required],
    description: [''],
    starts_at: ['', Validators.required],
    ends_at: ['', Validators.required],
    reason: ['', Validators.required]
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'nuevo') {
      this.service.consultarDetalle(id).subscribe({
        next: (d) => {
          this.lockVersion = d.lock_version;
          this.form.patchValue({
            code: d.code,
            name: d.name,
            description: d.description,
            starts_at: d.start_date.slice(0, 16),
            ends_at: d.end_date.slice(0, 16)
          });
          this.form.controls.code.disable();
        },
        error: (e) => this.error.set(e?.error?.message ?? 'No fue posible cargar el periodo.')
      });
    }
  }

  async guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.saving()) return;

    this.saving.set(true);
    this.error.set(null);
    const v = this.form.getRawValue();
    const payload = {
      name: v.name!,
      description: v.description || null,
      starts_at: v.starts_at!,
      ends_at: v.ends_at!,
      reason: v.reason!
    };

    try {
      const id = this.route.snapshot.paramMap.get('id');
      if (this.isNew()) {
        await firstValueFrom(this.service.crear({ code: v.code!, ...payload }));
      } else {
        await firstValueFrom(this.service.actualizar(id!, { ...payload, lock_version: this.lockVersion }));
      }
      await this.router.navigate(['/periodos-canje']);
    } catch (e: any) {
      this.error.set(e?.error?.message ?? 'No fue posible guardar el periodo.');
    } finally {
      this.saving.set(false);
    }
  }
}
