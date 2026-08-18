import { TestBed } from '@angular/core/testing';
import { TurnstileService } from './turnstile.service';
import { environment } from '../../../environments/environment';

describe('TurnstileService', () => {
  let service: TurnstileService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TurnstileService]
    });
    service = TestBed.inject(TurnstileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should report isEnabled as false when turnstileSiteKey is empty', () => {
    (environment as any).turnstileSiteKey = '';
    expect(service.isEnabled).toBe(false);
  });

  it('should reject loadScript immediately when disabled without touching DOM', async () => {
    (environment as any).turnstileSiteKey = '';
    await expect(service.loadScript()).rejects.toThrow('Turnstile is disabled');
    const script = document.querySelector('script[src*="challenges.cloudflare.com"]');
    expect(script).toBeNull();
  });
});
