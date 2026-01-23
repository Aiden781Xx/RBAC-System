import { NextRequest, NextResponse } from 'next/server';
import { RoleService, assignPermissionsSchema } from '@/lib/services/role.service';
import { authenticateRequest } from '@/lib/middleware/auth.middleware';
import { z } from 'zod';

/**
 * Controller: Handle get permissions for a role requests
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = authenticateRequest(request);
    if (!auth.authenticated) {
      return auth.response!;
    }

    const permissions = await RoleService.getPermissions(params.id);
    return NextResponse.json(permissions);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message.includes('not found') ? 404 : 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Controller: Handle assign permissions to a role requests
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = authenticateRequest(request);
    if (!auth.authenticated) {
      return auth.response!;
    }

    const body = await request.json();
    const data = assignPermissionsSchema.parse(body);

    const updatedRole = await RoleService.assignPermissions(params.id, data);
    return NextResponse.json(updatedRole);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message.includes('not found') ? 404 : 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

