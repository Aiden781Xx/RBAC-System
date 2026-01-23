import { prisma } from '@/lib/db';
import { z } from 'zod';

export const roleSchema = z.object({
  name: z.string().min(1, 'Role name is required'),
});

export const updateRoleSchema = z.object({
  name: z.string().min(1, 'Role name is required').optional(),
});

export const assignPermissionsSchema = z.object({
  permissionIds: z.array(z.string()).min(1, 'At least one permission is required'),
});

export class RoleService {
  /**
   * Get all roles with their permissions
   */
  static async getAll() {
    return prisma.role.findMany({
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * Get a role by ID with its permissions
   */
  static async getById(id: string) {
    return prisma.role.findUnique({
      where: { id },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  /**
   * Create a new role
   */
  static async create(data: z.infer<typeof roleSchema>) {
    // Check if role already exists
    const existing = await prisma.role.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      throw new Error('Role with this name already exists');
    }

    return prisma.role.create({
      data: { name: data.name },
    });
  }

  /**
   * Update a role
   */
  static async update(id: string, data: z.infer<typeof updateRoleSchema>) {
    // Check if role exists
    const existing = await prisma.role.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error('Role not found');
    }

    // Check if name is being changed and if it conflicts
    if (data.name && data.name !== existing.name) {
      const nameConflict = await prisma.role.findUnique({
        where: { name: data.name },
      });
      if (nameConflict) {
        throw new Error('Role with this name already exists');
      }
    }

    return prisma.role.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a role
   */
  static async delete(id: string) {
    const role = await prisma.role.findUnique({
      where: { id },
    });

    if (!role) {
      throw new Error('Role not found');
    }

    await prisma.role.delete({
      where: { id },
    });

    return { message: 'Role deleted successfully' };
  }

  /**
   * Get permissions for a role
   */
  static async getPermissions(roleId: string) {
    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!role) {
      throw new Error('Role not found');
    }

    return role.rolePermissions.map(rp => rp.permission);
  }

  /**
   * Assign permissions to a role (replaces existing)
   */
  static async assignPermissions(
    roleId: string,
    data: z.infer<typeof assignPermissionsSchema>
  ) {
    // Verify role exists
    const role = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new Error('Role not found');
    }

    // Verify all permissions exist
    const permissions = await prisma.permission.findMany({
      where: { id: { in: data.permissionIds } },
    });

    if (permissions.length !== data.permissionIds.length) {
      throw new Error('One or more permissions not found');
    }

    // Delete existing role-permission relationships
    await prisma.rolePermission.deleteMany({
      where: { role_id: roleId },
    });

    // Create new role-permission relationships
    await prisma.rolePermission.createMany({
      data: data.permissionIds.map(permissionId => ({
        role_id: roleId,
        permission_id: permissionId,
      })),
    });

    return this.getById(roleId);
  }
}

