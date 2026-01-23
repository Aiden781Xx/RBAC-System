import { prisma } from '@/lib/db';
import { AuthService } from '@/lib/auth';
import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export class UserService {
  /**
   * Create a new user (signup)
   */
  static async signup(data: z.infer<typeof signupSchema>) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password and create user
    const hashedPassword = await AuthService.hashPassword(data.password);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
      },
    });

    // Generate JWT token
    const token = AuthService.generateToken({
      userId: user.id,
      email: user.email,
    });

    return {
      token,
      user: { id: user.id, email: user.email },
    };
  }

  /**
   * Authenticate user (login)
   */
  static async login(data: z.infer<typeof loginSchema>) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isValidPassword = await AuthService.comparePassword(
      data.password,
      user.password
    );

    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Generate JWT token
    const token = AuthService.generateToken({
      userId: user.id,
      email: user.email,
    });

    return {
      token,
      user: { id: user.id, email: user.email },
    };
  }
}

