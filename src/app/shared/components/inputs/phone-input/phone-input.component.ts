import { Component, forwardRef, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  FormBuilder,
  FormGroup,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { NgSelectModule } from '@ng-select/ng-select';
import {
  CountryCode,
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
} from 'libphonenumber-js';

const regionNames =
  typeof Intl !== 'undefined' && Intl.DisplayNames
    ? new Intl.DisplayNames(['es'], { type: 'region' })
    : null;

function getFlagEmoji(countryCode: string): string {
  return countryCode
    .toUpperCase()
    .split('')
    .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join('');
}

export const DIAL_CODES = getCountries()
  .map((country: CountryCode) => {
    const callingCode = getCountryCallingCode(country);
    return {
      country,
      name: regionNames ? regionNames.of(country) : country,
      code: `+${callingCode}`,
      flag: getFlagEmoji(country),
    };
  })
  .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

const TOP_CODES = [
  DIAL_CODES.find((country) => country.country === 'MX'),
  DIAL_CODES.find((country) => country.country === 'US'),
].filter(Boolean) as typeof DIAL_CODES;
const OTHER_CODES = DIAL_CODES.filter(
  (country) => country.country !== 'MX' && country.country !== 'US',
);
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
      <input
        type="tel"
        formControlName="digits"
        maxlength="10"
        inputmode="numeric"
        autocomplete="tel-national"
        (blur)="onTouched()"
        placeholder="Número de teléfono"
        class="flex-1 rounded-lg border border-gray-300 p-2 text-sm focus:z-10 focus:border-[#386641] focus:outline-none focus:ring-1 focus:ring-[#386641] h-[42px]">
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PhoneInputComponent),
      multi: true,
    },
  ],
})
export class PhoneInputComponent implements ControlValueAccessor, OnInit, OnDestroy {
  readonly dialCodes = SORTED_DIAL_CODES;

  form: FormGroup;
  private sub?: Subscription;

  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      dialCode: ['+52', Validators.required],
      digits: ['', [Validators.required, Validators.maxLength(10), Validators.pattern(/^\d{10}$/)]],
    });
  }

  ngOnInit(): void {
    this.sub = this.form.valueChanges.subscribe((value) => {
      const originalDigits = String(value.digits ?? '');
      const cleanDigits = originalDigits.replace(/\D/g, '').slice(0, 10);

      if (cleanDigits !== originalDigits) {
        this.form.controls['digits'].setValue(cleanDigits, { emitEvent: false });
      }

      this.onChange(value.dialCode && cleanDigits ? value.dialCode + cleanDigits : '');
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  customSearchFn(term: string, item: any): boolean {
    const normalizedTerm = term.toLowerCase();
    const name = (item.name || '').toLowerCase();
    const code = (item.code || '').toLowerCase();
    const country = (item.country || '').toLowerCase();

    return (
      name.includes(normalizedTerm) ||
      code.includes(normalizedTerm) ||
      code.replace('+', '').includes(normalizedTerm) ||
      country.includes(normalizedTerm)
    );
  }

  writeValue(value: unknown): void {
    if (!value) {
      this.form.patchValue({ dialCode: '+52', digits: '' }, { emitEvent: false });
      return;
    }

    const rawValue = String(value);
    const rawDigits = rawValue.replace(/\D/g, '');
    const phoneNumber = parsePhoneNumberFromString(rawValue);
    const parsedDialCode = phoneNumber ? `+${phoneNumber.countryCallingCode}` : undefined;
    const detectedDialCode = parsedDialCode ?? this.dialCodes
      .filter((country) => rawDigits.startsWith(country.code.slice(1)))
      .sort((a, b) => b.code.length - a.code.length)[0]?.code;
    const dialCode = rawValue.startsWith('+') ? detectedDialCode : undefined;
    const dialCodeDigits = dialCode?.replace(/\D/g, '') ?? '';
    const nationalDigits = dialCode && rawDigits.startsWith(dialCodeDigits)
      ? rawDigits.slice(dialCodeDigits.length)
      : rawDigits;

    this.form.patchValue(
      {
        ...(dialCode ? { dialCode } : {}),
        // El prefijo internacional vive en el selector; el input sólo muestra
        // los diez dígitos nacionales, incluso si el valor llegó repetido.
        digits: nationalDigits.slice(-10),
      },
      { emitEvent: false },
    );
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.form.disable({ emitEvent: false });
    } else {
      this.form.enable({ emitEvent: false });
    }
  }
}
