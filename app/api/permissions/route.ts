import { NextRequest, NextResponse } from 'next/server';
import { PermissionService, permissionSchema } from '@/lib/services/permission.service';
import { authenticateRequest } from '@/lib/middleware/auth.middleware';
import { z } from 'zod';

/**
 * Controller: Handle permission list requests
 */
export async function GET(request: NextRequest) {
  try {
    const auth = authenticateRequest(request);
    if (!auth.authenticated) {
      return auth.response!;
    }

    const permissions = await PermissionService.getAll();
    return NextResponse.json(permissions);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Controller: Handle permission creation requests
 */
export async function POST(request: NextRequest) {
  try {
    const auth = authenticateRequest(request);
    if (!auth.authenticated) {
      return auth.response!;
    }

    const body = await request.json();
    const data = permissionSchema.parse(body);

    const permission = await PermissionService.create(data);
    return NextResponse.json(permission, { status: 201 });
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
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

