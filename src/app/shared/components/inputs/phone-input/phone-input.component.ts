import { Component, forwardRef, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormBuilder, FormGroup, NG_VALUE_ACCESSOR, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { NgSelectModule } from '@ng-select/ng-select';
import { getCountries, getCountryCallingCode, parsePhoneNumberFromString, CountryCode } from 'libphonenumber-js';

const regionNames = typeof Intl !== 'undefined' && Intl.DisplayNames 
  ? new Intl.DisplayNames(['es'], {type: 'region'}) 
  : null;

function getFlagEmoji(countryCode: string) {
  return countryCode
    .toUpperCase()
    .split('')
    .map(char => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join('');
}

export const DIAL_CODES = getCountries().map((country: CountryCode) => {
  const callingCode = getCountryCallingCode(country);
  return {
    country,
    name: regionNames ? regionNames.of(country) : country,
    code: `+${callingCode}`,
    flag: getFlagEmoji(country)
  };
}).sort((a, b) => (a.name || '').localeCompare(b.name || ''));

// Colocar México y Estados Unidos primero
const TOP_CODES = [
  DIAL_CODES.find(c => c.country === 'MX'),
  DIAL_CODES.find(c => c.country === 'US')
].filter(Boolean) as typeof DIAL_CODES;
const OTHER_CODES = DIAL_CODES.filter(c => c.country !== 'MX' && c.country !== 'US');
export const SORTED_DIAL_CODES = [...TOP_CODES, ...OTHER_CODES];

@Component({
  selector: 'app-phone-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule],
  template: `
    <div class="flex gap-2" [formGroup]="form">
      <ng-select 
        formControlName="dialCode" 
        [items]="dialCodes" 
        bindValue="code"
        [searchable]="true"
        [searchFn]="customSearchFn"
        [clearable]="false"
        placeholder="Código"
        class="w-[120px] custom-ng-select"
        (blur)="onTouched()">
        <ng-template ng-label-tmp let-item="item">
          <span [title]="item.name">{{ item.flag }} {{ item.code }}</span>
        </ng-template>
        <ng-template ng-option-tmp let-item="item">
          <span [title]="item.name">{{ item.flag }} {{ item.code }}</span>
        </ng-template>
      </ng-select>
      <input type="tel" formControlName="digits" (blur)="onTouched()" placeholder="Número de teléfono" class="flex-1 rounded-lg border border-gray-300 p-2 text-sm focus:outline-none focus:border-[#386641] focus:ring-1 focus:ring-[#386641] focus:z-10 h-[42px]">
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PhoneInputComponent),
      multi: true
    }
  ]
})
export class PhoneInputComponent implements ControlValueAccessor, OnInit, OnDestroy {
  readonly dialCodes = SORTED_DIAL_CODES;
  
  form: FormGroup;
  private sub?: Subscription;

  onChange: any = () => {};
  onTouched: any = () => {};

  customSearchFn(term: string, item: any) {
    term = term.toLowerCase();
    const name = (item.name || '').toLowerCase();
    const code = (item.code || '').toLowerCase();
    const country = (item.country || '').toLowerCase();
    // Allow matching +52, 52, mx, mex, mexico
    return name.includes(term) || code.includes(term) || code.replace('+', '').includes(term) || country.includes(term);
  }

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      dialCode: ['+52', Validators.required],
      digits: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.sub = this.form.valueChanges.subscribe(val => {
      // Remove spaces or hyphens from digits before emitting
      const cleanDigits = (val.digits || '').replace(/\D/g, '');
      if (val.dialCode && cleanDigits) {
        this.onChange(val.dialCode + cleanDigits);
      } else {
        this.onChange(cleanDigits ? val.dialCode + cleanDigits : '');
      }
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  writeValue(value: any): void {
    if (!value) {
      this.form.patchValue({ dialCode: '+52', digits: '' }, { emitEvent: false });
      return;
    }
    
    // Parse using libphonenumber-js
    const phoneNumber = parsePhoneNumberFromString(String(value));
    if (phoneNumber) {
      this.form.patchValue({ 
        dialCode: `+${phoneNumber.countryCallingCode}`, 
        digits: phoneNumber.nationalNumber 
      }, { emitEvent: false });
    } else {
      const str = String(value);
      const match = str.match(/^(\+\d{1,4})(\d+)$/);
      if (match) {
        this.form.patchValue({ dialCode: match[1], digits: match[2] }, { emitEvent: false });
      } else {
        this.form.patchValue({ digits: str }, { emitEvent: false });
      }
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    if (isDisabled) {
      this.form.disable({ emitEvent: false });
    } else {
      this.form.enable({ emitEvent: false });
    }
  }
}
