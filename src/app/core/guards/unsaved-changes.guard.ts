import { Injectable } from '@angular/core';
import { CanDeactivate, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

export interface CanComponentDeactivate {
  /**
   * Return true if the component can deactivate (no unsaved changes),
   * or false to block navigation. It can also return an Observable/Promise.
   */
  canDeactivate: () => Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree;
}

@Injectable({
  providedIn: 'root'
})
export class UnsavedChangesGuard implements CanDeactivate<CanComponentDeactivate> {
  canDeactivate(
    component: CanComponentDeactivate
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    // Si el componente tiene la interfaz implementada, la consultamos
    if (component.canDeactivate) {
      const canDeactivate = component.canDeactivate();
      
      // Manejo simplificado: si la respuesta es sincrónica y es false, advertimos.
      // Un componente real conectaría esto con un ModalService que retorna Observable<boolean>.
      if (canDeactivate === false) {
        return confirm('Tienes cambios que todavía no han podido guardarse.\n\n¿Deseas salir de esta página?');
      }
      return canDeactivate;
    }
    
    return true;
  }
}
