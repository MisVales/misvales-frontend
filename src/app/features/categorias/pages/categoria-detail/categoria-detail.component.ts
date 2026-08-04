import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CategoriasStore } from '../../estado/categorias.store';
import { SessionStore } from '../../../../core/session/session.store';
import { CatalogosMapper } from '../../../../core/mappers/catalogos.mapper';
import { CategoriasService } from '../../data-access/categorias.service';

@Component({
  selector: 'app-categoria-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './categoria-detail.component.html',
  styleUrls: ['./categoria-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriaDetailComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly store = inject(CategoriasStore);
  private readonly categoriasService = inject(CategoriasService);
  private readonly sessionStore = inject(SessionStore);

  // Computed state for UI
  protected readonly isNew = computed(() => !this.route.snapshot.paramMap.get('id'));
  protected readonly canWrite = computed(() => {
    const roles = this.sessionStore.roles() as string[];
    return roles && (roles.includes('gerente_general') || roles.includes('admin'));
  });

  protected form = this.fb.group({
    nombre: [{ value: '', disabled: !this.canWrite() }, Validators.required],
    descripcion: [{ value: '', disabled: !this.canWrite() }],
    porcentajeGanancia: [{ value: '', disabled: !this.canWrite() }, [Validators.required, Validators.pattern(/^\d+(\.\d{1,4})?$/)]],
    inicioVigencia: [{ value: '', disabled: !this.canWrite() }, Validators.required],
    motivo: [{ value: '', disabled: !this.canWrite() }, Validators.required],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarDetalle(id);
    }
  }

  private cargarDetalle(id: string) {
    this.categoriasService.consultar(id).subscribe({
      next: (res) => {
        const model = CatalogosMapper.mapCategoriaResToModel(res);
        this.form.patchValue({
          nombre: model.nombre,
          descripcion: model.descripcion,
          porcentajeGanancia: model.porcentajeGanancia,
          inicioVigencia: model.inicioVigencia.toISOString().substring(0, 10), // Simplificado para date input
          motivo: model.motivo || ''
        });
      },
      error: (err) => console.error(err)
    });
  }

  guardar(): void {
    if (this.form.invalid) return;

    const req = CatalogosMapper.mapCategoriaModelToReq({
      ...this.form.value,
      inicioVigencia: new Date(this.form.value.inicioVigencia!)
    } as any);

    if (this.isNew()) {
      this.store.crearCategoria(req);
    } else {
      // Logic for modifying an existing one (borrador)
      const id = this.route.snapshot.paramMap.get('id')!;
      // Assuming store has a modificarCategoria method... this will be implemented later.
      // this.store.modificarCategoria({id, req, lockVersion: ...});
    }
  }
}
