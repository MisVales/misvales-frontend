import { ConfirmationService } from './confirmation.service';

describe('ConfirmationService', () => {
  it('resolves an explicit user decision and clears the request', async () => {
    const service = new ConfirmationService();
    const decision = service.confirm({ title: 'Eliminar', message: 'No se puede deshacer.' });
    service.resolve(true);
    await expect(decision).resolves.toBe(true);
    expect(service.request()).toBeNull();
  });
});
