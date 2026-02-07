import { Request, Response, NextFunction } from 'express';
import { jwtService } from '../auth/jwt.service';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
    walletAddress?: string;
    kycStatus: string;
  };
}

export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.get('Authorization');
    const token = jwtService.extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        error: 'No authentication token provided',
      });
    }

    const decoded = jwtService.verifyAccessToken(token);
    if (!decoded) {
      return res.status(401).json({
        error: 'Invalid or expired authentication token',
      });
    }

    // Check if token is expired
    if (jwtService.isTokenExpired(token)) {
      return res.status(401).json({
        error: 'Authentication token has expired',
      });
    }

    // Attach user to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      walletAddress: decoded.walletAddress,
      kycStatus: decoded.kycStatus,
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      error: 'Internal authentication error',
    });
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        requiredRoles: roles,
        userRole: req.user.role,
      });
    }

    next();
  };
};

export const requireKYC = (level: 'verified' | 'pending' | 'not_started' = 'verified') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
      });
    }

    const kycLevels = {
      'not_started': 0,
      'pending': 1,
      'verified': 2,
    };

    const userLevel = kycLevels[req.user.kycStatus as keyof typeof kycLevels] || 0;
    const requiredLevel = kycLevels[level];

    if (userLevel < requiredLevel) {
      return res.status(403).json({
        error: 'KYC verification required',
        requiredLevel: level,
        currentLevel: req.user.kycStatus,
      });
    }

    next();
  };
};

export const requireWallet = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required',
    });
  }

  if (!req.user.walletAddress) {
    return res.status(400).json({
      error: 'Wallet address required',
      message: 'Please connect your wallet to perform this action',
    });
  }

  next();
};

export const require2FA = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // This would check if user has 2FA enabled
  // For now, just pass through - actual check would be in specific endpoints
  next();
};

export const rateLimit = (options: {
  windowMs: number;
  max: number;
  message?: string;
}) => {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const key = req.user?.userId || req.ip || 'anonymous';
    const now = Date.now();
    
    let userRequests = requests.get(key);
    
    if (!userRequests || now > userRequests.resetTime) {
      userRequests = {
        count: 0,
        resetTime: now + options.windowMs,
      };
      requests.set(key, userRequests);
    }

    userRequests.count++;

    if (userRequests.count > options.max) {
      return res.status(429).json({
        error: options.message || 'Too many requests, please try again later',
        retryAfter: Math.ceil((userRequests.resetTime - now) / 1000),
      });
    }

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', options.max.toString());
    res.setHeader('X-RateLimit-Remaining', (options.max - userRequests.count).toString());
    res.setHeader('X-RateLimit-Reset', Math.ceil(userRequests.resetTime / 1000).toString());

    next();
  };
};

export const validateCsrf = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // For APIs, we might use different CSRF protection
  // For now, skip for API routes, implement for web routes if needed
  next();
};

export const requireApiKey = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const apiKey = req.get('X-API-Key') || req.query.apiKey as string;
  
  if (!apiKey) {
    return res.status(401).json({
      error: 'API key required',
    });
  }

  // Validate API key (implement API key service)
  // For now, just attach to request
  (req as any).apiKey = apiKey;
  
  next();
};

export const corsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key, X-CSRF-Token');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
};

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);

  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      details: error.errors,
    });
  }

  if (error.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized',
    });
  }

  if (error.name === 'ForbiddenError') {
    return res.status(403).json({
      error: 'Forbidden',
    });
  }

  if (error.name === 'NotFoundError') {
    return res.status(404).json({
      error: 'Resource not found',
    });
  }

  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : undefined,
  });
};

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const { method, originalUrl, ip, userAgent } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    const userId = (req as AuthenticatedRequest).user?.userId || 'anonymous';

    console.log(
      `${new Date().toISOString()} ${method} ${originalUrl} ${statusCode} ${duration}ms - ` +
      `IP: ${ip}, User: ${userId}, Agent: ${userAgent?.substring(0, 50)}`
    );

    // Log 4xx and 5xx status codes as warnings/errors
    if (statusCode >= 400 && statusCode < 500) {
      console.warn(`Client error ${statusCode} for ${method} ${originalUrl}`);
    } else if (statusCode >= 500) {
      console.error(`Server error ${statusCode} for ${method} ${originalUrl}`);
    }
  });

  next();
};

export const validateRequest = (validator: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await validator(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};
