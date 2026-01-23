'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Shield, Users, Key, LogOut, Sparkles } from 'lucide-react';
import { getToken, getAuthHeaders, removeToken } from '@/lib/auth-client';

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [stats, setStats] = useState({ roles: 0, permissions: 0 });

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    fetchStats();
  }, [router]);

  const fetchStats = async () => {
    try {
      const [rolesRes, permissionsRes] = await Promise.all([
        fetch('/api/roles', {
          headers: getAuthHeaders(),
        }),
        fetch('/api/permissions', {
          headers: getAuthHeaders(),
        }),
      ]);

      if (rolesRes.ok && permissionsRes.ok) {
        const roles = await rolesRes.json();
        const permissions = await permissionsRes.json();
        setStats({ roles: roles.length, permissions: permissions.length });
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleLogout = () => {
    removeToken();
    router.push('/login');
    toast({
      title: 'Logged out',
      description: 'You have been logged out successfully.',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <nav className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">RBAC Configurator</h1>
            </div>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
          <p className="text-muted-foreground">
            Manage roles, permissions, and access control for your application
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Roles</CardTitle>
                <Users className="h-8 w-8 text-primary" />
              </div>
              <CardDescription>Total number of roles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{stats.roles}</div>
              <Link href="/dashboard/roles">
                <Button variant="outline" className="mt-4 w-full">
                  Manage Roles
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Permissions</CardTitle>
                <Key className="h-8 w-8 text-primary" />
              </div>
              <CardDescription>Total number of permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{stats.permissions}</div>
              <Link href="/dashboard/permissions">
                <Button variant="outline" className="mt-4 w-full">
                  Manage Permissions
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Natural Language Configuration</CardTitle>
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <CardDescription>
              Use plain English to configure your RBAC settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/natural-language">
              <Button className="w-full">
                <Sparkles className="h-4 w-4 mr-2" />
                Open Natural Language Configurator
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

