import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductosStore } from '../../estado/productos.store';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-productos-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './productos-list.component.html',
  styleUrls: ['./productos-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductosListComponent implements OnInit {
  protected readonly store = inject(ProductosStore);

  ngOnInit(): void {
    this.store.cargarProductos();
  }
}
