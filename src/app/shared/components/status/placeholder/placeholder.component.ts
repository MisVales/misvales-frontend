import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-placeholder',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      
      <h2 class="text-3xl font-bold text-gray-800 mb-3 tracking-tight">
        Apartado: <span class="text-[#386641]">{{ pathName() }}</span>
      </h2>
      
      <p class="text-gray-500 text-lg max-w-lg mb-8">
        Este módulo de la plataforma aún se encuentra en etapa de desarrollo o configuración. Pronto estará disponible.
      </p>
      
      <button (click)="goBack()" class="px-6 py-3 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-xl shadow-sm transition-all flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Regresar al Inicio
      </button>
    </div>
  `
})
export class PlaceholderComponent {
  private router = inject(Router);

  // Parse path to show something readable
  pathName = computed(() => {
    const url = this.router.url;
    // e.g. /clientes/cartera -> clientes/cartera
    const segments = url.split('/').filter(s => s.length > 0);
    if (segments.length === 0) return 'Desconocido';
    
    // Capitalize and join
    return segments.map(s => s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' ')).join(' / ');
  });

  goBack() {
    this.router.navigate(['/']);
  }
}
