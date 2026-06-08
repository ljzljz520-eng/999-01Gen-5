import { Router, Request, Response } from 'express';
import { getStudentByStudentId, markItemReceived } from '../db/database';
import { ApiResponse, ClothingType } from '@shared/types';

const router = Router();

router.post('/confirm', (req: Request, res: Response) => {
  const { studentId, items } = req.body as { studentId: string; items: ClothingType[] };

  if (!studentId || !items || items.length === 0) {
    const response: ApiResponse = {
      success: false,
      message: '请提供学号和要发放的物品',
    };
    return res.status(400).json(response);
  }

  const student = getStudentByStudentId(studentId);
  if (!student) {
    const response: ApiResponse = {
      success: false,
      message: '未找到该学生信息',
    };
    return res.status(404).json(response);
  }

  const validItems: ClothingType[] = ['top', 'pants', 'shoe', 'belt'];
  const invalidItems = items.filter(item => !validItems.includes(item));
  
  if (invalidItems.length > 0) {
    const response: ApiResponse = {
      success: false,
      message: `无效的物品类型: ${invalidItems.join(', ')}`,
    };
    return res.status(400).json(response);
  }

  const success = markItemReceived(studentId, items);
  
  if (!success) {
    const response: ApiResponse = {
      success: false,
      message: '发放确认失败，请重试',
    };
    return res.status(500).json(response);
  }

  const updatedStudent = getStudentByStudentId(studentId);
  const response: ApiResponse<typeof updatedStudent> = {
    success: true,
    data: updatedStudent,
    message: '发放确认成功',
  };
  res.json(response);
});

export default router;
