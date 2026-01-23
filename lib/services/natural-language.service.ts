import { RoleService } from './role.service';
import { PermissionService } from './permission.service';

export class NaturalLanguageService {
  /**
   * Process natural language command and execute RBAC operations
   */
  static async processCommand(command: string) {
    if (!command || typeof command !== 'string') {
      throw new Error('Command is required');
    }

    const lowerCommand = command.toLowerCase().trim();

    // Pattern: "Give the role 'X' the permission to 'Y'"
    const givePermissionMatch = lowerCommand.match(
      /give (?:the )?role ['"]([^'"]+)['"] (?:the )?permission (?:to )?['"]([^'"]+)['"]/i
    );

    if (givePermissionMatch) {
      const roleName = givePermissionMatch[1];
      const permissionName = givePermissionMatch[2];

      const allRoles = await RoleService.getAll();
      const role = allRoles.find(r => r.name.toLowerCase() === roleName.toLowerCase());

      if (!role) {
        throw new Error(`Role '${roleName}' not found`);
      }

      const allPermissions = await PermissionService.getAll();
      let permission = allPermissions.find(p => p.name.toLowerCase() === permissionName.toLowerCase());

      if (!permission) {
        // Create permission if it doesn't exist
        permission = await PermissionService.create({
          name: permissionName,
          description: undefined,
        });
      }

      // Get current permissions for the role
      const currentPermissions = await RoleService.getPermissions(role.id);
      const permissionIds = currentPermissions.map(p => p.id);

      // Add new permission if not already assigned
      if (!permissionIds.includes(permission.id)) {
        permissionIds.push(permission.id);
        await RoleService.assignPermissions(role.id, { permissionIds });
      }

      return {
        message: `Successfully assigned permission '${permissionName}' to role '${roleName}'`,
        role: role.name,
        permission: permission.name,
      };
    }

    // Pattern: "Create a new permission called 'X'"
    const createPermissionMatch = lowerCommand.match(
      /create (?:a )?(?:new )?permission (?:called )?['"]([^'"]+)['"]/i
    );

    if (createPermissionMatch) {
      const permissionName = createPermissionMatch[1];

      const allPermissions = await PermissionService.getAll();
      const existing = allPermissions.find(p => p.name.toLowerCase() === permissionName.toLowerCase());

      if (existing) {
        throw new Error(`Permission '${permissionName}' already exists`);
      }

      const permission = await PermissionService.create({
        name: permissionName,
        description: undefined,
      });

      return {
        message: `Successfully created permission '${permissionName}'`,
        permission: permission,
      };
    }

    // Pattern: "Create a new role called 'X'"
    const createRoleMatch = lowerCommand.match(
      /create (?:a )?(?:new )?role (?:called )?['"]([^'"]+)['"]/i
    );

    if (createRoleMatch) {
      const roleName = createRoleMatch[1];

      const allRoles = await RoleService.getAll();
      const existing = allRoles.find(r => r.name.toLowerCase() === roleName.toLowerCase());

      if (existing) {
        throw new Error(`Role '${roleName}' already exists`);
      }

      const role = await RoleService.create({ name: roleName });

      return {
        message: `Successfully created role '${roleName}'`,
        role: role,
      };
    }

    // Pattern: "Remove permission 'X' from role 'Y'"
    const removePermissionMatch = lowerCommand.match(
      /remove (?:the )?permission ['"]([^'"]+)['"] (?:from )?(?:the )?role ['"]([^'"]+)['"]/i
    );

    if (removePermissionMatch) {
      const permissionName = removePermissionMatch[1];
      const roleName = removePermissionMatch[2];

      const allRoles = await RoleService.getAll();
      const role = allRoles.find(r => r.name.toLowerCase() === roleName.toLowerCase());

      if (!role) {
        throw new Error(`Role '${roleName}' not found`);
      }

      const allPermissions = await PermissionService.getAll();
      const permission = allPermissions.find(p => p.name.toLowerCase() === permissionName.toLowerCase());

      if (!permission) {
        throw new Error(`Permission '${permissionName}' not found`);
      }

      // Get current permissions and remove the specified one
      const currentPermissions = await RoleService.getPermissions(role.id);
      const updatedPermissionIds = currentPermissions
        .filter(p => p.id !== permission.id)
        .map(p => p.id);

      await RoleService.assignPermissions(role.id, {
        permissionIds: updatedPermissionIds,
      });

      return {
        message: `Successfully removed permission '${permissionName}' from role '${roleName}'`,
      };
    }

    throw new Error(
      'Command not recognized. Supported commands:\n' +
        '- "Give the role \'X\' the permission to \'Y\'"\n' +
        '- "Create a new permission called \'X\'"\n' +
        '- "Create a new role called \'X\'"\n' +
        '- "Remove permission \'X\' from role \'Y\'"'
    );
  }
}

