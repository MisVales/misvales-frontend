import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { DistribuidorasApiService } from '../../data-access/api/distribuidoras-api.service';
import { CategoriasService } from '../../../categories/data-access/categorias.service';
import { CategoryDto } from '../../../categories/data-access/categorias.dtos';
import { VerificacionDistribuidorasApiService } from '../../../verifications/data-access/api/verificacion-distribuidoras-api.service';
import { SolicitudDistribuidoraResponseDto } from '../../../verifications/data-access/dtos/verificacion-distribuidoras.dtos';
import { InputErrorComponent } from '../../../../shared/components/inputs/input-error/input-error.component';
import { StatusLabelPipe } from '../../../../shared/pipes/status-label.pipe';
import { RefactorSelectComponent } from '@shared/components/inputs/refactor-select/refactor-select.component';

@Component({
  selector: 'app-activacion-distribuidora-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputErrorComponent,
    StatusLabelPipe,
    RefactorSelectComponent,
  ],
  templateUrl: './activacion-distribuidora-page.component.html',
  styleUrls: ['./activacion-distribuidora-page.component.css'],
})
export class ActivacionDistribuidoraPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(DistribuidorasApiService);
  private categoriesApi = inject(CategoriasService);
  private applicationsApi = inject(VerificacionDistribuidorasApiService);
  private fb = inject(FormBuilder);

  solicitud = signal<SolicitudDistribuidoraResponseDto | null>(null);
  categorias = signal<CategoryDto[]>([]);
  cargando = signal(true);
  activando = signal(false);
  error = signal<string | null>(null);

  form = this.fb.group({
    category_version_id: ['', Validators.required],
  });

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    try {
      const [application, categories] = await Promise.all([
        firstValueFrom(this.applicationsApi.consultarSolicitud(id)),
        firstValueFrom(this.categoriesApi.listar(1, 100)),
      ]);
      this.solicitud.set(application);
      this.categorias.set(
        categories.data.filter(
          (categoria) =>
            categoria.status === 'ACTIVE' &&
            categoria.version_status === 'PUBLISHED' &&
            !!categoria.version_id,
        ),
      );
      if (application.status !== 'AUTHORIZED_PENDING_ACTIVATION') {
        this.error.set('La solicitud no está autorizada y pendiente de activación.');
      }
    } catch (e: any) {
      this.error.set(
        e?.error?.error?.message ?? e?.error?.message ?? 'No fue posible preparar la activación.',
      );
    } finally {
      this.cargando.set(false);
    }
  }

  async confirmarActivacion() {
    const application = this.solicitud();
    if (
      !application ||
      this.form.invalid ||
      this.activando() ||
      application.status !== 'AUTHORIZED_PENDING_ACTIVATION'
    ) {
      this.form.markAllAsTouched();
      return;
    }
    this.activando.set(true);
    this.error.set(null);
    try {
      const distributor = await firstValueFrom(
        this.api.activarSolicitud(application.id, this.form.getRawValue().category_version_id!),
      );
      await this.router.navigate(['/distribuidoras', distributor.id]);
    } catch (e: any) {
      this.error.set(
        e?.error?.error?.message ?? e?.error?.message ?? 'No fue posible activar la distribuidora.',
      );
    } finally {
      this.activando.set(false);
    }
  }

  volver() {
    this.router.navigate([
      '/verificacion-distribuidoras/solicitudes-distribuidora',
      this.solicitud()?.id,
    ]);
  }
}
