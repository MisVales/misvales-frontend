import { TestBed } from '@angular/core/testing';
import { TurnstileService } from './turnstile.service';
import { signal } from '@angular/core';
import { AuthConfigurationService } from '../data-access/auth-configuration.service';

describe('TurnstileService', () => {
  let service: TurnstileService;
  const turnstileConfiguration = signal({ enabled: false, siteKey: '' });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TurnstileService,
        {
          provide: AuthConfigurationService,
          useValue: { turnstileConfiguration },
        },
      ]
    });
    service = TestBed.inject(TurnstileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should report isEnabled as false when disabled by runtime configuration', () => {
    turnstileConfiguration.set({ enabled: false, siteKey: '' });
    expect(service.isEnabled).toBe(false);
  });

  it('should reject loadScript immediately when disabled without touching DOM', async () => {
    turnstileConfiguration.set({ enabled: false, siteKey: '' });
    await expect(service.loadScript()).rejects.toThrow('Turnstile is disabled');
    const script = document.querySelector('script[src*="challenges.cloudflare.com"]');
    expect(script).toBeNull();
  });
});
