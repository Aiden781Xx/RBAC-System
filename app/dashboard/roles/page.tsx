'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Plus, Edit, Trash2, Key } from 'lucide-react';
import { getToken, getAuthHeaders } from '@/lib/auth-client';

interface Role {
  id: string;
  name: string;
  created_at: string;
  rolePermissions: Array<{
    permission: {
      id: string;
      name: string;
    };
  }>;
}

export default function RolesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({ name: '' });
  const [permissions, setPermissions] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }
    fetchRoles();
    fetchPermissions();
  }, [router]);

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/roles', {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setRoles(data);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch roles',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await fetch('/api/permissions', {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setPermissions(data);
      }
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingRole
        ? `/api/roles/${editingRole.id}`
        : '/api/roles';
      const method = editingRole ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ name: formData.name }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: editingRole
            ? 'Role updated successfully'
            : 'Role created successfully',
        });
        setIsDialogOpen(false);
        setEditingRole(null);
        setFormData({ name: '' });
        fetchRoles();
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Operation failed',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setFormData({ name: role.name });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return;

    try {
      const response = await fetch(`/api/roles/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Role deleted successfully',
        });
        fetchRoles();
      } else {
        const data = await response.json();
        toast({
          title: 'Error',
          description: data.error || 'Failed to delete role',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  const openPermissionDialog = (role: Role) => {
    setSelectedRole(role);
    setSelectedPermissions(role.rolePermissions.map(rp => rp.permission.id));
    setIsPermissionDialogOpen(true);
  };

  const handlePermissionSubmit = async () => {
    if (!selectedRole) return;

    try {
      const response = await fetch(`/api/roles/${selectedRole.id}/permissions`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ permissionIds: selectedPermissions }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Permissions updated successfully',
        });
        setIsPermissionDialogOpen(false);
        fetchRoles();
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to update permissions',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  const openCreateDialog = () => {
    setEditingRole(null);
    setFormData({ name: '' });
    setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Roles</h1>
              <p className="text-muted-foreground">
                Manage application roles and their permissions
              </p>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Create Role
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingRole ? 'Edit Role' : 'Create Role'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingRole
                      ? 'Update the role name'
                      : 'Add a new role to the system'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="e.g., Administrator"
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingRole ? 'Update' : 'Create'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center">Loading...</div>
            ) : roles.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No roles found. Create your first role!
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">
                        {role.name}
                      </TableCell>
                      <TableCell>
                        {role.rolePermissions.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {role.rolePermissions.map((rp) => (
                              <span
                                key={rp.permission.id}
                                className="px-2 py-1 bg-primary/10 text-primary rounded text-xs"
                              >
                                {rp.permission.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            No permissions
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(role.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openPermissionDialog(role)}
                            title="Manage Permissions"
                          >
                            <Key className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(role)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(role.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={isPermissionDialogOpen} onOpenChange={setIsPermissionDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Manage Permissions for {selectedRole?.name}</DialogTitle>
              <DialogDescription>
                Select the permissions to assign to this role
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[400px] overflow-y-auto">
              {permissions.map((permission) => (
                <div key={permission.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={permission.id}
                    checked={selectedPermissions.includes(permission.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPermissions([...selectedPermissions, permission.id]);
                      } else {
                        setSelectedPermissions(
                          selectedPermissions.filter((id) => id !== permission.id)
                        );
                      }
                    }}
                    className="h-4 w-4"
                  />
                  <Label htmlFor={permission.id} className="cursor-pointer">
                    {permission.name}
                  </Label>
                </div>
              ))}
              {permissions.length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  No permissions available. Create permissions first.
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsPermissionDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handlePermissionSubmit}>
                Save Permissions
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

