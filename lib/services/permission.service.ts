import { prisma } from '@/lib/db';
import { z } from 'zod';

export const permissionSchema = z.object({
  name: z.string().min(1, 'Permission name is required'),
  description: z.string().optional(),
});

export const updatePermissionSchema = z.object({
  name: z.string().min(1, 'Permission name is required').optional(),
  description: z.string().optional(),
});

export class PermissionService {
  /**
   * Get all permissions
   */
  static async getAll() {
    return prisma.permission.findMany({
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * Get a permission by ID
   */
  static async getById(id: string) {
    return prisma.permission.findUnique({
      where: { id },
      include: {
        rolePermissions: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  /**
   * Create a new permission
   */
  static async create(data: z.infer<typeof permissionSchema>) {
    // Check if permission already exists
    const existing = await prisma.permission.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      throw new Error('Permission with this name already exists');
    }

    return prisma.permission.create({
      data: {
        name: data.name,
        description: data.description ?? null,
      },
    });
  }

  /**
   * Update a permission
   */
  static async update(id: string, data: z.infer<typeof updatePermissionSchema>) {
    // Check if permission exists
    const existing = await prisma.permission.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error('Permission not found');
    }

    // Check if name is being changed and if it conflicts
    if (data.name && data.name !== existing.name) {
      const nameConflict = await prisma.permission.findUnique({
        where: { name: data.name },
      });
      if (nameConflict) {
        throw new Error('Permission with this name already exists');
      }
    }

    return prisma.permission.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a permission
   */
  static async delete(id: string) {
    const permission = await prisma.permission.findUnique({
      where: { id },
    });

    if (!permission) {
      throw new Error('Permission not found');
    }

    await prisma.permission.delete({
      where: { id },
    });

    return { message: 'Permission deleted successfully' };
  }
}

