import { NextRequest, NextResponse } from 'next/server';
import { RoleService, roleSchema } from '@/lib/services/role.service';
import { authenticateRequest } from '@/lib/middleware/auth.middleware';
import { z } from 'zod';

/**
 * Controller: Handle role list requests
 */
export async function GET(request: NextRequest) {
  try {
    const auth = authenticateRequest(request);
    if (!auth.authenticated) {
      return auth.response!;
    }

    const roles = await RoleService.getAll();
    return NextResponse.json(roles);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Controller: Handle role creation requests
 */
export async function POST(request: NextRequest) {
  try {
    const auth = authenticateRequest(request);
    if (!auth.authenticated) {
      return auth.response!;
    }

    const body = await request.json();
    const data = roleSchema.parse(body);

    const role = await RoleService.create(data);
    return NextResponse.json(role, { status: 201 });
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

