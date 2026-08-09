import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CandidatoActivacion, CategoriaDisponible, DistribuidorasApiService } from '../../data-access/api/distribuidoras-api.service';

@Component({
  selector: 'app-activacion-distribuidora-page', standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './activacion-distribuidora-page.component.html',
  styleUrls: ['./activacion-distribuidora-page.component.css']
})
export class ActivacionDistribuidoraPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(DistribuidorasApiService);
  private readonly fb = inject(FormBuilder);
  readonly form = this.fb.nonNullable.group({ category_version_id: ['', Validators.required] });
  candidato?: CandidatoActivacion;
  categorias: CategoriaDisponible[] = [];
  cargando = true;
  guardando = false;
  error = '';

  async ngOnInit(): Promise<void> {
    try {
      const id = this.route.snapshot.paramMap.get('id');
      const [candidatos, categorias] = await Promise.all([
        firstValueFrom(this.api.candidatosActivacion()), firstValueFrom(this.api.categoriasDisponibles())
      ]);
      this.candidato = candidatos.find(item => item.id === id);
      this.categorias = categorias;
      if (!this.candidato) this.error = 'La solicitud no está autorizada, ya fue utilizada o está fuera de tu alcance.';
    } catch { this.error = 'No fue posible cargar los datos de alta.'; }
    finally { this.cargando = false; }
  }

  async confirmar(): Promise<void> {
    if (!this.candidato || this.form.invalid) return;
    this.guardando = true; this.error = '';
    try {
      const distribuidora = await firstValueFrom(this.api.activarSolicitud(this.candidato.id, this.form.getRawValue().category_version_id));
      await this.router.navigate(['/distribuidoras', distribuidora.id]);
    } catch (error: any) { this.error = error?.error?.message ?? 'No fue posible completar el alta.'; }
    finally { this.guardando = false; }
  }

  volver(): void { void this.router.navigate(['/distribuidoras']); }
}
