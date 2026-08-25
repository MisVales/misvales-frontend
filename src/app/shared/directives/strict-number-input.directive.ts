import { Directive, ElementRef, HostListener, inject } from '@angular/core';

/** Blocks exponent and signed values in native numeric inputs. */
@Directive({ selector: 'input[appStrictNumber]', standalone: true })
export class StrictNumberInputDirective {
  private readonly elementRef = inject<ElementRef<HTMLInputElement>>(ElementRef);

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (this.isNumericInput() && ['e', 'E', '+', '-'].includes(event.key)) event.preventDefault();
  }

  @HostListener('input')
  onInput(): void {
    if (!this.isNumericInput()) return;
    const input = this.elementRef.nativeElement;
    const cleanValue = input.value.replace(/[eE+\-]/g, '');
    if (cleanValue !== input.value) {
      input.value = cleanValue;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  private isNumericInput(): boolean {
    return this.elementRef.nativeElement.type === 'number';
  }
}
