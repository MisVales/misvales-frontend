import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PeriodosCanjeStore } from '../../estado/periodos-canje.store';
import { PeriodosCanjeService } from '../../data-access/periodos-canje.service';
import { PeriodosCanjeMapper } from '../../data-access/periodos-canje.mapper';
import { SessionStore } from '../../../../core/session/session.store';

@Component({
  selector: 'app-periodo-canje-formulario',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './periodo-canje-formulario.component.html',
  styleUrls: ['./periodo-canje-formulario.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeriodoCanjeFormularioComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly store = inject(PeriodosCanjeStore);
  private readonly periodosService = inject(PeriodosCanjeService);
  private readonly sessionStore = inject(SessionStore);

  protected readonly isNew = computed(() => !this.route.snapshot.paramMap.get('id'));
  protected readonly canWrite = computed(() => {
    const roles = this.sessionStore.roles() as string[];
    return roles && (roles.includes('gerente_general') || roles.includes('admin'));
  });

  protected form = this.fb.group({
    nombre: [{ value: '', disabled: !this.canWrite() }, Validators.required],
    fechaInicio: [{ value: '', disabled: !this.canWrite() }, Validators.required],
    fechaFin: [{ value: '', disabled: !this.canWrite() }, Validators.required]
  });

  private versionRegistro: number = 0;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'nuevo') {
      this.cargarDetalle(id);
    }
  }

  private cargarDetalle(id: string) {
    this.periodosService.consultarDetalle(id).subscribe({
      next: (res) => {
        const model = PeriodosCanjeMapper.fromDto(res);
        this.versionRegistro = model.versionRegistro;
        this.form.patchValue({
          nombre: model.nombre,
          fechaInicio: model.fechaInicio.substring(0, 10),
          fechaFin: model.fechaFin.substring(0, 10)
        });
      },
      error: (err) => console.error(err)
    });
  }

  guardar(): void {
    if (this.form.invalid) return;

    const val = this.form.value;
    const start_date = new Date(val.fechaInicio!).toISOString();
    const end_date = new Date(val.fechaFin!).toISOString();

    if (this.isNew()) {
      this.store.crear({
        name: val.nombre!,
        start_date,
        end_date
      });
      this.router.navigate(['/periodos-canje']);
    } else {
      const id = this.route.snapshot.paramMap.get('id')!;
      this.store.actualizar(id, {
        name: val.nombre!,
        start_date,
        end_date,
        lock_version: this.versionRegistro
      });
      this.router.navigate(['/periodos-canje']);
    }
  }
}
