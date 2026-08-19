import { Component, OnInit, inject, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { AddressApiService, State, Municipality, Colony } from '../../../core/services/address-api';
import { InputErrorComponent } from '../../ui/input-error/input-error.component';
import { catchError, debounceTime, distinctUntilChanged, Subject, takeUntil, switchMap, of, filter, tap } from 'rxjs';

export interface AddressResult {
  full_address: string;
  street: string;
  exterior_number: string;
  interior_number?: string;
  neighborhood: string;
  zip_code: string;
  municipality: string;
  city: string;
  state: string;
  country: string;
  lat?: number;
  lng?: number;
}

@Component({
  selector: 'app-address-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule, InputErrorComponent],
  templateUrl: './address-form.html',
  styleUrls: ['./address-form.css']
})
export class AddressFormComponent implements OnInit, OnDestroy {
  @Input() initialAddress?: Partial<AddressResult>;
  @Input() showValidationState = false;
  @Input() enableStreetAutocomplete = true;
  @Output() addressChange = new EventEmitter<AddressResult>();

  private fb = inject(FormBuilder);
  private addressApi = inject(AddressApiService);
  private destroy$ = new Subject<void>();

  form: FormGroup = this.fb.group({
    state: [null, Validators.required],
    municipality: [{ value: null, disabled: true }, Validators.required],
    zipCode: ['', [Validators.required, Validators.pattern(/^[0-9]{5}$/)]],
    colony: [{ value: null, disabled: true }, Validators.required],
    street: [{ value: '', disabled: true }, Validators.required],
    exteriorNumber: [{ value: '', disabled: true }, Validators.required],
    interiorNumber: [{ value: '', disabled: true }]
  });

  states: State[] = [];
  municipalities: Municipality[] = [];
  colonies: Colony[] = [];
  streetSuggestions: any[] = [];
  private visibleErrorFields = new Set<string>();
  private pendingColonyName: string | null = null;
  
  ngOnInit() {
    this.loadStates();
    this.setupListeners();
    if (this.initialAddress) {
      // Patch simple text fields
      this.form.patchValue({
        street: this.initialAddress.street || '',
        exteriorNumber: this.initialAddress.exterior_number || '',
        interiorNumber: this.initialAddress.interior_number || ''
      }, { emitEvent: false });

      // Un domicilio ya guardado debe seguir siendo editable aunque el
      // catálogo de código postal tarde o no esté disponible.
      this.form.get('street')?.enable({ emitEvent: false });
      this.form.get('exteriorNumber')?.enable({ emitEvent: false });
      this.form.get('interiorNumber')?.enable({ emitEvent: false });
      
      if (this.initialAddress.zip_code && this.initialAddress.zip_code.length === 5) {
        this.pendingColonyName = this.initialAddress.neighborhood || null;
        // Dispara la misma carga de catálogo que se usa al capturar un CP.
        this.form.get('zipCode')?.setValue(this.initialAddress.zip_code);
      }
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadStates() {
    this.addressApi.getStates().subscribe(states => {
      this.states = states;
    });
  }

  private isSelectingSuggestion = false;

  private setupListeners() {
    // State change -> load municipalities
    this.form.get('state')?.valueChanges.pipe(
      takeUntil(this.destroy$),
      distinctUntilChanged()
    ).subscribe(stateId => {
      this.form.get('municipality')?.setValue(null);
      if (stateId) {
        this.form.get('municipality')?.enable();
        this.addressApi.getMunicipalities(stateId).subscribe(m => this.municipalities = m);
      } else {
        this.form.get('municipality')?.disable();
      }
      this.emitChange();
    });

    // Municipality change -> clear zip code and colonies
    this.form.get('municipality')?.valueChanges.pipe(
      takeUntil(this.destroy$),
      distinctUntilChanged()
    ).subscribe(muniId => {
      this.form.get('zipCode')?.setValue('', { emitEvent: false });
      this.resetLowerFields();
      this.emitChange();
    });

    // ZIP Code change -> lookup info
    this.form.get('zipCode')?.valueChanges.pipe(
      takeUntil(this.destroy$),
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(cp => {
      if (cp && cp.length === 5) {
        this.addressApi.getInfoByZipCode(cp).subscribe({
          next: (info) => {
            if (!info) {
              this.conservarDireccionInicialSinCatalogo();
              return;
            }

            this.colonies = info.colonias;
            this.form.get('colony')?.enable({ emitEvent: false });
            this.form.get('street')?.enable({ emitEvent: false });
            this.form.get('exteriorNumber')?.enable({ emitEvent: false });
            this.form.get('interiorNumber')?.enable({ emitEvent: false });
            
            // Auto select state and municipality if possible
            if (info.estado) {
               this.form.get('state')?.setValue(info.estado.id, { emitEvent: false });
               this.addressApi.getMunicipalities(info.estado.id).subscribe(m => {
                  this.municipalities = m;
                  if (info.municipio) {
                     this.form.get('municipality')?.enable({ emitEvent: false });
                     this.form.get('municipality')?.setValue(info.municipio.id, { emitEvent: false });
                  }
               });
            }

            if (this.pendingColonyName) {
              const pendingStr = this.pendingColonyName.toLowerCase().trim();
              const matched = this.colonies.find(c => c.name.toLowerCase().trim().includes(pendingStr) || pendingStr.includes(c.name.toLowerCase().trim()));
              if (matched) {
                this.form.get('colony')?.setValue(matched.id);
              }
              this.pendingColonyName = null;
            }
          },
          error: () => {
            this.conservarDireccionInicialSinCatalogo();
          }
        });
      } else if (!cp || cp.length < 5) {
        this.resetLowerFields();
      }
    });

    // Street Autocomplete
    this.form.get('street')?.valueChanges.pipe(
      takeUntil(this.destroy$),
      debounceTime(600),
      distinctUntilChanged(),
      switchMap(text => {
        if (!text || text.length < 3 || this.isSelectingSuggestion || !this.enableStreetAutocomplete) {
          this.streetSuggestions = [];
          return of(null);
        }
        
        const val = this.form.getRawValue();
        const state = val.state ? (this.states.find(s => s.id === val.state)?.name || '') : '';
        const city = val.municipality ? (this.municipalities.find(m => m.id === val.municipality)?.name || '') : '';
        const cp = val.zipCode || '';

        if (!state || !city || !cp) {
          this.streetSuggestions = [];
          return of(null);
        }
        
        return this.addressApi.autocomplete(text, city, state, cp).pipe(
          catchError(() => of(null))
        );
      })
    ).subscribe(res => {
      if (this.isSelectingSuggestion) {
        this.streetSuggestions = [];
        return;
      }
      if (res && res.features) {
        this.streetSuggestions = res.features;
      } else {
        this.streetSuggestions = [];
      }
    });

    // Form changes emit address info without geocoding
    this.form.valueChanges.pipe(
      takeUntil(this.destroy$),
      debounceTime(400)
    ).subscribe(() => {
      this.emitChange();
    });
  }

  onStreetBlur() {
    setTimeout(() => {
      this.streetSuggestions = [];
    }, 250);
  }

  private resetLowerFields() {
    this.colonies = [];
    this.form.get('colony')?.setValue(null);
    this.form.get('colony')?.disable();
    this.form.get('street')?.disable();
    this.form.get('exteriorNumber')?.disable();
    this.form.get('interiorNumber')?.disable();
  }

  private conservarDireccionInicialSinCatalogo(): void {
    if (!this.initialAddress) {
      this.resetLowerFields();
      return;
    }

    this.form.get('street')?.enable({ emitEvent: false });
    this.form.get('exteriorNumber')?.enable({ emitEvent: false });
    this.form.get('interiorNumber')?.enable({ emitEvent: false });
  }

  selectSuggestion(feature: any) {
    this.isSelectingSuggestion = true;
    this.streetSuggestions = [];
    const props = feature.properties;
    const streetName = props.street || props.name || props.formatted;
    const postcode = props.postcode;
    const neighborhood = props.neighborhood || props.suburb;

    this.form.patchValue({ street: streetName }, { emitEvent: false });
    this.emitChange();
    
    if (postcode && postcode.length === 5) {
      this.pendingColonyName = neighborhood || null;
      this.form.patchValue({ zipCode: postcode });
    }

    setTimeout(() => {
      this.isSelectingSuggestion = false;
      this.streetSuggestions = [];
    }, 400);
  }

  public async geocode(): Promise<{ lat: number, lng: number } | null> {
    if (this.form.invalid) return null;

    const val = this.form.value;
    const state = this.states.find(s => s.id === val.state)?.name || '';
    const city = this.municipalities.find(m => m.id === val.municipality)?.name || '';
    const colony = this.colonies.find(c => c.id === val.colony)?.name || '';

    if (!colony) return null; // Prevenir el error "neighborhood required"

    try {
      const res = await this.addressApi.geocode(val.street, val.exteriorNumber, colony, val.zipCode, city, state).toPromise();
      if (res && res.features && res.features.length > 0) {
        const coords = res.features[0].geometry.coordinates; // [lon, lat]
        return { lat: coords[1], lng: coords[0] };
      }
    } catch (e) {
      console.error('Error al geocodificar:', e);
    }
    
    return null;
  }

  validarAntesDeSalir(): boolean {
    this.form.markAllAsTouched();
    this.emitChange();
    return this.form.valid;
  }

  mostrarError(campo: string): boolean {
    const control = this.form.get(campo);
    return !!control && control.invalid && (
      (this.showValidationState && control.touched)
      || this.visibleErrorFields.has(campo)
    );
  }

  marcarCampoAlEnfocar(campo: string): void {
    this.visibleErrorFields.add(campo);
    this.form.get(campo)?.markAsTouched();
  }

  mostrarMensajeError(campo: string): boolean {
    const control = this.form.get(campo);
    return !!control && control.invalid && this.visibleErrorFields.has(campo);
  }

  private emitChange(lat?: number, lng?: number) {
    const rawVal = this.form.getRawValue();
    const val = rawVal;
    const stateName = this.states.find(s => s.id === val.state)?.name
      || (typeof val.state === 'string' ? val.state : this.initialAddress?.state || '');
    const cityName = this.municipalities.find(m => m.id === val.municipality)?.name
      || (typeof val.municipality === 'string' ? val.municipality : this.initialAddress?.city || this.initialAddress?.municipality || '');
    const colonyName = this.colonies.find(c => c.id === val.colony)?.name
      || (typeof val.colony === 'string' ? val.colony : this.initialAddress?.neighborhood || '');

    const full_address = `${val.street || ''} ${val.exteriorNumber || ''}, ${colonyName}, ${val.zipCode || ''} ${cityName}, ${stateName}`;

    this.addressChange.emit({
      full_address,
      street: val.street || '',
      exterior_number: val.exteriorNumber || '',
      interior_number: val.interiorNumber || '',
      neighborhood: colonyName,
      zip_code: val.zipCode || '',
      municipality: cityName,
      city: cityName,
      state: stateName,
      country: this.initialAddress?.country || 'MX',
      lat,
      lng
    });
  }
}
