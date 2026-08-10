import { Component, OnInit, inject, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AddressApiService, State, Municipality, Colony } from '../../../core/services/address-api';
import { debounceTime, distinctUntilChanged, Subject, takeUntil, switchMap, of, filter, tap } from 'rxjs';
import * as L from 'leaflet';

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
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './address-form.html',
  styleUrls: ['./address-form.css']
})
export class AddressFormComponent implements OnInit, OnDestroy {
  @Input() initialAddress?: Partial<AddressResult>;
  @Output() addressChange = new EventEmitter<AddressResult>();

  private fb = inject(FormBuilder);
  private addressApi = inject(AddressApiService);
  private destroy$ = new Subject<void>();

  form: FormGroup = this.fb.group({
    state: [null, Validators.required],
    municipality: [{ value: null, disabled: true }, Validators.required],
    zipCode: ['', [Validators.required, Validators.pattern(/^[0-9]{5}$/)]],
    colony: [{ value: null, disabled: true }, Validators.required],
    street: ['', Validators.required],
    exteriorNumber: ['', Validators.required],
    interiorNumber: ['']
  });

  states: State[] = [];
  municipalities: Municipality[] = [];
  colonies: Colony[] = [];
  streetSuggestions: any[] = [];
  
  private map: L.Map | undefined;
  private marker: L.Marker | undefined;

  ngOnInit() {
    this.loadStates();
    this.setupListeners();
    this.initMap();
    if (this.initialAddress) {
      // TODO: logic to patch initial address if necessary
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap() {
    // Leaflet icon fix
    const iconRetinaUrl = 'assets/marker-icon-2x.png';
    const iconUrl = 'assets/marker-icon.png';
    const shadowUrl = 'assets/marker-shadow.png';
    const iconDefault = L.icon({
      iconRetinaUrl,
      iconUrl,
      shadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41]
    });
    L.Marker.prototype.options.icon = iconDefault;

    // We init the map on Mexico center by default
    setTimeout(() => {
      this.map = L.map('leaflet-map').setView([23.6345, -102.5528], 5);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(this.map);
    }, 100);
  }

  private loadStates() {
    this.addressApi.getStates().subscribe(states => {
      this.states = states;
    });
  }

  private setupListeners() {
    // State change -> load municipalities
    this.form.get('state')?.valueChanges.pipe(
      takeUntil(this.destroy$),
      distinctUntilChanged()
    ).subscribe(stateId => {
      this.form.get('municipality')?.setValue(null);
      this.form.get('colony')?.setValue(null);
      this.colonies = [];
      if (stateId) {
        this.form.get('municipality')?.enable();
        this.addressApi.getMunicipalities(stateId).subscribe(m => this.municipalities = m);
      } else {
        this.form.get('municipality')?.disable();
      }
      this.emitChange();
    });

    // ZIP Code change -> lookup info
    this.form.get('zipCode')?.valueChanges.pipe(
      takeUntil(this.destroy$),
      debounceTime(500),
      distinctUntilChanged(),
      filter(cp => cp && cp.length === 5)
    ).subscribe(cp => {
      this.addressApi.getInfoByZipCode(cp).subscribe({
        next: (info) => {
          this.colonies = info.colonias;
          this.form.get('colony')?.enable();
          
          // Auto select state and municipality if possible
          if (info.estado) {
             this.form.get('state')?.setValue(info.estado.id, { emitEvent: false });
             this.addressApi.getMunicipalities(info.estado.id).subscribe(m => {
                this.municipalities = m;
                if (info.municipio) {
                   this.form.get('municipality')?.enable();
                   this.form.get('municipality')?.setValue(info.municipio.id, { emitEvent: false });
                }
             });
          }
        },
        error: () => {
          this.colonies = [];
          this.form.get('colony')?.disable();
        }
      });
    });

    // Street Autocomplete
    this.form.get('street')?.valueChanges.pipe(
      takeUntil(this.destroy$),
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(text => {
        if (!text || text.length < 3) {
          this.streetSuggestions = [];
          return of(null);
        }
        const state = this.states.find(s => s.id === this.form.value.state)?.name || '';
        const city = this.municipalities.find(m => m.id === this.form.value.municipality)?.name || '';
        const cp = this.form.value.zipCode || '';
        if (!state || !city) return of(null);
        return this.addressApi.autocomplete(text, city, state, cp);
      })
    ).subscribe(res => {
      if (res && res.features) {
        this.streetSuggestions = res.features;
      }
    });

    // All form changes trigger geocoding when valid
    this.form.valueChanges.pipe(
      takeUntil(this.destroy$),
      debounceTime(800)
    ).subscribe(() => {
      this.emitChange();
      this.tryGeocode();
    });
  }

  selectSuggestion(feature: any) {
    const streetName = feature.properties.street || feature.properties.name || feature.properties.formatted;
    this.form.patchValue({ street: streetName });
    this.streetSuggestions = [];
  }

  private tryGeocode() {
    if (this.form.invalid) return;

    const val = this.form.value;
    const state = this.states.find(s => s.id === val.state)?.name || '';
    const city = this.municipalities.find(m => m.id === val.municipality)?.name || '';
    const colony = this.colonies.find(c => c.id === val.colony)?.name || '';

    this.addressApi.geocode(val.street, val.exteriorNumber, colony, val.zipCode, city, state).subscribe(res => {
      if (res && res.features && res.features.length > 0) {
        const coords = res.features[0].geometry.coordinates; // [lon, lat]
        const lat = coords[1];
        const lng = coords[0];
        
        if (this.map) {
          this.map.setView([lat, lng], 16);
          if (this.marker) {
            this.marker.setLatLng([lat, lng]);
          } else {
            this.marker = L.marker([lat, lng]).addTo(this.map);
          }
        }
        
        // Emite con coordenadas
        this.emitChange(lat, lng);
      }
    });
  }

  private emitChange(lat?: number, lng?: number) {
    if (this.form.invalid) {
      return;
    }
    const val = this.form.value;
    const stateName = this.states.find(s => s.id === val.state)?.name || '';
    const cityName = this.municipalities.find(m => m.id === val.municipality)?.name || '';
    const colonyName = this.colonies.find(c => c.id === val.colony)?.name || '';

    const full_address = `${val.street} ${val.exteriorNumber}, ${colonyName}, ${val.zipCode} ${cityName}, ${stateName}`;

    this.addressChange.emit({
      full_address,
      street: val.street,
      exterior_number: val.exteriorNumber,
      interior_number: val.interiorNumber,
      neighborhood: colonyName,
      zip_code: val.zipCode,
      municipality: cityName,
      city: cityName,
      state: stateName,
      country: 'Mexico',
      lat,
      lng
    });
  }
}
