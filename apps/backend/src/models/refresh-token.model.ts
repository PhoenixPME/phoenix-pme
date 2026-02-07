import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateRefreshTokenInput {
  userId: string;
  tokenId: string;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: Date;
}

export class RefreshTokenModel {
  async create(data: CreateRefreshTokenInput) {
    return prisma.refreshToken.create({
      data,
    });
  }

  async findByTokenId(tokenId: string) {
    return prisma.refreshToken.findUnique({
      where: { tokenId },
    });
  }

  async findByUserId(userId: string) {
    return prisma.refreshToken.findMany({
      where: { userId, revoked: false },
      orderBy: { createdAt: 'desc' },
    });
  }

  async revoke(tokenId: string) {
    return prisma.refreshToken.update({
      where: { tokenId },
      data: { 
        revoked: true,
        revokedAt: new Date(),
      },
    });
  }

  async revokeAllUserTokens(userId: string) {
    return prisma.refreshToken.updateMany({
      where: { 
        userId,
        revoked: false,
        expiresAt: { gt: new Date() },
      },
      data: { 
        revoked: true,
        revokedAt: new Date(),
      },
    });
  }

  async revokeAllExcept(tokenId: string, userId: string) {
    return prisma.refreshToken.updateMany({
      where: { 
        userId,
        tokenId: { not: tokenId },
        revoked: false,
      },
      data: { 
        revoked: true,
        revokedAt: new Date(),
      },
    });
  }

  async cleanupExpired() {
    return prisma.refreshToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { revoked: true },
        ],
      },
    });
  }

  async getActiveSessions(userId: string) {
    return prisma.refreshToken.findMany({
      where: {
        userId,
        revoked: false,
        expiresAt: { gt: new Date() },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async countActiveSessions(userId: string): Promise<number> {
    return prisma.refreshToken.count({
      where: {
        userId,
        revoked: false,
        expiresAt: { gt: new Date() },
      },
    });
  }

  async isTokenValid(tokenId: string): Promise<boolean> {
    const token = await this.findByTokenId(tokenId);
    if (!token) return false;
    
    return !token.revoked && token.expiresAt > new Date();
  }

  async updateLastUsed(tokenId: string) {
    return prisma.refreshToken.update({
      where: { tokenId },
      data: { lastUsedAt: new Date() },
    });
  }

  async getSessionActivity(userId: string, days: number = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    return prisma.refreshToken.findMany({
      where: {
        userId,
        createdAt: { gte: since },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const refreshTokenModel = new RefreshTokenModel();
