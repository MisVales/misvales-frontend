import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PeriodosCanjeStore } from '../../estado/periodos-canje.store';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-periodos-canje-lista',
  imports: [CommonModule, RouterModule],
  templateUrl: './periodos-canje-lista.component.html',
  styleUrls: ['./periodos-canje-lista.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeriodosCanjeListaComponent implements OnInit {
  protected readonly store = inject(PeriodosCanjeStore);

  ngOnInit(): void {
    this.store.listar();
  }
}
