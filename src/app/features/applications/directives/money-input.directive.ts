import { Directive, ElementRef, forwardRef, HostListener, Renderer2 } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Muestra miles con coma, pero conserva en el control el decimal canónico que
 * espera la API (por ejemplo, la vista muestra 50,000.50 y el formulario guarda
 * 50000.50).
 */
@Directive({
  selector: 'input[appMoneyInput]',
  standalone: true,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => MoneyInputDirective),
    multi: true,
  }],
})
export class MoneyInputDirective implements ControlValueAccessor {
  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  constructor(
    private readonly elementRef: ElementRef<HTMLInputElement>,
    private readonly renderer: Renderer2,
  ) {}

  writeValue(value: unknown): void {
    this.setDisplayedValue(formatMoneyValue(normalizeMoneyValue(value)));
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.renderer.setProperty(this.elementRef.nativeElement, 'disabled', isDisabled);
  }

  @HostListener('input')
  handleInput(): void {
    const rawValue = normalizeMoneyValue(this.elementRef.nativeElement.value);
    this.setDisplayedValue(formatMoneyValue(rawValue));
    this.onChange(rawValue);
  }

  @HostListener('blur')
  handleBlur(): void {
    const rawValue = normalizeMoneyValue(this.elementRef.nativeElement.value);
    const normalizedValue = rawValue.endsWith('.') ? rawValue.slice(0, -1) : rawValue;
    this.setDisplayedValue(formatMoneyValue(normalizedValue));
    this.onChange(normalizedValue);
    this.onTouched();
  }

  private setDisplayedValue(value: string): void {
    this.renderer.setProperty(this.elementRef.nativeElement, 'value', value);
  }
}

export function normalizeMoneyValue(value: unknown): string {
  const rawValue = String(value ?? '').replaceAll(',', '').trim();
  const isNegative = rawValue.startsWith('-');
  const digitsAndDecimal = rawValue.replace(/[^\d.]/g, '');
  const [integerPart = '', ...decimalParts] = digitsAndDecimal.split('.');
  const hasDecimal = decimalParts.length > 0;
  let normalized = `${isNegative ? '-' : ''}${integerPart}${hasDecimal ? `.${decimalParts.join('')}` : ''}`;

  if (normalized.startsWith('.')) normalized = `0${normalized}`;
  if (normalized.startsWith('-.')) normalized = `-0${normalized.slice(1)}`;

  return normalized;
}

export function formatMoneyValue(value: string): string {
  if (value === '') return '';

  if (!/^-?\d*(\.\d*)?$/.test(value)) {
    return value;
  }

  const negative = value.startsWith('-');
  const unsignedValue = negative ? value.slice(1) : value;
  const [integerPart, decimalPart] = unsignedValue.split('.', 2);
  const groupedInteger = (integerPart || '0').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const decimalSuffix = unsignedValue.includes('.') ? `.${decimalPart ?? ''}` : '';

  return `${negative ? '-' : ''}${groupedInteger}${decimalSuffix}`;
}
