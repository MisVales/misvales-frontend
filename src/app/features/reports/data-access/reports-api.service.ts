import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_CONFIG } from '@core/api/api.config';
import type { Page } from '@shared/types/pagination.types';

export interface BranchReportDelinquencyRow {
  distributor_number: string;
  distributor_name: string;
  branch_name: string;
  status: string;
  starts_at: string;
  overdue_relations: number;
  overdue_balance: string;
}

export interface BranchReportCutoffRow {
  cutoff_at: string;
  payment_deadline_at: string;
  branch_name: string;
  distributors: number;
  total_balance: string;
}

export interface BranchReportTrendPoint {
  period: string;
  points: number;
}

export interface BranchReportApplicationRow {
  application_number: string;
  applicant_name: string;
  branch_name: string;
  status: string;
  created_at: string;
}

export interface BranchReportsHome {
  generated_at: string;
  delinquency: {
    total: number;
    overdue_balance: string;
    rows: BranchReportDelinquencyRow[];
  };
  cutoffs: {
    total_balance: string;
    active_count: number;
    rows: BranchReportCutoffRow[];
  };
  points: {
    available_points: number;
    distributors: number;
    trend: BranchReportTrendPoint[];
  };
  applications: {
    total: number;
    pending: number;
    validated: number;
    rows: BranchReportApplicationRow[];
  };
}

@Injectable({ providedIn: 'root' })
export class ReportsApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  list(): Observable<string[]> {
    return this.http
      .get<{ data: string[] }>(`${this.config.baseUrl}/reports`)
      .pipe(map((response) => response.data));
  }

  home(): Observable<BranchReportsHome> {
    return this.http
      .get<{ data: BranchReportsHome }>(`${this.config.baseUrl}/reports/home`)
      .pipe(map((response) => response.data));
  }

  run(name: string, filters: Record<string, string>): Observable<Page<Record<string, unknown>>> {
    return this.http
      .get<{ data: Page<Record<string, unknown>> }>(`${this.config.baseUrl}/reports/${name}`, {
        params: filters,
      })
      .pipe(map((response) => response.data));
  }

  exportPointsBalance(cutoffAt: string): Observable<Blob> {
    const params: Record<string, string> = {};
    if (cutoffAt) params['cutoff_at'] = cutoffAt;
    return this.http.get(`${this.config.baseUrl}/reports/points-balance/export`, {
      params,
      responseType: 'blob',
    });
  }

  exportPreRequests(status: string, dateFrom: string, dateTo: string): Observable<Blob> {
    const params: Record<string, string> = {};
    if (status) params['status'] = status;
    if (dateFrom) params['date_from'] = dateFrom;
    if (dateTo) params['date_to'] = dateTo;
    return this.http.get(`${this.config.baseUrl}/reports/pre-requests/export`, {
      params,
      responseType: 'blob',
    });
  }
}
