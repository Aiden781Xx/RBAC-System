import { NextRequest, NextResponse } from 'next/server';
import { PermissionService, updatePermissionSchema } from '@/lib/services/permission.service';
import { authenticateRequest } from '@/lib/middleware/auth.middleware';
import { z } from 'zod';

/**
 * Controller: Handle get permission by ID requests
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

    const permission = await PermissionService.getById(params.id);

    if (!permission) {
      return NextResponse.json(
        { error: 'Permission not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(permission);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Controller: Handle update permission requests
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
    const data = updatePermissionSchema.parse(body);

    const permission = await PermissionService.update(params.id, data);
    return NextResponse.json(permission);
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
 * Controller: Handle delete permission requests
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

    const result = await PermissionService.delete(params.id);
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

