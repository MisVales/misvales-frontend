import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-incrementos-linea-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="page-shell">
      <p class="eyebrow">Distribuidoras</p>
      <h1>Incrementos de línea</h1>
      <p class="lead">Pantalla base creada para sostener el enlace del sidebar mientras se implementa el módulo completo.</p>
    </section>
  `,
  styles: [`
    .page-shell { padding: 24px; }
    .eyebrow { text-transform: uppercase; letter-spacing: .08em; font-size: 12px; opacity: .7; margin-bottom: 8px; }
    h1 { margin: 0 0 12px; font-size: 28px; }
    .lead { max-width: 720px; line-height: 1.6; }
  `],
})
export class IncrementosLineaPageComponent {}