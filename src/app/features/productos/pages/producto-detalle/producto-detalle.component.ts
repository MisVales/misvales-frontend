import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ProductosService } from '../../data-access/productos.service';
import { SessionStore } from '../../../../core/session/session.store';
import { InputErrorComponent } from '../../../../shared/ui/input-error/input-error.component';

@Component({
  selector: 'app-producto-detalle',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, InputErrorComponent],
  templateUrl: './producto-detalle.component.html',
  styleUrls: ['./producto-detalle.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductoDetalleComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(ProductosService);
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
    nominal_amount: ['', [Validators.required, Validators.min(100)]],
    loan_commission_percentage: ['', [Validators.required, Validators.min(0), Validators.max(1)]],
    simple_interest_percentage: ['', [Validators.required, Validators.min(0), Validators.max(1)]],
    insurance_amount: ['', [Validators.required, Validators.min(0)]],
    fortnights_count: [1, [Validators.required, Validators.min(1)]],
    reason: ['', Validators.required],
    effective_from: ['', Validators.required]
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'nuevo') {
      this.service.consultarDetalle(id).subscribe({
        next: (d) => {
          this.lockVersion = d.lock_version;
          this.form.patchValue(d as any);
          this.form.controls.code.disable();
        },
        error: (e) => this.error.set(e?.error?.message ?? 'No fue posible cargar el producto.')
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
      nominal_amount: String(v.nominal_amount),
      loan_commission_percentage: String(v.loan_commission_percentage),
      simple_interest_percentage: String(v.simple_interest_percentage),
      insurance_amount: String(v.insurance_amount),
      fortnights_count: Number(v.fortnights_count),
      reason: v.reason!,
      effective_from: v.effective_from!
    };

    try {
      const id = this.route.snapshot.paramMap.get('id');
      if (this.isNew()) {
        await firstValueFrom(this.service.crear({ code: v.code!, ...payload }));
      } else {
        await firstValueFrom(this.service.actualizar(id!, { ...payload, lock_version: this.lockVersion }));
      }
      await this.router.navigate(['/productos']);
    } catch (e: any) {
      this.error.set(e?.error?.message ?? 'No fue posible guardar el producto.');
    } finally {
      this.saving.set(false);
    }
  }
}
