export interface User {
    id: number;
    email: string;
    name: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserIdentity {
    id: number;
    userId: number;
    provider: string;
    providerId: string;
    metadata: Record<string, any> | null;
    createdAt: Date;
    updatedAt: Date;
}