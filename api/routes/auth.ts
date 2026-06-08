import { Router, Request, Response } from 'express';
import { authenticateAdmin } from '../db/database';
import { ApiResponse, LoginResponse } from '@shared/types';

const router = Router();

router.post('/staff/login', (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    const response: ApiResponse = {
      success: false,
      message: '请输入用户名和密码',
    };
    return res.status(400).json(response);
  }

  const admin = authenticateAdmin(username, password);
  
  if (!admin || admin.role !== 'staff') {
    const response: ApiResponse = {
      success: false,
      message: '用户名或密码错误，或无工作人员权限',
    };
    return res.status(401).json(response);
  }

  const token = Buffer.from(`${username}:${Date.now()}`).toString('base64');
  
  const response: ApiResponse<LoginResponse> = {
    success: true,
    data: {
      success: true,
      token,
      user: admin,
    },
  };
  res.json(response);
});

router.post('/admin/login', (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    const response: ApiResponse = {
      success: false,
      message: '请输入用户名和密码',
    };
    return res.status(400).json(response);
  }

  const admin = authenticateAdmin(username, password);
  
  if (!admin || admin.role !== 'admin') {
    const response: ApiResponse = {
      success: false,
      message: '用户名或密码错误，或无管理员权限',
    };
    return res.status(401).json(response);
  }

  const token = Buffer.from(`${username}:${Date.now()}`).toString('base64');
  
  const response: ApiResponse<LoginResponse> = {
    success: true,
    data: {
      success: true,
      token,
      user: admin,
    },
  };
  res.json(response);
});

export default router;
