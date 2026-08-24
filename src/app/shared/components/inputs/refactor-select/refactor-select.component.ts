import {
  ChangeDetectionStrategy,
  AfterContentInit,
  booleanAttribute,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostListener,
  inject,
  Input,
  OnDestroy,
  Output,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';

export interface RefactorSelectOption {
  value: string | number | boolean | null;
  label: string;
  description?: string;
  icon?: string;
  tone?: RefactorSelectOptionTone;
  disabled?: boolean;
}

export type RefactorSelectTone = 'default' | 'success' | 'neutral';
export type RefactorSelectSize = 'compact' | 'default' | 'comfortable';
export type RefactorSelectOptionTone = 'green' | 'orange' | 'blue' | 'red' | 'purple' | 'gray';

let nextId = 0;

@Component({
  selector: 'refactor-select',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './refactor-select.component.html',
  styleUrl: './refactor-select.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RefactorSelectComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RefactorSelectComponent implements ControlValueAccessor, AfterContentInit, OnDestroy {
  @Input() label = '';
  @Input() hint = '';
  @Input() placeholder = 'Selecciona una opción';
  @Input() options: readonly RefactorSelectOption[] = [];
  @Input() tone: RefactorSelectTone = 'default';
  @Input() size: RefactorSelectSize = 'default';
  @Input() leadingIcon = '';
  @Input({ transform: booleanAttribute }) required = false;
  @Input() clearable = false;
  @Input() effects = true;
  @Input() invalid = false;
  @Input() errorMessage = '';
  @Input() ariaLabel = '';
  @Input() readOnly = false;
  @Input('value') set boundValue(value: string | number | null | undefined) {
    this.writeValue(value == null ? null : String(value));
  }
  @Input('disabled') set disabledInput(value: boolean) {
    this.setDisabledState(value);
  }
  @Output() readonly valueChange = new EventEmitter<RefactorSelectOption['value']>();

  protected readonly open = signal(false);
  protected readonly value = signal<RefactorSelectOption['value']>(null);
  protected readonly projectedOptions = signal<readonly RefactorSelectOption[]>([]);
  protected readonly disabled = signal(false);
  protected activeIndex = -1;
  protected readonly controlId = `refactor-select-${++nextId}`;
  private readonly host = inject(ElementRef<HTMLElement>);
  private optionObserver?: MutationObserver;

  private onChange: (value: RefactorSelectOption['value']) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  protected get selectedOption(): RefactorSelectOption | undefined {
    return this.resolvedOptions.find((option) => option.value === this.value());
  }

  protected get resolvedOptions(): readonly RefactorSelectOption[] {
    return this.options.length ? this.options : this.projectedOptions();
  }

  protected get resolvedPlaceholder(): string {
    return (
      this.resolvedOptions.find((option) => option.disabled && option.value === '')?.label ??
      this.placeholder
    );
  }

  protected toggle(): void {
    if (this.disabled()) return;
    this.open.update((isOpen) => !isOpen);
    if (this.open()) this.activeIndex = this.initialActiveIndex();
    else this.onTouched();
  }

  protected select(option: RefactorSelectOption): void {
    if (option.disabled) return;
    this.setValue(option.value);
    this.open.set(false);
    this.onTouched();
  }

  protected clear(event: MouseEvent): void {
    event.stopPropagation();
    this.setValue(null);
    this.onTouched();
  }

  protected handleKeydown(event: KeyboardEvent): void {
    if (this.disabled()) return;

    if (event.key === 'Escape') {
      this.open.set(false);
      this.onTouched();
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!this.open()) return this.toggle();
      const option = this.resolvedOptions[this.activeIndex];
      if (option) this.select(option);
      return;
    }

    if (
      event.key !== 'ArrowDown' &&
      event.key !== 'ArrowUp' &&
      event.key !== 'Home' &&
      event.key !== 'End'
    )
      return;
    event.preventDefault();
    if (!this.open()) this.open.set(true);
    this.moveActive(event.key);
  }

  protected forwardFocus(): void {
    this.host.nativeElement.dispatchEvent(new Event('focus'));
  }

  protected optionId(index: number): string {
    return `${this.controlId}-option-${index}`;
  }

  writeValue(value: RefactorSelectOption['value']): void {
    this.value.set(value ?? null);
    this.setHostValue(value ?? '');
  }

  registerOnChange(fn: (value: RefactorSelectOption['value']) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.disabled.set(disabled);
    if (disabled) this.open.set(false);
  }

  ngAfterContentInit(): void {
    this.refreshProjectedOptions();
    const optionContainer = this.host.nativeElement.querySelector('.native-options');
    if (!optionContainer || typeof MutationObserver === 'undefined') return;

    this.optionObserver = new MutationObserver(() => this.refreshProjectedOptions());
    this.optionObserver.observe(optionContainer, {
      attributes: true,
      childList: true,
      characterData: true,
      subtree: true,
    });
  }

  ngOnDestroy(): void {
    this.optionObserver?.disconnect();
  }

  @HostListener('document:click', ['$event'])
  protected closeOnOutsideClick(event: Event): void {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.open.set(false);
      this.onTouched();
    }
  }

  private setValue(value: RefactorSelectOption['value']): void {
    this.value.set(value);
    this.setHostValue(value ?? '');
    this.onChange(value);
    this.valueChange.emit(value);
    this.host.nativeElement.dispatchEvent(new Event('change', { bubbles: true }));
  }

  private initialActiveIndex(): number {
    const selected = this.resolvedOptions.findIndex(
      (option) => option.value === this.value() && !option.disabled,
    );
    return selected >= 0 ? selected : this.resolvedOptions.findIndex((option) => !option.disabled);
  }

  private moveActive(key: string): void {
    const enabled = this.resolvedOptions
      .map((option, index) => ({ option, index }))
      .filter(({ option }) => !option.disabled)
      .map(({ index }) => index);
    if (!enabled.length) return;
    if (key === 'Home') return void (this.activeIndex = enabled[0]);
    if (key === 'End') return void (this.activeIndex = enabled.at(-1) ?? enabled[0]);
    const current = enabled.indexOf(this.activeIndex);
    const delta = key === 'ArrowDown' ? 1 : -1;
    this.activeIndex = enabled[(current + delta + enabled.length) % enabled.length];
  }

  private refreshProjectedOptions(): void {
    if (this.options.length) return;
    const optionElements = Array.from(
      (this.host.nativeElement as HTMLElement).querySelectorAll('option'),
    ) as HTMLOptionElement[];
    const options = optionElements.map((option) => {
      const valueType = option.dataset['refactorValueType'];
      const value =
        valueType === 'boolean'
          ? option.value === 'true'
          : valueType === 'number'
            ? Number(option.value)
            : valueType === 'null'
              ? null
              : option.value;
      return {
        value,
        label: option.textContent?.trim() || option.value,
        disabled: option.disabled,
      };
    });
    this.projectedOptions.set(options);
  }

  private setHostValue(value: RefactorSelectOption['value']): void {
    Object.defineProperty(this.host.nativeElement, 'value', {
      configurable: true,
      value,
      writable: true,
    });
  }
}
