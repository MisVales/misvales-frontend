import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PeriodosCanjeStore } from '../../estado/periodos-canje.store';
import { RouterModule } from '@angular/router';
import { PeriodosCanjeService } from '../../data-access/periodos-canje.service';
import { SessionStore } from '../../../../core/session/session.store';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-periodos-canje-lista',
  imports: [CommonModule, RouterModule],
  templateUrl: './periodos-canje-lista.component.html',
  styleUrls: ['./periodos-canje-lista.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeriodosCanjeListaComponent implements OnInit {
  protected readonly store = inject(PeriodosCanjeStore);
  private readonly api = inject(PeriodosCanjeService);
  protected readonly session = inject(SessionStore);

  ngOnInit(): void {
    this.store.listar();
  }

  async publicar(id: string, lockVersion: number) { const reason=window.prompt('Motivo obligatorio de publicación:')?.trim(); if(!reason)return; try{await firstValueFrom(this.api.publicar(id,lockVersion,reason));await this.store.listar();}catch(error:any){window.alert(error?.error?.message??'No fue posible publicar el periodo.');} }
  async cancelar(id: string, lockVersion: number) { const reason=window.prompt('Motivo obligatorio de cancelación:')?.trim(); if(!reason)return; try{await firstValueFrom(this.api.cancelar(id,lockVersion,reason));await this.store.listar();}catch(error:any){window.alert(error?.error?.message??'No fue posible cancelar el periodo.');} }
}
