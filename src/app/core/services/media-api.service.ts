import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { defaultApiConfig } from '../api/api.config';

export interface UploadMediaPayload {
  file: File;
  owner_type: string;
  owner_id: string;
  purpose: string;
}

export interface MediaFileResponse {
  data: {
    id: string;
    file_type: string;
    original_name: string;
    mime_type: string;
    size_bytes: number;
    validation_status: string;
  }
}

@Injectable({
  providedIn: 'root'
})
export class MediaApiService {
  private http = inject(HttpClient);
  private apiUrl = defaultApiConfig.baseUrl;

  upload(payload: UploadMediaPayload): Observable<MediaFileResponse> {
    const formData = new FormData();
    formData.append('file', payload.file);
    formData.append('owner_type', payload.owner_type);
    formData.append('owner_id', payload.owner_id);
    formData.append('purpose', payload.purpose);

    return this.http.post<MediaFileResponse>(`${this.apiUrl}/media`, formData, {
      headers: new HttpHeaders().set('Idempotency-Key', crypto.randomUUID()),
    });
  }
}
