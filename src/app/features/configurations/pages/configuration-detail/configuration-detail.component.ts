import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-configuration-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './configuration-detail.component.html',
  styleUrls: ['./configuration-detail.component.css']
})
export class ConfiguracionDetalleComponent {
  // Conexión al Store en el futuro
}
