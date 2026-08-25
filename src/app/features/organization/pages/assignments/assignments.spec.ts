import { describe, expect, it } from 'vitest';
import { PersonnelAssignment } from '../../data-access/organization.dtos';
import { UserRes } from '../../../admin/data-access/admin.dtos';
import { personnelCandidates } from './assignments';

describe('personnelCandidates', () => {
  it('includes an active person whose last branch assignment was revoked with the same role', () => {
    const withdrawnUser: UserRes = {
      id: 'user-withdrawn', name: 'Azael Garcia', email: 'aza@gmail.com', state: 'ACTIVE', role_scopes: [],
    };

    const candidates = personnelCandidates([withdrawnUser], [assignment('REVOKED')]);

    expect(candidates).toEqual([{
      id: withdrawnUser.id,
      name: withdrawnUser.name,
      email: withdrawnUser.email,
      role: { id: 'cashier-role', code: 'cashier', name: 'Cajera' },
      isReactivation: true,
    }]);
  });

  it('does not offer blocked people or an active assignment as a reactivation', () => {
    const blockedUser: UserRes = {
      id: 'user-blocked', name: 'Usuario bloqueado', email: 'blocked@example.test', state: 'BLOCKED', role_scopes: [],
    };

    expect(personnelCandidates([blockedUser], [assignment('REVOKED', blockedUser)])).toEqual([]);
    expect(personnelCandidates([], [assignment('ACTIVE')])).toEqual([]);
    expect(personnelCandidates([], [assignment('REVOKED'), assignment('ACTIVE')])).toEqual([]);
  });
});

function assignment(
  assignmentStatus: PersonnelAssignment['assignment_status'],
  user: UserRes = { id: 'user-withdrawn', name: 'Azael Garcia', email: 'aza@gmail.com', state: 'ACTIVE', role_scopes: [] },
): PersonnelAssignment {
  return {
    assignment_id: 'assignment-1',
    user: { id: user.id, name: user.name, email: user.email, state: user.state },
    role: { id: 'cashier-role', code: 'cashier', name: 'Cajera' },
    branch_id: 'branch-1',
    scope: 'BRANCH',
    assignment_status: assignmentStatus,
    assigned_at: '2026-08-19T10:00:00-06:00',
    assignment_reason: 'Asignación inicial',
    revoked_at: assignmentStatus === 'REVOKED' ? '2026-08-19T11:00:00-06:00' : null,
    revocation_reason: assignmentStatus === 'REVOKED' ? 'Cambio de personal' : null,
  };
}
