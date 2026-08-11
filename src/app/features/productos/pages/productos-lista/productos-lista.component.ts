import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductosStore } from '../../estado/productos.store';
import { RouterModule } from '@angular/router';
import { ProductosService } from '../../data-access/productos.service';
import { SessionStore } from '../../../../core/session/session.store';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-productos-lista',
  imports: [CommonModule, RouterModule],
  templateUrl: './productos-lista.component.html',
  styleUrls: ['./productos-lista.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductosListaComponent implements OnInit {
  protected readonly store = inject(ProductosStore);
  private readonly api = inject(ProductosService);
  protected readonly session = inject(SessionStore);

  ngOnInit(): void {
    this.store.listar();
  }

  async publicar(versionId: string, lockVersion: number) {
    const reason = window.prompt('Motivo obligatorio de publicación:')?.trim(); if (!reason) return;
    try { await firstValueFrom(this.api.publicarVersion(versionId, lockVersion, reason)); await this.store.listar(); }
    catch (error: any) { window.alert(error?.error?.message ?? 'No fue posible publicar el producto.'); }
  }
}
