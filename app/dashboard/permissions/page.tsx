'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react';
import { getToken, getAuthHeaders } from '@/lib/auth-client';

export const dynamic = 'force-dynamic';

interface Permission {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  rolePermissions?: Array<{
    role: {
      id: string;
      name: string;
    };
  }>;
}

export default function PermissionsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }
    fetchPermissions();
  }, [router]);

  const fetchPermissions = async () => {
    try {
      const response = await fetch('/api/permissions', {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        // Fetch detailed info for each permission to get associated roles
        const permissionsWithRoles = await Promise.all(
          data.map(async (permission: Permission) => {
            const detailResponse = await fetch(`/api/permissions/${permission.id}`, {
              headers: getAuthHeaders(),
            });
            if (detailResponse.ok) {
              return await detailResponse.json();
            }
            return permission;
          })
        );
        setPermissions(permissionsWithRoles);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch permissions',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingPermission
        ? `/api/permissions/${editingPermission.id}`
        : '/api/permissions';
      const method = editingPermission ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: editingPermission
            ? 'Permission updated successfully'
            : 'Permission created successfully',
        });
        setIsDialogOpen(false);
        setEditingPermission(null);
        setFormData({ name: '', description: '' });
        fetchPermissions();
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

  const handleEdit = (permission: Permission) => {
    setEditingPermission(permission);
    setFormData({
      name: permission.name,
      description: permission.description || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this permission?')) return;

    try {
      const response = await fetch(`/api/permissions/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Permission deleted successfully',
        });
        fetchPermissions();
      } else {
        const data = await response.json();
        toast({
          title: 'Error',
          description: data.error || 'Failed to delete permission',
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
    setEditingPermission(null);
    setFormData({ name: '', description: '' });
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
              <h1 className="text-3xl font-bold">Permissions</h1>
              <p className="text-muted-foreground">
                Manage application permissions
              </p>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Create Permission
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingPermission ? 'Edit Permission' : 'Create Permission'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingPermission
                      ? 'Update the permission details'
                      : 'Add a new permission to the system'}
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
                      placeholder="e.g., edit:post"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      placeholder="Brief description of the permission"
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
                    {editingPermission ? 'Update' : 'Create'}
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
            ) : permissions.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No permissions found. Create your first permission!
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Associated Roles</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {permissions.map((permission) => (
                    <TableRow key={permission.id}>
                      <TableCell className="font-medium">
                        {permission.name}
                      </TableCell>
                      <TableCell>
                        {permission.description || (
                          <span className="text-muted-foreground">No description</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {permission.rolePermissions && permission.rolePermissions.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {permission.rolePermissions.map((rp) => (
                              <span
                                key={rp.role.id}
                                className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs"
                              >
                                {rp.role.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            No roles assigned
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(permission.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(permission)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(permission.id)}
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
      </div>
    </div>
  );
}

