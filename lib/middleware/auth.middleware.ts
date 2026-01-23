import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';

/**
 * Middleware helper to authenticate API requests
 */
export function authenticateRequest(request: NextRequest): {
  authenticated: boolean;
  response?: NextResponse;
} {
  const token = AuthService.getTokenFromRequest(request);

  if (!token) {
    return {
      authenticated: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  const payload = AuthService.verifyToken(token);
  if (!payload) {
    return {
      authenticated: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  return { authenticated: true };
}

