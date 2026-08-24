import { Component, Input, Optional, Self } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-text-input',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mb-4">
      <label [for]="id" class="block text-sm font-medium text-gray-700 mb-1">
        {{ label }} <span *ngIf="required" class="text-red-500">*</span>
      </label>
      
      <input
        [id]="id"
        [type]="type"
        [disabled]="disabled"
        [placeholder]="placeholder"
        [attr.aria-invalid]="isInvalid()"
        [attr.aria-describedby]="isInvalid() ? id + '-error' : (hint ? id + '-hint' : null)"
        class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
        [ngClass]="{'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500': isInvalid()}"
        [value]="value"
        (input)="onInput($event)"
        (blur)="onBlur()"
      >
      
      <p *ngIf="hint && !isInvalid()" [id]="id + '-hint'" class="mt-1 text-sm text-gray-500">{{ hint }}</p>
      
      <p *ngIf="isInvalid()" [id]="id + '-error'" class="mt-1 text-sm text-red-600">
        {{ getErrorMessage() }}
      </p>
    </div>
  `
})
export class TextInputComponent implements ControlValueAccessor {
  @Input() id = `input-${Math.random().toString(36).substring(2, 9)}`;
  @Input() label = '';
  @Input() type = 'text';
  @Input() placeholder = '';
  @Input() hint = '';
  @Input() required = false;

  value: string = '';
  disabled = false;

  onChange: any = () => {};
  onTouch: any = () => {};

  constructor(@Optional() @Self() public ngControl: NgControl) {
    if (this.ngControl != null) {
      this.ngControl.valueAccessor = this;
    }
  }

  onInput(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.value = val;
    this.onChange(val);
  }

  onBlur() {
    this.onTouch();
  }

  writeValue(val: string): void {
    this.value = val || '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  isInvalid(): boolean {
    if (!this.ngControl || !this.ngControl.control) return false;
    const ctrl = this.ngControl.control;
    return (ctrl.invalid && ctrl.touched) || !!ctrl.errors?.['server'];
  }

  getErrorMessage(): string {
    if (!this.ngControl || !this.ngControl.control || !this.ngControl.control.errors) return '';
    const errors = this.ngControl.control.errors;
    
    if (errors['server']) {
      return errors['server'];
    }
    if (errors['required']) {
      return 'Este campo es obligatorio.';
    }
    if (errors['email']) {
      return 'El formato del correo electrónico no es válido.';
    }
    if (errors['minlength']) {
      return `Debe tener al menos ${errors['minlength'].requiredLength} caracteres.`;
    }
    
    return 'Valor inválido.';
  }
}
