import { Request, Response } from 'express';
import { userModel } from '../models/user.model';
import { jwtService } from './jwt.service';
import { refreshTokenModel } from '../models/refresh-token.model';
import { validationResult } from 'express-validator';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        email,
        password,
        name,
        role = 'buyer',
        walletAddress,
        phoneNumber,
        country,
      } = req.body;

      // Check if user already exists
      const existingUser = await userModel.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          error: 'User with this email already exists',
        });
      }

      // Hash password
      const passwordHash = jwtService.hashPassword(password);

      // Create user
      const user = await userModel.create({
        email,
        password: passwordHash,
        name,
        role,
        walletAddress,
        phoneNumber,
        country,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      // Generate tokens
      const accessToken = jwtService.generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role as any,
        walletAddress: user.walletAddress || undefined,
        kycStatus: user.kycStatus as any,
      });

      const refreshTokenId = jwtService.generateTokenId();
      const refreshToken = jwtService.generateRefreshToken({
        userId: user.id,
        tokenId: refreshTokenId,
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip,
      });

      // Store refresh token
      await refreshTokenModel.create({
        userId: user.id,
        tokenId: refreshTokenId,
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });

      // Remove sensitive data
      const { passwordHash: _, ...userWithoutPassword } = user as any;

      res.status(201).json({
        message: 'Registration successful',
        user: userWithoutPassword,
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: 900, // 15 minutes in seconds
        },
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        error: 'Internal server error during registration',
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, twoFactorCode } = req.body;

      // Find user
      const user = await userModel.findByEmail(email.toLowerCase());
      if (!user) {
        return res.status(401).json({
          error: 'Invalid credentials',
        });
      }

      // Check if account is locked
      const isLocked = await userModel.isAccountLocked(user.id);
      if (isLocked) {
        return res.status(423).json({
          error: 'Account temporarily locked due to too many failed attempts',
          lockedUntil: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
        });
      }

      // Verify password
      const isValidPassword = jwtService.verifyPassword(password, user.passwordHash);
      if (!isValidPassword) {
        await userModel.createLoginAttempt(user.id, false, req.ip, req.get('User-Agent'));
        return res.status(401).json({
          error: 'Invalid credentials',
        });
      }

      // Check if 2FA is required
      if (user.twoFactorEnabled) {
        if (!twoFactorCode) {
          return res.status(400).json({
            error: 'Two-factor authentication code required',
            requires2FA: true,
          });
        }

        // Verify 2FA code
        const isValid2FA = speakeasy.totp.verify({
          secret: user.twoFactorSecret!,
          encoding: 'base32',
          token: twoFactorCode,
          window: 1,
        });

        if (!isValid2FA) {
          await userModel.createLoginAttempt(user.id, false, req.ip, req.get('User-Agent'));
          return res.status(401).json({
            error: 'Invalid two-factor authentication code',
          });
        }
      }

      // Update last active
      await userModel.updateLastActive(user.id);
      await userModel.createLoginAttempt(user.id, true, req.ip, req.get('User-Agent'));

      // Generate tokens
      const accessToken = jwtService.generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role as any,
        walletAddress: user.walletAddress || undefined,
        kycStatus: user.kycStatus as any,
      });

      const refreshTokenId = jwtService.generateTokenId();
      const refreshToken = jwtService.generateRefreshToken({
        userId: user.id,
        tokenId: refreshTokenId,
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip,
      });

      // Store refresh token
      await refreshTokenModel.create({
        userId: user.id,
        tokenId: refreshTokenId,
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });

      // Remove sensitive data
      const { passwordHash, twoFactorSecret, ...userWithoutSensitive } = user as any;

      res.json({
        message: 'Login successful',
        user: userWithoutSensitive,
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: 900, // 15 minutes in seconds
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        error: 'Internal server error during login',
      });
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({
          error: 'Refresh token is required',
        });
      }

      // Verify refresh token
      const decoded = jwtService.verifyRefreshToken(refreshToken);
      if (!decoded) {
        return res.status(401).json({
          error: 'Invalid refresh token',
        });
      }

      // Check if token exists in database
      const storedToken = await refreshTokenModel.findByTokenId(decoded.tokenId);
      if (!storedToken || storedToken.revoked || storedToken.expiresAt < new Date()) {
        return res.status(401).json({
          error: 'Refresh token expired or revoked',
        });
      }

      // Get user
      const user = await userModel.findById(decoded.userId);
      if (!user || user.status !== 'active') {
        return res.status(401).json({
          error: 'User not found or inactive',
        });
      }

      // Generate new access token
      const accessToken = jwtService.generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role as any,
        walletAddress: user.walletAddress || undefined,
        kycStatus: user.kycStatus as any,
      });

      res.json({
        accessToken,
        expiresIn: 900,
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(500).json({
        error: 'Internal server error during token refresh',
      });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const authHeader = req.get('Authorization');
      const accessToken = jwtService.extractTokenFromHeader(authHeader);
      
      if (accessToken) {
        const decoded = jwtService.decodeToken(accessToken);
        if (decoded) {
          // Add token to blacklist (implement blacklist logic)
          await refreshTokenModel.revokeAllUserTokens(decoded.userId);
        }
      }

      res.json({
        message: 'Logout successful',
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        error: 'Internal server error during logout',
      });
    }
  }

  async logoutAll(req: Request, res: Response) {
    try {
      const authHeader = req.get('Authorization');
      const accessToken = jwtService.extractTokenFromHeader(authHeader);
      
      if (accessToken) {
        const decoded = jwtService.decodeToken(accessToken);
        if (decoded) {
          await refreshTokenModel.revokeAllUserTokens(decoded.userId);
        }
      }

      res.json({
        message: 'Logged out from all devices',
      });
    } catch (error) {
      console.error('Logout all error:', error);
      res.status(500).json({
        error: 'Internal server error',
      });
    }
  }

  async getCurrentUser(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        return res.status(401).json({
          error: 'Not authenticated',
        });
      }

      const user = await userModel.findById(userId);
      if (!user) {
        return res.status(404).json({
          error: 'User not found',
        });
      }

      // Remove sensitive data
      const { passwordHash, twoFactorSecret, ...userWithoutSensitive } = user as any;

      res.json({
        user: userWithoutSensitive,
      });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({
        error: 'Internal server error',
      });
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        return res.status(401).json({
          error: 'Not authenticated',
        });
      }

      const { name, phoneNumber, country, notificationPreferences } = req.body;

      const updatedUser = await userModel.update(userId, {
        name,
        phoneNumber,
        country,
        notificationPreferences,
      });

      const { passwordHash, twoFactorSecret, ...userWithoutSensitive } = updatedUser as any;

      res.json({
        message: 'Profile updated successfully',
        user: userWithoutSensitive,
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        error: 'Internal server error',
      });
    }
  }

  async changePassword(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        return res.status(401).json({
          error: 'Not authenticated',
        });
      }

      const { currentPassword, newPassword } = req.body;

      // Get user
      const user = await userModel.findById(userId);
      if (!user) {
        return res.status(404).json({
          error: 'User not found',
        });
      }

      // Verify current password
      const isValidPassword = jwtService.verifyPassword(currentPassword, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({
          error: 'Current password is incorrect',
        });
      }

      // Hash new password
      const newPasswordHash = jwtService.hashPassword(newPassword);

      // Update password
      await userModel.updatePassword(userId, newPasswordHash);

      // Revoke all refresh tokens (security measure)
      await refreshTokenModel.revokeAllUserTokens(userId);

      res.json({
        message: 'Password changed successfully. Please login again.',
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        error: 'Internal server error',
      });
    }
  }

  async setup2FA(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        return res.status(401).json({
          error: 'Not authenticated',
        });
      }

      // Generate 2FA secret
      const secret = speakeasy.generateSecret({
        name: `PhoenixPME:${userId}`,
        length: 20,
      });

      // Generate QR code URL
      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url || '');

      // Generate backup codes
      const backupCodes = Array.from({ length: 8 }, () =>
        jwtService.generateRecoveryCode()
      );

      // Store backup codes
      await userModel.createRecoveryCodes(userId, backupCodes);

      res.json({
        secret: secret.base32,
        qrCodeUrl,
        backupCodes,
        message: 'Setup 2FA using the QR code or secret. Save backup codes securely.',
      });
    } catch (error) {
      console.error('2FA setup error:', error);
      res.status(500).json({
        error: 'Internal server error during 2FA setup',
      });
    }
  }

  async verify2FASetup(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        return res.status(401).json({
          error: 'Not authenticated',
        });
      }

      const { code, secret } = req.body;

      // Verify 2FA code
      const isValid = speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token: code,
        window: 1,
      });

      if (!isValid) {
        return res.status(400).json({
          error: 'Invalid verification code',
        });
      }

      // Enable 2FA for user
      await userModel.enable2FA(userId, secret);

      res.json({
        message: 'Two-factor authentication enabled successfully',
      });
    } catch (error) {
      console.error('2FA verification error:', error);
      res.status(500).json({
        error: 'Internal server error',
      });
    }
  }

  async disable2FA(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        return res.status(401).json({
          error: 'Not authenticated',
        });
      }

      const { code } = req.body;

      // Get user
      const user = await userModel.findById(userId);
      if (!user || !user.twoFactorEnabled) {
        return res.status(400).json({
          error: '2FA is not enabled',
        });
      }

      // Verify current 2FA code or backup code
      let isValid = false;
      
      if (code.length === 6) {
        // Regular 2FA code
        isValid = speakeasy.totp.verify({
          secret: user.twoFactorSecret!,
          encoding: 'base32',
          token: code,
          window: 1,
        });
      } else {
        // Backup code
        isValid = await userModel.verifyRecoveryCode(userId, code);
      }

      if (!isValid) {
        return res.status(401).json({
          error: 'Invalid verification code',
        });
      }

      // Disable 2FA
      await userModel.disable2FA(userId);

      res.json({
        message: 'Two-factor authentication disabled successfully',
      });
    } catch (error) {
      console.error('Disable 2FA error:', error);
      res.status(500).json({
        error: 'Internal server error',
      });
    }
  }

  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;

      const user = await userModel.findByEmail(email.toLowerCase());
      if (!user) {
        // Don't reveal if user exists for security
        return res.json({
          message: 'If an account exists with this email, a reset link has been sent',
        });
      }

      // Generate reset token
      const resetToken = jwtService.generateSecureRandom(32);
      const resetTokenExpiry = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

      // Store reset token (implement this in user model)
      await userModel.update(user.id, {
        passwordResetToken: resetToken,
        passwordResetExpires: resetTokenExpiry,
      });

      // Send email (implement email service)
      // await emailService.sendPasswordReset(user.email, resetToken);

      res.json({
        message: 'If an account exists with this email, a reset link has been sent',
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({
        error: 'Internal server error',
      });
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const { token, newPassword } = req.body;

      // Find user by reset token
      const user = await prisma.user.findFirst({
        where: {
          passwordResetToken: token,
          passwordResetExpires: { gt: new Date() },
        },
      });

      if (!user) {
        return res.status(400).json({
          error: 'Invalid or expired reset token',
        });
      }

      // Hash new password
      const newPasswordHash = jwtService.hashPassword(newPassword);

      // Update password and clear reset token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash: newPasswordHash,
          passwordResetToken: null,
          passwordResetExpires: null,
          passwordChangedAt: new Date(),
        },
      });

      // Revoke all refresh tokens
      await refreshTokenModel.revokeAllUserTokens(user.id);

      res.json({
        message: 'Password reset successful. Please login with your new password.',
      });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({
        error: 'Internal server error',
      });
    }
  }

  async validateSession(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        return res.status(401).json({
          error: 'Not authenticated',
        });
      }

      const user = await userModel.findById(userId);
      if (!user) {
        return res.status(404).json({
          error: 'User not found',
        });
      }

      const { passwordHash, twoFactorSecret, ...userWithoutSensitive } = user as any;

      res.json({
        valid: true,
        user: userWithoutSensitive,
      });
    } catch (error) {
      console.error('Validate session error:', error);
      res.status(500).json({
        error: 'Internal server error',
      });
    }
  }
}

export const authController = new AuthController();
