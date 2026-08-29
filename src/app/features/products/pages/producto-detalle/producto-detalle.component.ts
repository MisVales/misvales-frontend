import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ProductosService } from '../../data-access/productos.service';
import { SessionStore } from '../../../../core/session/session.store';
import { InputErrorComponent } from '../../../../shared/components/inputs/input-error/input-error.component';
import { AlertService } from '../../../../shared/components/alerts/alert.service';
import { MoneyInputDirective } from '../../../applications/directives/money-input.directive';
import { apiErrorMessage } from '../../../../core/api/api-error';

@Component({
  selector: 'app-producto-detalle',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, InputErrorComponent, MoneyInputDirective],
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
  private readonly alerts = inject(AlertService);

  protected isNew = computed(() => !this.route.snapshot.paramMap.get('id') || this.route.snapshot.paramMap.get('id') === 'nuevo');
  protected canWrite = computed(() => {
    const permissions = this.session.permissions();
    return permissions.includes('all') || permissions.includes('catalogs.manage');
  });
  protected saving = signal(false);
  protected error = signal<string | null>(null);
  protected readonly controlesConErrorVisible = signal<ReadonlySet<keyof typeof this.form.controls>>(new Set());
  private lockVersion = 0;

  protected form = this.fb.group({
    code: ['', Validators.required],
    name: ['', Validators.required],
    description: [''],
    nominal_amount: ['', [Validators.required, Validators.min(100), Validators.pattern(/^\d+00(?:\.0+)?$/)]],
    loan_commission_percentage: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
    simple_interest_percentage: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
    insurance_amount: ['', [Validators.required, Validators.min(0)]],
    fortnights_count: ['', [Validators.required, Validators.min(1)]],
    late_fee_amount: ['', [Validators.required, Validators.min(0)]],
    reason: ['', Validators.required],
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'nuevo') {
      this.service.consultarDetalle(id).subscribe({
        next: (d: any) => {
          this.lockVersion = d.lock_version;
          const patchObj = { ...d };
          if (d.loan_commission_percentage != null) {
            patchObj.loan_commission_percentage = String(Number(d.loan_commission_percentage) * 100);
          }
          if (d.simple_interest_percentage != null) {
            patchObj.simple_interest_percentage = String(Number(d.simple_interest_percentage) * 100);
          }
          this.form.patchValue(patchObj);
          this.form.controls.code.disable();
        },
        error: (e) => this.error.set(apiErrorMessage(e, 'No fue posible cargar el producto.'))
      });
    }
  }

  async guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.controlesConErrorVisible.set(new Set([
        'code', 'name', 'nominal_amount', 'loan_commission_percentage',
        'simple_interest_percentage', 'insurance_amount', 'fortnights_count',
        'late_fee_amount', 'reason',
      ]));
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
      loan_commission_percentage: v.loan_commission_percentage !== '' && v.loan_commission_percentage != null
        ? String(Number(v.loan_commission_percentage) / 100)
        : null,
      simple_interest_percentage: v.simple_interest_percentage !== '' && v.simple_interest_percentage != null
        ? String(Number(v.simple_interest_percentage) / 100)
        : null,
      insurance_amount: v.insurance_amount !== '' && v.insurance_amount != null
        ? String(v.insurance_amount)
        : null,
      fortnights_count: v.fortnights_count !== '' && v.fortnights_count != null
        ? Number(v.fortnights_count)
        : null,
      late_fee_amount: v.late_fee_amount !== '' && v.late_fee_amount != null
        ? String(v.late_fee_amount)
        : null,
      reason: v.reason!,
    };

    try {
      const id = this.route.snapshot.paramMap.get('id');
      if (this.isNew()) {
        await firstValueFrom(this.service.crear({ code: v.code!, ...payload }));
      } else {
        await firstValueFrom(this.service.actualizar(id!, { ...payload, lock_version: this.lockVersion }));
      }
      this.alerts.success(this.isNew()
        ? 'El producto se guardó como borrador correctamente.'
        : 'La nueva edición del producto se guardó correctamente.');
      await this.router.navigate(['/productos']);
    } catch (e: unknown) {
      this.error.set(apiErrorMessage(e, 'No fue posible guardar el producto.'));
    } finally {
      this.saving.set(false);
    }
  }

  protected marcarCampoAlEnfocar(control: keyof typeof this.form.controls): void {
    this.form.controls[control].markAsTouched();
    this.controlesConErrorVisible.update((controles) => new Set([...controles, control]));
  }

  protected mostrarError(control: keyof typeof this.form.controls): boolean {
    return this.controlesConErrorVisible().has(control);
  }
}
