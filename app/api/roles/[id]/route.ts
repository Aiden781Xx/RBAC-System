import { NextRequest, NextResponse } from 'next/server';
import { RoleService, updateRoleSchema } from '@/lib/services/role.service';
import { authenticateRequest } from '@/lib/middleware/auth.middleware';
import { z } from 'zod';

/**
 * Controller: Handle get role by ID requests
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

    const role = await RoleService.getById(params.id);

    if (!role) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(role);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Controller: Handle update role requests
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = authenticateRequest(request);
    if (!auth.authenticated) {
      return auth.response!;
    }

    const body = await request.json();
    const data = updateRoleSchema.parse(body);

    const role = await RoleService.update(params.id, data);
    return NextResponse.json(role);
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

/**
 * Controller: Handle delete role requests
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = authenticateRequest(request);
    if (!auth.authenticated) {
      return auth.response!;
    }

    const result = await RoleService.delete(params.id);
    return NextResponse.json(result);
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

