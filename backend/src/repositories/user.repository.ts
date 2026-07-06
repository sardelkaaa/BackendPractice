import { User } from '../generated/prisma/client.js';
import prisma from '../db/prisma.js';

export const userRepository = {
    async findByEmail(email: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { email },
        });
    },

    async findById(id: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { id },
        });
    },

    async create(email: string, passwordHash: string): Promise<User> {
        return prisma.user.create({
            data: {
                email,
                passwordHash,
            },
        });
    },
};