import { AfterViewInit, Directive, DoCheck, ElementRef, inject, Input, OnDestroy, Renderer2 } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';

/**
 * Da el mismo estado visual a los controles de las secciones de solicitud.
 * El mensaje sigue siendo responsabilidad de app-input-error, pero ningún
 * campo inválido queda sin un borde rojo al intentar abandonar la sección.
 */
@Directive({
  selector: '[appApplicationFormErrorState]',
  standalone: true,
})
export class ApplicationFormErrorStateDirective implements AfterViewInit, DoCheck, OnDestroy {
  @Input({ required: true }) appApplicationFormErrorState!: FormGroup;

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);
  private observer?: MutationObserver;

  ngAfterViewInit(): void {
    this.observer = new MutationObserver(() => this.updateControlStates());
    this.observer.observe(this.host.nativeElement, { childList: true, subtree: true });
    this.updateControlStates();
  }

  ngDoCheck(): void {
    this.updateControlStates();
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  private updateControlStates(): void {
    if (!this.appApplicationFormErrorState) return;

    this.host.nativeElement.querySelectorAll<HTMLElement>('[formControlName]').forEach((element) => {
      // Dirección mantiene su propio FormGroup; sus controles no pertenecen
      // al formulario de domicilio que hospeda esta directiva.
      if (element.closest('app-address-form')) return;

      const controlName = element.getAttribute('formControlName');
      const control = controlName === null ? null : this.appApplicationFormErrorState.get(controlName);
      const invalid = this.shouldShowInvalidState(control);

      if (invalid) {
        this.renderer.addClass(element, 'app-application-control-invalid');
        this.renderer.setAttribute(element, 'aria-invalid', 'true');
      } else {
        this.renderer.removeClass(element, 'app-application-control-invalid');
        this.renderer.removeAttribute(element, 'aria-invalid');
      }
    });
  }

  private shouldShowInvalidState(control: AbstractControl | null): boolean {
    return !!control && control.invalid && control.touched;
  }
}
