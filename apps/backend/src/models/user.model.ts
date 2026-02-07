import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  role?: 'buyer' | 'seller' | 'admin' | 'moderator';
  walletAddress?: string;
  phoneNumber?: string;
  country?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  phoneNumber?: string;
  country?: string;
  walletAddress?: string;
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string;
  kycStatus?: 'not_started' | 'pending' | 'verified' | 'rejected';
  kycDocumentUrl?: string;
  kycVerifiedAt?: Date;
  status?: 'active' | 'pending' | 'suspended' | 'banned';
  role?: 'buyer' | 'seller' | 'admin' | 'moderator';
  lastActiveAt?: Date;
  notificationPreferences?: any;
}

export interface UserFilters {
  search?: string;
  role?: string;
  status?: string;
  kycStatus?: string;
  country?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class UserModel {
  async create(data: CreateUserInput) {
    return prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash: data.password, // Should be pre-hashed
        name: data.name,
        role: data.role || 'buyer',
        walletAddress: data.walletAddress,
        phoneNumber: data.phoneNumber,
        country: data.country,
        registrationIp: data.ipAddress,
        userAgent: data.userAgent,
        kycStatus: 'not_started',
        status: 'active',
        lastActiveAt: new Date(),
      },
    });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        auctions: true,
        bids: true,
        transactions: true,
        disputes: true,
      },
    });
  }

  async findByWalletAddress(walletAddress: string) {
    return prisma.user.findFirst({
      where: { walletAddress },
    });
  }

  async update(id: string, data: UpdateUserInput) {
    return prisma.user.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async updateLastActive(id: string) {
    return prisma.user.update({
      where: { id },
      data: { lastActiveAt: new Date() },
    });
  }

  async updatePassword(id: string, newPasswordHash: string) {
    return prisma.user.update({
      where: { id },
      data: { 
        passwordHash: newPasswordHash,
        passwordChangedAt: new Date(),
      },
    });
  }

  async enable2FA(id: string, secret: string) {
    return prisma.user.update({
      where: { id },
      data: { 
        twoFactorEnabled: true,
        twoFactorSecret: secret,
      },
    });
  }

  async disable2FA(id: string) {
    return prisma.user.update({
      where: { id },
      data: { 
        twoFactorEnabled: false,
        twoFactorSecret: null,
      },
    });
  }

  async verifyKYC(id: string, documentUrl: string) {
    return prisma.user.update({
      where: { id },
      data: { 
        kycStatus: 'verified',
        kycDocumentUrl: documentUrl,
        kycVerifiedAt: new Date(),
      },
    });
  }

  async rejectKYC(id: string, reason: string) {
    return prisma.user.update({
      where: { id },
      data: { 
        kycStatus: 'rejected',
        kycRejectionReason: reason,
      },
    });
  }

  async suspendUser(id: string, reason: string, suspendedBy: string) {
    return prisma.user.update({
      where: { id },
      data: { 
        status: 'suspended',
        suspensionReason: reason,
        suspendedBy,
        suspendedAt: new Date(),
      },
    });
  }

  async activateUser(id: string) {
    return prisma.user.update({
      where: { id },
      data: { 
        status: 'active',
        suspensionReason: null,
        suspendedBy: null,
        suspendedAt: null,
      },
    });
  }

  async delete(id: string) {
    return prisma.user.update({
      where: { id },
      data: { 
        status: 'deleted',
        deletedAt: new Date(),
      },
    });
  }

  async findAll(filters: UserFilters = {}) {
    const {
      search,
      role,
      status,
      kycStatus,
      country,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    const where: any = {
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { walletAddress: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) where.role = role;
    if (status) where.status = status;
    if (kycStatus) where.kycStatus = kycStatus;
    if (country) where.country = country;

    const total = await prisma.user.count({ where });
    const users = await prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        _count: {
          select: {
            auctions: true,
            transactions: true,
            disputes: true,
          },
        },
      },
    });

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getStats() {
    const [
      totalUsers,
      activeUsers,
      suspendedUsers,
      kycPending,
      buyers,
      sellers,
      todayRegistrations,
    ] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.user.count({ where: { status: 'active', deletedAt: null } }),
      prisma.user.count({ where: { status: 'suspended', deletedAt: null } }),
      prisma.user.count({ where: { kycStatus: 'pending', deletedAt: null } }),
      prisma.user.count({ where: { role: 'buyer', deletedAt: null } }),
      prisma.user.count({ where: { role: 'seller', deletedAt: null } }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
          deletedAt: null,
        },
      }),
    ]);

    return {
      totalUsers,
      activeUsers,
      suspendedUsers,
      kycPending,
      buyers,
      sellers,
      todayRegistrations,
      twoFactorEnabled: await prisma.user.count({
        where: { twoFactorEnabled: true, deletedAt: null },
      }),
    };
  }

  async countByCountry() {
    return prisma.user.groupBy({
      by: ['country'],
      where: { deletedAt: null, country: { not: null } },
      _count: { country: true },
      orderBy: { _count: { country: 'desc' } },
      take: 10,
    });
  }

  async findSimilarUsers(userId: string, limit: number = 5) {
    const user = await this.findById(userId);
    if (!user) return [];

    return prisma.user.findMany({
      where: {
        id: { not: userId },
        deletedAt: null,
        OR: [
          { country: user.country },
          { role: user.role },
        ],
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  async createRecoveryCodes(userId: string, codes: string[]) {
    return prisma.recoveryCode.createMany({
      data: codes.map(code => ({
        userId,
        code,
        used: false,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      })),
    });
  }

  async verifyRecoveryCode(userId: string, code: string) {
    const recoveryCode = await prisma.recoveryCode.findFirst({
      where: {
        userId,
        code,
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (recoveryCode) {
      await prisma.recoveryCode.update({
        where: { id: recoveryCode.id },
        data: { used: true, usedAt: new Date() },
      });
      return true;
    }

    return false;
  }

  async createLoginAttempt(userId: string, success: boolean, ipAddress?: string, userAgent?: string) {
    return prisma.loginAttempt.create({
      data: {
        userId,
        success,
        ipAddress,
        userAgent,
      },
    });
  }

  async getRecentLoginAttempts(userId: string, limit: number = 10) {
    return prisma.loginAttempt.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async countFailedAttempts(userId: string, hours: number = 24) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    return prisma.loginAttempt.count({
      where: {
        userId,
        success: false,
        createdAt: { gte: since },
      },
    });
  }

  async isAccountLocked(userId: string): Promise<boolean> {
    const failedAttempts = await this.countFailedAttempts(userId, 1); // Last hour
    return failedAttempts >= 5; // Lock after 5 failed attempts
  }
}

export const userModel = new UserModel();
