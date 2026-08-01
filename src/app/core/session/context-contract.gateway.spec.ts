import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import {
  AUTH_CONTEXT_CONTRACT_UNAVAILABLE,
  ContextContractGateway,
} from './context-contract.gateway';

describe('ContextContractGateway', () => {
  it('fails closed without requesting a response whose Resource is not published', async () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    const http = TestBed.inject(HttpTestingController);
    const gateway = TestBed.inject(ContextContractGateway);

    const result = firstValueFrom(gateway.load());

    http.expectNone('/api/v1/auth/context');
    await expect(result).rejects.toThrow(AUTH_CONTEXT_CONTRACT_UNAVAILABLE);
    http.verify();
  });
});
