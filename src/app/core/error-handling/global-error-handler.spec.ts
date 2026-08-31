import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AlertService } from '../../shared/components/alerts/alert.service';
import { GlobalErrorHandler } from './global-error-handler';

describe('GlobalErrorHandler', () => {
  const alertService = { showAlert: vi.fn() };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GlobalErrorHandler, { provide: AlertService, useValue: alertService }],
    });
    alertService.showAlert.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    TestBed.resetTestingModule();
  });

  it('registra un resumen técnico seguro de los errores de renderizado', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    TestBed.inject(GlobalErrorHandler).handleError(new Error('NG0303 render failure'));

    expect(consoleError).toHaveBeenCalledWith('[MisVales GlobalError]', {
      name: 'Error',
      message: 'NG0303 render failure',
      stack: expect.any(String),
    });
    expect(alertService.showAlert).not.toHaveBeenCalled();
  });
});
