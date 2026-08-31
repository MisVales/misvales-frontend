import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '@core/api/api.config';

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
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(API_CONFIG);

  upload(payload: UploadMediaPayload): Observable<MediaFileResponse> {
    const formData = new FormData();
    formData.append('file', payload.file);
    formData.append('owner_type', payload.owner_type);
    formData.append('owner_id', payload.owner_id);
    formData.append('purpose', payload.purpose);

    return this.http.post<MediaFileResponse>(`${this.apiConfig.baseUrl}/media`, formData, {
      headers: new HttpHeaders().set('Idempotency-Key', crypto.randomUUID()),
    });
  }

  download(mediaId: string): Observable<Blob> {
    return this.http.get(`${this.apiConfig.baseUrl}/media/${mediaId}/download`, {
      responseType: 'blob',
    });
  }

  preview(mediaId: string): Observable<Blob> {
    return this.http.get(`${this.apiConfig.baseUrl}/media/${mediaId}/preview`, {
      responseType: 'blob',
    });
  }
}
