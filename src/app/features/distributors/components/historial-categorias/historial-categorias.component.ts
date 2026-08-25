import { ChangeDetectorRef, Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DistribuidorasApiService } from '../../data-access/api/distribuidoras-api.service';
import { CategoriaDistribuidora } from '../../models/categoria-distribuidora.model';
import { firstValueFrom } from 'rxjs';
import { LucideAngularModule } from 'lucide-angular';
import { EmptyStateComponent } from '../../../../shared/components/status/empty-state/empty-state.component';

@Component({
  selector: 'app-historial-categorias',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, EmptyStateComponent],
  templateUrl: './historial-categorias.component.html',
  styleUrls: ['./historial-categorias.component.css'],
})
export class HistorialCategoriasComponent implements OnInit {
  @Input({ required: true }) distribuidoraId!: string;

  private api = inject(DistribuidorasApiService);
  private changeDetector = inject(ChangeDetectorRef);

  historial: CategoriaDistribuidora[] = [];
  cargando = true;
  error = '';

  async ngOnInit() {
    await this.cargarHistorial();
  }

  async cargarHistorial() {
    this.cargando = true;
    this.error = '';
    try {
      this.historial = await firstValueFrom(
        this.api.obtenerHistorialCategorias(this.distribuidoraId),
      );
    } catch {
      this.error = 'No fue posible consultar el historial de categorías.';
    } finally {
      this.cargando = false;
      this.changeDetector.markForCheck();
    }
  }
}
