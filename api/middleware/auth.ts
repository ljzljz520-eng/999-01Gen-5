import { Request, Response, NextFunction } from 'express';
import { AdminUser } from '@shared/types';

declare global {
  namespace Express {
    interface Request {
      currentUser?: AdminUser;
    }
  }
}

const activeTokens = new Map<string, AdminUser>();

export function createToken(user: AdminUser): string {
  const token = Buffer.from(`${user.username}:${Date.now()}:${Math.random()}`).toString('base64');
  activeTokens.set(token, user);
  return token;
}

export function invalidateToken(token: string) {
  activeTokens.delete(token);
}

function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

export function requireAuth(allowedRoles?: Array<'staff' | 'admin'>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = extractToken(req);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '未提供认证令牌，请先登录',
      });
    }

    const user = activeTokens.get(token);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '认证令牌无效或已过期，请重新登录',
      });
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: '权限不足，无法访问此资源',
      });
    }

    req.currentUser = user;
    next();
  };
}
