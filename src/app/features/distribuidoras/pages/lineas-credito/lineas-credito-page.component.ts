import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-lineas-credito-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="page-shell">
      <p class="eyebrow">Distribuidoras</p>
      <h1>Líneas de crédito</h1>
      <p class="lead">Esta pantalla todavía no tiene lógica funcional. La ruta ya está montada para que el sidebar no apunte a un vacío.</p>
    </section>
  `,
  styles: [`
    .page-shell { padding: 24px; }
    .eyebrow { text-transform: uppercase; letter-spacing: .08em; font-size: 12px; opacity: .7; margin-bottom: 8px; }
    h1 { margin: 0 0 12px; font-size: 28px; }
    .lead { max-width: 720px; line-height: 1.6; }
  `],
})
export class LineasCreditoPageComponent {}