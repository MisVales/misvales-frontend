import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { SessionStore } from '../../../../core/session/session.store';
import { apiErrorMessage } from '../../../../core/api/api-error';
import { PermissionRes, RoleRes } from '../../data-access/admin.dtos';
import { RoleService } from '../../data-access/role.service';

@Component({
  selector: 'app-roles-permissions',
  templateUrl: './roles-permissions.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RolesPermissionsComponent implements OnInit {
  private readonly roleService = inject(RoleService);
  private readonly sessionStore = inject(SessionStore);

  readonly roles = signal<RoleRes[]>([]);
  readonly permissions = signal<PermissionRes[]>([]);
  readonly selectedRole = signal<RoleRes | null>(null);
  readonly selectedPermissionIds = signal<Set<string>>(new Set());
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly success = signal('');

  readonly canManage = computed(
    () => this.sessionStore.permissions().includes('roles.manage_permissions') || this.sessionStore.permissions().includes('all'),
  );
  readonly permissionsByModule = computed(() => {
    const groups = new Map<string, PermissionRes[]>();
    for (const permission of this.permissions()) {
      const group = groups.get(permission.module) ?? [];
      group.push(permission);
      groups.set(permission.module, group);
    }
    return Array.from(groups.entries()).map(([module, permissions]) => ({ module, permissions }));
  });

  async ngOnInit(): Promise<void> {
    try {
      const [roles, permissions] = await Promise.all([
        firstValueFrom(this.roleService.getRoles()),
        firstValueFrom(this.roleService.getPermissions()),
      ]);
      this.roles.set(roles);
      this.permissions.set(permissions);
      if (roles[0]) await this.selectRole(roles[0]);
    } catch (error: unknown) {
      this.error.set(apiErrorMessage(error, 'No fue posible cargar los roles y permisos.'));
    } finally {
      this.loading.set(false);
    }
  }

  async selectRole(role: RoleRes, preserveSuccess = false): Promise<void> {
    this.error.set('');
    if (!preserveSuccess) this.success.set('');
    try {
      const detail = await firstValueFrom(this.roleService.getRole(role.id));
      this.selectedRole.set(detail);
      this.selectedPermissionIds.set(new Set((detail.permissions ?? []).map((permission) => permission.id)));
    } catch (error: unknown) {
      this.error.set(apiErrorMessage(error, 'No fue posible cargar el rol seleccionado.'));
    }
  }

  togglePermission(permissionId: string, checked: boolean): void {
    if (!this.canEditSelectedRole()) return;
    this.selectedPermissionIds.update((current) => {
      const next = new Set(current);
      checked ? next.add(permissionId) : next.delete(permissionId);
      return next;
    });
  }

  onPermissionChange(permissionId: string, event: Event): void {
    const target = event.target;
    if (target instanceof HTMLInputElement) {
      this.togglePermission(permissionId, target.checked);
    }
  }

  canEditSelectedRole(): boolean {
    return this.canManage() && this.selectedRole()?.is_system === false;
  }

  async save(): Promise<void> {
    const role = this.selectedRole();
    if (!role || !this.canEditSelectedRole() || this.saving()) return;
    if (!window.confirm(`¿Confirmas la actualización de permisos para ${role.name}?`)) return;

    this.saving.set(true);
    this.error.set('');
    this.success.set('');
    try {
      const response = await firstValueFrom(
        this.roleService.updatePermissions(role.id, Array.from(this.selectedPermissionIds())),
      );
      await this.selectRole(role, true);
      this.success.set(response.message);
    } catch (error: unknown) {
      this.error.set(apiErrorMessage(error, 'No fue posible actualizar los permisos.'));
    } finally {
      this.saving.set(false);
    }
  }
}
