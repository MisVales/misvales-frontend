import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { AddressApiService } from '../../../core/services/address-api';
import { AddressFormComponent } from './address-form';

describe('AddressFormComponent suggestion semantics', () => {
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
});
