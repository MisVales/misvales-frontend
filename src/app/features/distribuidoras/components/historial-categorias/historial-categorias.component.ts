import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DistribuidorasApiService } from '../../data-access/api/distribuidoras-api.service';
import { CategoriaDistribuidora } from '../../models/categoria-distribuidora.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-historial-categorias',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './historial-categorias.component.html',
  styleUrls: ['./historial-categorias.component.css']
})
export class HistorialCategoriasComponent implements OnInit {
  @Input({ required: true }) distribuidoraId!: string;
  
  private api = inject(DistribuidorasApiService);
  
  historial: CategoriaDistribuidora[] = [];
  cargando = false;

  async ngOnInit() {
    await this.cargarHistorial();
  }

  async cargarHistorial() {
    this.cargando = true;
    try {
      this.historial = await firstValueFrom(this.api.obtenerHistorialCategorias(this.distribuidoraId));
    } catch (e) {
      console.error('Error al cargar historial', e);
    } finally {
      this.cargando = false;
    }
  }
}
