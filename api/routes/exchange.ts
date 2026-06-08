import { Router, Request, Response } from 'express';
import { getStudentByStudentId, addExchangeRecord, getExchangeRecords, updateStudentSize } from '../db/database';
import { ApiResponse, ClothingType, ExchangeRecord } from '@shared/types';

const router = Router();

router.post('/', (req: Request, res: Response) => {
  const { studentId, type, oldSize, newSize, operator } = req.body as {
    studentId: string;
    type: ClothingType;
    oldSize: string;
    newSize: string;
    operator: string;
  };

  if (!studentId || !type || !oldSize || !newSize || !operator) {
    const response: ApiResponse = {
      success: false,
      message: '请填写完整的换码信息',
    };
    return res.status(400).json(response);
  }

  const validTypes: ClothingType[] = ['top', 'pants', 'shoe', 'belt'];
  if (!validTypes.includes(type)) {
    const response: ApiResponse = {
      success: false,
      message: '无效的换码类型',
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

  const sizeUpdated = updateStudentSize(studentId, type, newSize);
  if (!sizeUpdated) {
    const response: ApiResponse = {
      success: false,
      message: '更新尺码失败，请重试',
    };
    return res.status(500).json(response);
  }

  const record = addExchangeRecord({
    studentId,
    type,
    oldSize,
    newSize,
    operator,
  });

  const response: ApiResponse<ExchangeRecord> = {
    success: true,
    data: record,
    message: '换码登记成功',
  };
  res.json(response);
});

router.get('/records', (req: Request, res: Response) => {
  const { studentId } = req.query as { studentId?: string };
  
  const records = getExchangeRecords(studentId);
  
  const response: ApiResponse<ExchangeRecord[]> = {
    success: true,
    data: records,
  };
  res.json(response);
});

export default router;
