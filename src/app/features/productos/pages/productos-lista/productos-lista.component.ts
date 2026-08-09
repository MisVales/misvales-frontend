import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductosStore } from '../../estado/productos.store';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-productos-lista',
  imports: [CommonModule, RouterModule],
  templateUrl: './productos-lista.component.html',
  styleUrls: ['./productos-lista.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductosListaComponent implements OnInit {
  protected readonly store = inject(ProductosStore);

  ngOnInit(): void {
    this.store.listar();
  }
}
