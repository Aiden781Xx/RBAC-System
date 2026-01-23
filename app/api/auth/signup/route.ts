import { NextRequest, NextResponse } from 'next/server';
import { UserService, signupSchema } from '@/lib/services/user.service';
import { z } from 'zod';

/**
 * Controller: Handle user signup requests
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = signupSchema.parse(body);

    const result = await UserService.signup(data);

    return NextResponse.json(
      {
        message: 'User created successfully',
        ...result,
      },
      { status: 201 }
    );
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

