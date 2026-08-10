import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../api/api.config';

export interface State {
  id: number;
  name: string;
}

export interface Municipality {
  id: number;
  estado_id: number;
  name: string;
}

export interface Colony {
  id: number;
  codigo_postal_id: number;
  name: string;
  settlement_type: string | null;
}

export interface ZipCodeInfo {
  estado: State;
  municipio: Municipality;
  colonias: Colony[];
  codigo_postal: {
    id: number;
    code: string;
    municipio_id: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AddressApiService {
  private http = inject(HttpClient);
  private config = inject(API_CONFIG);
  private apiUrl = `${this.config.baseUrl}/address`;

  getStates(): Observable<State[]> {
    return this.http.get<State[]>(`${this.apiUrl}/states`);
  }

  getMunicipalities(stateId: number): Observable<Municipality[]> {
    return this.http.get<Municipality[]>(`${this.apiUrl}/states/${stateId}/municipalities`);
  }

  getInfoByZipCode(code: string): Observable<ZipCodeInfo> {
    return this.http.get<ZipCodeInfo>(`${this.apiUrl}/zip-codes/${code}`);
  }

  autocomplete(text: string, city: string, state: string, postcode: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/autocomplete`, {
      text, city, state, postcode
    });
  }

  geocode(street: string, number: string, neighborhood: string, postcode: string, city: string, state: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/geocode`, {
      street, number, neighborhood, postcode, city, state
    });
  }
}
