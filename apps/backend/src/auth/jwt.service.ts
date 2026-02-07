import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export interface JwtPayload {
  userId: string;
  email: string;
  role: 'buyer' | 'seller' | 'admin' | 'moderator';
  walletAddress?: string;
  kycStatus: 'not_started' | 'pending' | 'verified' | 'rejected';
  iat?: number;
  exp?: number;
}

export interface RefreshTokenData {
  userId: string;
  tokenId: string;
  userAgent?: string;
  ipAddress?: string;
}

export class JwtService {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly accessTokenExpiry: string;
  private readonly refreshTokenExpiry: string;

  constructor() {
    this.accessTokenSecret = process.env.JWT_ACCESS_SECRET || this.generateFallbackSecret();
    this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET || this.generateFallbackSecret();
    this.accessTokenExpiry = process.env.JWT_ACCESS_EXPIRY || '15m';
    this.refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRY || '7d';
  }

  private generateFallbackSecret(): string {
    console.warn('WARNING: Using fallback JWT secret. Set JWT_ACCESS_SECRET and JWT_REFRESH_SECRET in production.');
    return crypto.randomBytes(64).toString('hex');
  }

  generateAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
    const tokenPayload: JwtPayload = {
      ...payload,
      iat: Math.floor(Date.now() / 1000),
    };

    return jwt.sign(tokenPayload, this.accessTokenSecret, {
      expiresIn: this.accessTokenExpiry,
      algorithm: 'HS256',
    });
  }

  generateRefreshToken(data: RefreshTokenData): string {
    const payload = {
      ...data,
      iat: Math.floor(Date.now() / 1000),
    };

    return jwt.sign(payload, this.refreshTokenSecret, {
      expiresIn: this.refreshTokenExpiry,
      algorithm: 'HS256',
    });
  }

  verifyAccessToken(token: string): JwtPayload | null {
    try {
      return jwt.verify(token, this.accessTokenSecret, {
        algorithms: ['HS256'],
      }) as JwtPayload;
    } catch (error) {
      console.error('Access token verification failed:', error);
      return null;
    }
  }

  verifyRefreshToken(token: string): RefreshTokenData | null {
    try {
      return jwt.verify(token, this.refreshTokenSecret, {
        algorithms: ['HS256'],
      }) as RefreshTokenData;
    } catch (error) {
      console.error('Refresh token verification failed:', error);
      return null;
    }
  }

  decodeToken(token: string): JwtPayload | null {
    try {
      return jwt.decode(token) as JwtPayload;
    } catch (error) {
      console.error('Token decoding failed:', error);
      return null;
    }
  }

  generateTokenId(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader) return null;

    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token) return null;

    return token;
  }

  getTokenExpiry(token: string): Date | null {
    try {
      const decoded = jwt.decode(token) as any;
      if (!decoded?.exp) return null;
      return new Date(decoded.exp * 1000);
    } catch (error) {
      return null;
    }
  }

  isTokenExpired(token: string): boolean {
    const expiry = this.getTokenExpiry(token);
    if (!expiry) return true;
    return expiry.getTime() < Date.now();
  }

  generateApiKey(): string {
    return `phx_${crypto.randomBytes(32).toString('hex')}`;
  }

  generateSecureRandom(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto
      .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
      .toString('hex');
    return `${salt}:${hash}`;
  }

  verifyPassword(password: string, storedHash: string): boolean {
    const [salt, hash] = storedHash.split(':');
    const verifyHash = crypto
      .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
      .toString('hex');
    return hash === verifyHash;
  }

  generate2FASecret(): string {
    return crypto.randomBytes(20).toString('hex');
  }

  generateRecoveryCode(): string {
    return crypto.randomBytes(8).toString('hex').toUpperCase();
  }

  generateSessionId(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  generateCsrfToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  validateCsrfToken(token: string, expected: string): boolean {
    return token === expected && token.length === 64;
  }
}

export const jwtService = new JwtService();
