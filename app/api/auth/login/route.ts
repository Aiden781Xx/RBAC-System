import { NextRequest, NextResponse } from 'next/server';
import { UserService, loginSchema } from '@/lib/services/user.service';
import { z } from 'zod';

/**
 * Controller: Handle user login requests
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = loginSchema.parse(body);

    const result = await UserService.login(data);

    return NextResponse.json({
      message: 'Login successful',
      ...result,
    });
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
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

