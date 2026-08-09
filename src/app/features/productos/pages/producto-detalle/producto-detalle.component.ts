import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductosStore } from '../../estado/productos.store';
import { ProductosService } from '../../data-access/productos.service';
import { ProductosMapper } from '../../data-access/productos.mapper';
import { SessionStore } from '../../../../core/session/session.store';

@Component({
  selector: 'app-producto-detalle',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './producto-detalle.component.html',
  styleUrls: ['./producto-detalle.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductoDetalleComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly store = inject(ProductosStore);
  private readonly productosService = inject(ProductosService);
  private readonly sessionStore = inject(SessionStore);

  protected readonly isNew = computed(() => !this.route.snapshot.paramMap.get('id'));
  protected readonly canWrite = computed(() => {
    const roles = this.sessionStore.roles() as string[];
    return roles && (roles.includes('gerente_general') || roles.includes('admin'));
  });

  protected form = this.fb.group({
    nombre: [{ value: '', disabled: !this.canWrite() }, Validators.required],
    descripcion: [{ value: '', disabled: !this.canWrite() }],
    sku: [{ value: '', disabled: !this.canWrite() }, Validators.required],
    categoriaId: [{ value: '', disabled: !this.canWrite() }, Validators.required],
    precioBase: [{ value: '', disabled: !this.canWrite() }, [Validators.required, Validators.pattern(/^\d+(\.\d{1,4})?$/)]],
  });

  private versionRegistro: number = 0;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'nuevo') {
      this.cargarDetalle(id);
    }
  }

  private cargarDetalle(id: string) {
    this.productosService.consultarDetalle(id).subscribe({
      next: (res) => {
        const model = ProductosMapper.fromDto(res);
        this.versionRegistro = model.versionRegistro;
        this.form.patchValue({
          nombre: model.nombre,
          descripcion: model.descripcion,
          sku: model.sku,
          categoriaId: model.categoriaId,
          precioBase: model.precioBase
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
        sku: val.sku!,
        category_id: val.categoriaId!,
        base_price: val.precioBase!
      });
      this.router.navigate(['/productos']);
    } else {
      const id = this.route.snapshot.paramMap.get('id')!;
      this.store.actualizar(id, {
        name: val.nombre!,
        description: val.descripcion!,
        status: 'ACTIVE',
        sku: val.sku!,
        category_id: val.categoriaId!,
        base_price: val.precioBase!,
        lock_version: this.versionRegistro
      } as any);
      this.router.navigate(['/productos']);
    }
  }
}
