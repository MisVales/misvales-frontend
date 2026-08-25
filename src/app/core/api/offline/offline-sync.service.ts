import { Injectable, inject } from '@angular/core';
import { openDB, IDBPDatabase } from 'idb';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AlertService } from '@shared/components/alerts/alert.service';

interface OfflineRequest {
  id?: number;
  url: string;
  method: string;
  body: any;
  headers: any;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class OfflineSyncService {
  private dbPromise: Promise<IDBPDatabase>;
  private http = inject(HttpClient);
  private alertService = inject(AlertService);
  private isOnline = navigator.onLine;

  constructor() {
    this.dbPromise = openDB('misvales-offline-db', 1, {
      upgrade(db: IDBPDatabase) {
        db.createObjectStore('requests', { keyPath: 'id', autoIncrement: true });
      }
    });

    window.addEventListener('online', () => {
      this.isOnline = true;
      this.alertService.showAlert('Conexión recuperada. Sincronizando datos pendientes...', 'success', 3000);
      this.syncPendingRequests();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.alertService.showAlert('Sin conexión. Trabajando en modo offline.', 'warning', 3000);
    });
  }

  async saveRequest(url: string, method: string, body: any, headers: any): Promise<void> {
    const db = await this.dbPromise;
    await db.add('requests', {
      url,
      method,
      body,
      headers,
      timestamp: Date.now()
    });
  }

  async syncPendingRequests(): Promise<void> {
    if (!this.isOnline) return;

    const db = await this.dbPromise;
    const requests = await db.getAll('requests') as OfflineRequest[];

    if (requests.length === 0) return;

    for (const req of requests) {
      try {
        let httpHeaders = new HttpHeaders();
        if (req.headers) {
          Object.keys(req.headers).forEach(key => {
            httpHeaders = httpHeaders.set(key, req.headers[key]);
          });
        }
        
        // Use firstValueFrom in Angular 17+ instead of toPromise
        const { firstValueFrom } = await import('rxjs');
        await firstValueFrom(this.http.request(req.method, req.url, {
          body: req.body,
          headers: httpHeaders
        }));
        
        await db.delete('requests', req.id!);
      } catch {}
    }
    
    this.alertService.showAlert('Sincronización completada exitosamente.', 'success', 3000);
  }
}
