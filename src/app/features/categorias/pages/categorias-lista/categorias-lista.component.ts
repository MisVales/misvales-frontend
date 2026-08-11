import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoriasStore } from '../../estado/categorias.store';
import { RouterModule } from '@angular/router';
import { CategoriasService } from '../../data-access/categorias.service';
import { SessionStore } from '../../../../core/session/session.store';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-categorias-lista',
  imports: [CommonModule, RouterModule],
  templateUrl: './categorias-lista.component.html',
  styleUrls: ['./categorias-lista.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriasListaComponent implements OnInit {
  protected readonly store = inject(CategoriasStore);
  private readonly api = inject(CategoriasService);
  protected readonly session = inject(SessionStore);

  ngOnInit(): void {
    this.store.listar();
  }

  async publicar(versionId: string, lockVersion: number) {
    const reason = window.prompt('Motivo obligatorio de publicación:')?.trim();
    if (!reason) return;
    try { await firstValueFrom(this.api.publicarVersion(versionId, lockVersion, reason)); await this.store.listar(); }
    catch (error: any) { window.alert(error?.error?.message ?? 'No fue posible publicar la categoría.'); }
  }
}
