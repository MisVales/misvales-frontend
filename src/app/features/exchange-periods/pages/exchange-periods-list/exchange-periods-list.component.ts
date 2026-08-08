import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PeriodosCanjeStore } from '../../state/exchange-periods.store';
import { Router } from '@angular/router';

@Component({
  selector: 'app-exchange-periods-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './exchange-periods-list.component.html',
  styleUrls: ['./exchange-periods-list.component.css']
})
export class PeriodosListaComponent implements OnInit {
  protected store = inject(PeriodosCanjeStore);
  private router = inject(Router);

  ngOnInit() {
    this.store.listar();
  }

  goToForm() {
    this.router.navigate(['/periodos-canje/nuevo']);
  }
}
