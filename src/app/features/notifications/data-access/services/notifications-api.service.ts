import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { internalApiContext } from '@core/api/api-request.context';
import { toHttpParams } from '@core/api/query-params.util';

import {
  NotificationContractCollectionResponse,
  NotificationContractResourceResponse,
  NotificationStatus,
} from '../dtos/notification-contracts.dto';

@Injectable({ providedIn: 'root' })
export class NotificationsApiService {
  private readonly http = inject(HttpClient);

  list(status: NotificationStatus): Observable<NotificationContractCollectionResponse> {
    return this.http.get<NotificationContractCollectionResponse>('/notifications', {
      context: internalApiContext(),
      params: toHttpParams({ status }),
    });
  }

  markRead(notificationId: string): Observable<NotificationContractResourceResponse> {
    return this.http.post<NotificationContractResourceResponse>(
      `/notifications/${encodeURIComponent(notificationId)}/read`,
      {},
      { context: internalApiContext() },
    );
  }
}
