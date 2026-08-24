import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_CONFIG } from '../../../core/api/api.config';

export interface PointsBalanceSummary {
  account_id?: string;
  distributor_id?: string;
  distributor_number?: string;
  distributor_name?: string;
  balance: number;
  reserved: number;
  available_points: number;
  point_value: string;
  money_equivalent: string;
  total_money_equivalent: string;
}

export interface PointRedemptionRequestItem {
  id: string;
  point_account_id: string;
  distributor_id: string;
  points: number;
  point_value_snapshot: string;
  total_amount: string;
  status: 'REQUESTED' | 'AUTHORIZED' | 'REJECTED' | 'DELIVERED' | 'CANCELLED';
  balance_before?: number | null;
  balance_after?: number | null;
  requested_by: string;
  requested_at: string;
  authorized_by?: string | null;
  authorized_at?: string | null;
  rejection_reason?: string | null;
  delivered_by?: string | null;
  delivered_at?: string | null;
  delivery_notes?: string | null;
  distribuidora?: {
    id: string;
    distributor_number?: string;
    usuario?: {
      id: string;
      name: string;
      email: string;
    };
    sucursal?: {
      id: string;
      name: string;
    };
  };
  solicitante?: {
    id: string;
    name: string;
  };
  autorizador?: {
    id: string;
    name: string;
  };
  entregador?: {
    id: string;
    name: string;
  };
}

export interface RedemptionsFilterParams {
  status?: string;
  search?: string;
  per_page?: number;
}

@Injectable({ providedIn: 'root' })
export class PuntosApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  getBalance(distributorId?: string): Observable<PointsBalanceSummary> {
    const params: Record<string, string> = {};
    if (distributorId) params['distributor_id'] = distributorId;

    return this.http
      .get<{ data: PointsBalanceSummary }>(`${this.config.baseUrl}/points/balance`, { params })
      .pipe(map((r) => r.data));
  }

  getRedemptions(filters?: RedemptionsFilterParams): Observable<PointRedemptionRequestItem[]> {
    const params: Record<string, string> = {};
    if (filters?.status) params['status'] = filters.status;
    if (filters?.search) params['search'] = filters.search;
    if (filters?.per_page) params['per_page'] = String(filters.per_page);

    return this.http
      .get<{ data: { data: PointRedemptionRequestItem[] } }>(`${this.config.baseUrl}/points/redemptions`, { params })
      .pipe(map((r) => r.data.data));
  }

  requestRedemption(points: number, distributorId?: string): Observable<PointRedemptionRequestItem> {
    const body: { points: number; distributor_id?: string } = { points };
    if (distributorId) body.distributor_id = distributorId;

    return this.http
      .post<{ data: PointRedemptionRequestItem }>(`${this.config.baseUrl}/points/redemptions`, body)
      .pipe(map((r) => r.data));
  }

  authorizeRedemption(id: string): Observable<PointRedemptionRequestItem> {
    return this.http
      .post<{ data: PointRedemptionRequestItem }>(`${this.config.baseUrl}/points/redemptions/${id}/authorize`, {})
      .pipe(map((r) => r.data));
  }

  rejectRedemption(id: string, rejectionReason: string): Observable<PointRedemptionRequestItem> {
    return this.http
      .post<{ data: PointRedemptionRequestItem }>(`${this.config.baseUrl}/points/redemptions/${id}/reject`, {
        rejection_reason: rejectionReason,
      })
      .pipe(map((r) => r.data));
  }

  deliverRedemption(id: string, deliveryNotes?: string): Observable<PointRedemptionRequestItem> {
    return this.http
      .post<{ data: PointRedemptionRequestItem }>(`${this.config.baseUrl}/points/redemptions/${id}/deliver`, {
        delivery_notes: deliveryNotes,
      })
      .pipe(map((r) => r.data));
  }
}
