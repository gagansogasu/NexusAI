import prisma from '../client.ts';
import { User } from '../types/user.ts';
import bcrypt from 'bcrypt';

/**
 * User Service - Functional approach for user and identity management
 */

/**
 * Get user by ID
 */
export async function getUserById(userId: number): Promise<User | null> {
    return await prisma.user.findFirst({
        where: { id: userId, isDeleted: false }
    }) as any;
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
    return await prisma.user.findFirst({
        where: { email, isDeleted: false }
    }) as any;
}

/**
 * Get all identities for a user
 */
export async function getUserIdentities(userId: number) {
    return await prisma.userIdentity.findMany({
        where: { userId, isDeleted: false }
    });
}

/**
 * Unlink an identity from a user
 * Only allowed if user has at least one other identity
 */
export async function unlinkIdentity(userId: number, provider: string): Promise<void> {
    const identities = await getUserIdentities(userId);

    if (identities.length <= 1) {
        throw new Error('Cannot unlink last identity. User must have at least one login method.');
    }

    await prisma.userIdentity.updateMany({
        where: {
            userId,
            provider,
            isDeleted: false
        },
        data: {
            isDeleted: true
        }
    });
}

/**
 * Register user with email and password
 */
export async function registerWithEmailPassword(email: string, password: string, name?: string): Promise<User> {
    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
        throw new Error('User with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user with email/password identity
    const newUser = await prisma.user.create({
        data: {
            email,
            name: name || null,
            identities: {
                create: {
                    provider: 'EmailPassword',
                    providerId: email,
                    metadata: {
                        passwordHash,
                        emailVerified: false,
                        registeredAt: new Date().toISOString()
                    }
                }
            }
        }
    });

    return newUser as any;
}

/**
 * Authenticate user with email and password
 */
export async function authenticateWithEmailPassword(email: string, password: string): Promise<User> {
    // Find user identity
    const identity = await prisma.userIdentity.findFirst({
        where: {
            provider: 'EmailPassword',
            providerId: email,
            isDeleted: false
        },
        include: {
            user: true
        }
    });

    if (!identity) {
        throw new Error('Invalid email or password');
    }

    // Verify password
    const metadata = identity.metadata as any;
    const isValid = await bcrypt.compare(password, metadata.passwordHash);

    if (!isValid) {
        throw new Error('Invalid email or password');
    }

    // Update last login
    await prisma.userIdentity.update({
        where: { id: identity.id },
        data: {
            metadata: {
                ...metadata,
                lastLoginAt: new Date().toISOString()
            }
        }
    });

    return identity.user as any;
}

/**
 * Find or create user with phone number
 */
export async function findOrCreateUserByPhone(phone: string, name?: string): Promise<User> {
    // Check if identity exists
    const existingIdentity = await prisma.userIdentity.findFirst({
        where: {
            provider: 'PhoneOTP',
            providerId: phone,
            isDeleted: false
        },
        include: {
            user: true
        }
    });

    if (existingIdentity) {
        // Update last login
        await prisma.userIdentity.update({
            where: { id: existingIdentity.id },
            data: {
                metadata: {
                    ...(existingIdentity.metadata as any),
                    lastLoginAt: new Date().toISOString()
                }
            }
        });
        return existingIdentity.user as any;
    }

    // Create new user with phone identity
    const newUser = await prisma.user.create({
        data: {
            email: `${phone.replace(/[^0-9]/g, '')}@phone.local`, // Placeholder email
            name: name || null,
            identities: {
                create: {
                    provider: 'PhoneOTP',
                    providerId: phone,
                    metadata: {
                        phone,
                        phoneVerified: true,
                        registeredAt: new Date().toISOString(),
                        lastLoginAt: new Date().toISOString()
                    }
                }
            }
        }
    });

    return newUser as any;
}

/**
 * Get all users
 */
export async function getUsers(): Promise<User[]> {
    return await prisma.user.findMany({
        where: { isDeleted: false }
    }) as any;
}