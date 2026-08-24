import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  forwardRef,
  Input,
  Output,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';

export type RefactorInputType = 'text' | 'email' | 'password' | 'search' | 'tel' | 'url' | 'number';
export type RefactorInputTone = 'default' | 'success' | 'neutral';
export type RefactorInputSize = 'compact' | 'default' | 'comfortable';

export interface RefactorInputValidationRule {
  label: string;
  test: (value: string) => boolean;
}

let nextInputId = 0;

@Component({
  selector: 'refactor-input',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './refactor-input.component.html',
  styleUrl: './refactor-input.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RefactorInputComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RefactorInputComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() hint = '';
  @Input() placeholder = '';
  @Input() type: RefactorInputType = 'text';
  @Input() multiline = false;
  @Input() rows = 4;
  @Input() maxTextareaHeight = 240;
  @Input() tone: RefactorInputTone = 'default';
  @Input() size: RefactorInputSize = 'default';
  @Input() leadingIcon = '';
  @Input() prefix = '';
  @Input() suffix = '';
  @Input() required = false;
  @Input() readonly = false;
  @Input('disabled') set disabledInput(disabled: boolean) {
    this.isDisabled.set(disabled);
  }
  @Input() clearable = false;
  @Input() revealPassword = true;
  @Input() effects = true;
  @Input() invalid = false;
  @Input() errorMessage = '';
  @Input() validationTitle = 'Requisitos del campo';
  @Input() validationRules: readonly RefactorInputValidationRule[] = [];
  @Input() maxLength: number | null = null;
  @Input() min: number | null = null;
  @Input() max: number | null = null;
  @Input() step: number | string | null = null;
  @Input() autocomplete = '';
  @Input() inputmode = '';
  @Input() ariaLabel = '';
  @Output() readonly valueChange = new EventEmitter<string>();
  @Output() readonly blurred = new EventEmitter<FocusEvent>();

  protected readonly value = signal('');
  protected readonly isDisabled = signal(false);
  protected readonly focused = signal(false);
  protected readonly passwordVisible = signal(false);
  protected readonly validationOpen = signal(false);
  protected readonly controlId = `refactor-input-${++nextInputId}`;

  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  protected get resolvedType(): RefactorInputType {
    return this.type === 'password' && this.passwordVisible() ? 'text' : this.type;
  }

  protected get describedBy(): string | null {
    const ids: string[] = [];
    if (this.invalid && this.errorMessage) ids.push(`${this.controlId}-error`);
    else if (this.hint) ids.push(`${this.controlId}-hint`);
    if (this.validationRules.length) ids.push(`${this.controlId}-requirements`);
    return ids.length ? ids.join(' ') : null;
  }

  protected isRuleMet(rule: RefactorInputValidationRule): boolean {
    return rule.test(this.value());
  }

  protected get allRulesMet(): boolean {
    return (
      this.validationRules.length > 0 && this.validationRules.every((rule) => this.isRuleMet(rule))
    );
  }

  protected update(event: Event): void {
    const nextValue = (event.target as HTMLInputElement | HTMLTextAreaElement).value;
    this.value.set(nextValue);
    this.onChange(nextValue);
    this.valueChange.emit(nextValue);
  }

  protected clear(): void {
    if (this.isDisabled() || this.readonly) return;
    this.value.set('');
    this.onChange('');
    this.valueChange.emit('');
  }

  protected togglePassword(): void {
    this.passwordVisible.update((visible) => !visible);
  }

  protected handleFocus(): void {
    this.focused.set(true);
  }

  protected handleBlur(event: FocusEvent): void {
    this.focused.set(false);
    this.onTouched();
    this.blurred.emit(event);
  }

  writeValue(value: string | number | null): void {
    this.value.set(value == null ? '' : String(value));
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.isDisabled.set(disabled);
  }
}
