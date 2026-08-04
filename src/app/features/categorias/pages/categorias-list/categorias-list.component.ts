import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoriasStore } from '../../estado/categorias.store';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-categorias-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './categorias-list.component.html',
  styleUrls: ['./categorias-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriasListComponent implements OnInit {
  protected readonly store = inject(CategoriasStore);

  ngOnInit(): void {
    this.store.cargarCategorias();
  }
}
