import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoriasStore } from '../../estado/categorias.store';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-categorias-lista',
  imports: [CommonModule, RouterModule],
  templateUrl: './categorias-lista.component.html',
  styleUrls: ['./categorias-lista.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriasListaComponent implements OnInit {
  protected readonly store = inject(CategoriasStore);

  ngOnInit(): void {
    this.store.listar();
  }
}
