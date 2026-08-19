import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AddressApiService } from '../../../core/services/address-api';
import { AddressFormComponent } from './address-form';

describe('AddressFormComponent suggestion semantics', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders each street suggestion as a native button', () => {
    TestBed.configureTestingModule({
      imports: [AddressFormComponent],
      providers: [
        {
          provide: AddressApiService,
          useValue: {
            getStates: () => of([]),
            getMunicipalities: () => of([]),
            getInfoByZipCode: () => of(null),
            autocomplete: () => of(null),
            geocode: () => of(null),
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(AddressFormComponent);
    fixture.componentInstance.streetSuggestions = [
      { properties: { formatted: 'Avenida Central', street: 'Avenida Central' } },
    ];

    fixture.detectChanges();

    const option = fixture.nativeElement.querySelector('li button') as HTMLButtonElement;
    expect(option).toBeTruthy();
    expect(option.type).toBe('button');
    expect(option.textContent).toContain('Avenida Central');

    option.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.streetSuggestions).toEqual([]);
  });

  it('allows a manual street without querying suggestions when autocomplete is disabled', async () => {
    vi.useFakeTimers();
    const autocomplete = vi.fn(() => of({ features: [] }));

    TestBed.configureTestingModule({
      imports: [AddressFormComponent],
      providers: [
        {
          provide: AddressApiService,
          useValue: {
            getStates: () => of([]),
            getMunicipalities: () => of([]),
            getInfoByZipCode: () => of(null),
            autocomplete,
            geocode: () => of(null),
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(AddressFormComponent);
    fixture.componentInstance.enableStreetAutocomplete = false;
    fixture.detectChanges();

    const street = fixture.componentInstance.form.controls['street'];
    street.enable();
    street.setValue('Calle Manual');
    await vi.advanceTimersByTimeAsync(700);

    expect(autocomplete).not.toHaveBeenCalled();
    expect(fixture.componentInstance.streetSuggestions).toEqual([]);
  });

  it('synchronizes a manual street when catalog values are temporarily unavailable', () => {
    TestBed.configureTestingModule({
      imports: [AddressFormComponent],
      providers: [
        {
          provide: AddressApiService,
          useValue: {
            getStates: () => of([]),
            getMunicipalities: () => of([]),
            getInfoByZipCode: () => of(null),
            autocomplete: () => of(null),
            geocode: () => of(null),
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(AddressFormComponent);
    fixture.componentInstance.initialAddress = {
      street: 'Calle Original',
      exterior_number: '10',
      neighborhood: 'Centro',
      zip_code: '27000',
      municipality: 'Torreón',
      city: 'Torreón',
      state: 'Coahuila',
      country: 'MX',
    };
    const changes: any[] = [];
    fixture.componentInstance.addressChange.subscribe((address) => changes.push(address));
    fixture.detectChanges();

    fixture.componentInstance.form.controls['street'].setValue('Calle Manual');
    fixture.componentInstance.validarAntesDeSalir();

    expect(changes.at(-1)).toMatchObject({
      street: 'Calle Manual',
      neighborhood: 'Centro',
      city: 'Torreón',
      state: 'Coahuila',
    });
  });

  it('shows the required message as soon as an empty field receives focus', () => {
    TestBed.configureTestingModule({
      imports: [AddressFormComponent],
      providers: [{
        provide: AddressApiService,
        useValue: {
          getStates: () => of([]), getMunicipalities: () => of([]), getInfoByZipCode: () => of(null),
          autocomplete: () => of(null), geocode: () => of(null),
        },
      }],
    });
    const fixture = TestBed.createComponent(AddressFormComponent);
    fixture.detectChanges();

    fixture.componentInstance.marcarCampoAlEnfocar('zipCode');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('El código postal es obligatorio.');
  });
});
