import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CategoriasStore } from '../../estado/categorias.store';
import { CategoriasService } from '../../data-access/categorias.service';
import { CategoriasMapper } from '../../data-access/categorias.mapper';
import { SessionStore } from '../../../../core/session/session.store';

@Component({
  selector: 'app-categoria-detalle',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './categoria-detalle.component.html',
  styleUrls: ['./categoria-detalle.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriaDetalleComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly store = inject(CategoriasStore);
  private readonly categoriasService = inject(CategoriasService);
  private readonly sessionStore = inject(SessionStore);

  protected readonly isNew = computed(() => !this.route.snapshot.paramMap.get('id'));
  protected readonly canWrite = computed(() => {
    const roles = this.sessionStore.roles() as string[];
    return roles && (roles.includes('gerente_general') || roles.includes('admin'));
  });

  protected form = this.fb.group({
    nombre: [{ value: '', disabled: !this.canWrite() }, Validators.required],
    descripcion: [{ value: '', disabled: !this.canWrite() }],
    margenGanancia: [{ value: '', disabled: !this.canWrite() }, [Validators.required, Validators.pattern(/^\d+(\.\d{1,4})?$/)]],
  });

  private versionRegistro: number = 0;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'nueva') {
      this.cargarDetalle(id);
    }
  }

  private cargarDetalle(id: string) {
    this.categoriasService.consultarDetalle(id).subscribe({
      next: (res) => {
        const model = CategoriasMapper.fromDto(res);
        this.versionRegistro = model.versionRegistro;
        this.form.patchValue({
          nombre: model.nombre,
          descripcion: model.descripcion,
          margenGanancia: model.margenGanancia
        });
      },
      error: (err) => console.error(err)
    });
  }

  guardar(): void {
    if (this.form.invalid) return;

    const val = this.form.value;

    if (this.isNew()) {
      this.store.crear({
        name: val.nombre!,
        description: val.descripcion!,
        profit_margin: val.margenGanancia!
      });
      this.router.navigate(['/categorias']);
    } else {
      const id = this.route.snapshot.paramMap.get('id')!;
      this.store.actualizar(id, {
        name: val.nombre!,
        description: val.descripcion!,
        status: 'ACTIVE',
        profit_margin: val.margenGanancia!,
        lock_version: this.versionRegistro
      });
      this.router.navigate(['/categorias']);
    }
  }
}
