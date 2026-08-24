import { describe, expect, it } from 'vitest';
import { StatusLabelPipe } from './status-label.pipe';

describe('StatusLabelPipe', () => {
  const pipe = new StatusLabelPipe();

  it('translates assignment lifecycle states into Spanish', () => {
    expect(pipe.transform('ACTIVE')).toBe('Vigente');
    expect(pipe.transform('REVOKED')).toBe('Retirada');
    expect(pipe.transform('ENDED')).toBe('Finalizada');
  });

  it('keeps unknown states readable without exposing underscores', () => {
    expect(pipe.transform('CUSTOM_STATUS')).toBe('Estado no disponible');
  });

  it('translates an overdue relation as vencida', () => {
    expect(pipe.transform('OVERDUE')).toBe('Vencida');
    expect(pipe.transform('ROLLED_FORWARD')).toBe('Vencida');
  });
});
