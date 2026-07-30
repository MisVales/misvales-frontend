import { Directive, effect, ElementRef, inject, input, Renderer2 } from '@angular/core';

import { SessionStore } from '@core/session/session.store';

export type PermissionPresentation = 'disable' | 'hide';

@Directive({
  selector: '[mvPermission]',
})
export class PermissionDirective {
  readonly permission = input.required<string>({ alias: 'mvPermission' });
  readonly presentation = input<PermissionPresentation>('hide', {
    alias: 'mvPermissionPresentation',
  });

  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly session = inject(SessionStore);

  constructor() {
    effect(() => {
      const granted = this.session.hasPermission(this.permission());
      const element = this.element.nativeElement;

      if (this.presentation() === 'hide') {
        this.renderer.setProperty(element, 'hidden', !granted);
        return;
      }

      this.renderer.setProperty(element, 'disabled', !granted);
      this.renderer.setAttribute(element, 'aria-disabled', String(!granted));
    });
  }
}
