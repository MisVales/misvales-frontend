import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductosStore } from '../../estado/productos.store';
import { SessionStore } from '../../../../core/session/session.store';
import { CatalogosMapper } from '../../../../core/mappers/catalogos.mapper';
import { ProductosService } from '../../data-access/productos.service';

function multiploDeCienValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;
  const num = parseFloat(value);
  if (isNaN(num)) return { notNumber: true };
  if (num % 100 !== 0) return { notMultiple100: true };
  return null;
}

@Component({
  selector: 'app-producto-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './producto-detail.component.html',
  styleUrls: ['./producto-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductoDetailComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly store = inject(ProductosStore);
  private readonly productosService = inject(ProductosService);
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
    montoNominal: [{ value: '', disabled: !this.canWrite() }, [Validators.required, Validators.pattern(/^\d+(\.\d{1,4})?$/), multiploDeCienValidator]],
    comisionPrestamo: [{ value: '', disabled: !this.canWrite() }, [Validators.required, Validators.pattern(/^\d+(\.\d{1,4})?$/)]],
    interesQuincenal: [{ value: '', disabled: !this.canWrite() }, [Validators.required, Validators.pattern(/^\d+(\.\d{1,4})?$/)]],
    seguro: [{ value: '', disabled: !this.canWrite() }, [Validators.required, Validators.pattern(/^\d+(\.\d{1,4})?$/)]],
    numeroQuincenas: [{ value: 0, disabled: !this.canWrite() }, [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)]],
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
    this.productosService.consultar(id).subscribe({
      next: (res) => {
        const model = CatalogosMapper.mapProductoResToModel(res);
        this.form.patchValue({
          nombre: model.nombre,
          descripcion: model.descripcion,
          montoNominal: model.montoNominal,
          comisionPrestamo: model.comisionPrestamo,
          interesQuincenal: model.interesQuincenal,
          seguro: model.seguro,
          numeroQuincenas: model.numeroQuincenas,
          inicioVigencia: model.inicioVigencia.toISOString().substring(0, 10),
          motivo: model.motivo || ''
        });
      },
      error: (err) => console.error(err)
    });
  }

  guardar(): void {
    if (this.form.invalid) return;

    const formValues = this.form.value;
    const req = CatalogosMapper.mapProductoModelToReq({
      ...formValues,
      numeroQuincenas: Number(formValues.numeroQuincenas),
      inicioVigencia: new Date(formValues.inicioVigencia!)
    } as any);

    if (this.isNew()) {
      this.store.crearProducto(req);
    } else {
      // Modify existing
    }
  }
}
