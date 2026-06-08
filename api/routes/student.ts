import { Router, Request, Response } from 'express';
import { getStudentByStudentId } from '../db/database';
import { ApiResponse } from '@shared/types';

const router = Router();

router.get('/:studentId', (req: Request, res: Response) => {
  const { studentId } = req.params;
  
  if (!studentId || studentId.trim() === '') {
    const response: ApiResponse = {
      success: false,
      message: '请输入学号',
    };
    return res.status(400).json(response);
  }

  const student = getStudentByStudentId(studentId);
  
  if (!student) {
    const response: ApiResponse = {
      success: false,
      message: '未找到该学生信息，请检查学号是否正确',
    };
    return res.status(404).json(response);
  }

  const response: ApiResponse<typeof student> = {
    success: true,
    data: student,
  };
  res.json(response);
});

export default router;
