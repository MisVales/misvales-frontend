import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CategoriasService } from '../../data-access/categorias.service';
import { InputErrorComponent } from '../../../../shared/ui/input-error/input-error.component';

@Component({
  selector: 'app-categoria-detalle',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, InputErrorComponent],
  templateUrl: './categoria-detalle.component.html',
  styleUrls: ['./categoria-detalle.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoriaDetalleComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(CategoriasService);

  readonly isNew = !this.route.snapshot.paramMap.get('id');
  readonly saving = signal(false);
  readonly error = signal('');

  readonly form = this.fb.group({
    code: ['', [Validators.required, Validators.maxLength(255)]],
    name: ['', Validators.required],
    description: [''],
    profit_percentage: ['', [Validators.required, Validators.pattern(/^(0(\.\d+)?|1(\.0+)?)$/)]],
    reason: ['', Validators.required],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.service.consultarDetalle(id).subscribe({
        next: (category) => {
          this.form.patchValue({
            code: category.code,
            name: category.name,
            description: category.description,
            profit_percentage: category.profit_margin,
            reason: '',
          });
          this.form.controls.code.disable();
        },
        error: () => this.error.set('No fue posible cargar la categoría.')
      });
    }
  }

  async guardar(): Promise<void> {
    if (this.saving()) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.error.set('');
    const value = this.form.getRawValue();
    try {
      const payload = {
        name: value.name!,
        description: value.description || null,
        profit_percentage: value.profit_percentage!,
        reason: value.reason!,
      };
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        await firstValueFrom(this.service.actualizar(id, { ...payload, lock_version: 0 }));
      } else {
        await firstValueFrom(this.service.crear({ code: value.code!, ...payload }));
      }
      await this.router.navigate(['/categorias']);
    } catch (error: any) {
      this.error.set(error?.error?.message ?? 'No fue posible guardar la categoría.');
    } finally {
      this.saving.set(false);
    }
  }
}
