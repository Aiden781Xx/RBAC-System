import { NextRequest, NextResponse } from 'next/server';
import { NaturalLanguageService } from '@/lib/services/natural-language.service';
import { authenticateRequest } from '@/lib/middleware/auth.middleware';

/**
 * Controller: Handle natural language command processing requests
 */
export async function POST(request: NextRequest) {
  try {
    const auth = authenticateRequest(request);
    if (!auth.authenticated) {
      return auth.response!;
    }

    const body = await request.json();
    const { command } = body;

    if (!command || typeof command !== 'string') {
      return NextResponse.json(
        { error: 'Command is required' },
        { status: 400 }
      );
    }

    const result = await NaturalLanguageService.processCommand(command);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    console.error('Natural language processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
