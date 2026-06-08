import { Router, Request, Response } from 'express';
import { getStats, getNotReceivedStudents } from '../services/stats';
import { ApiResponse, StatsData, Student } from '@shared/types';

const router = Router();

router.get('/stats', (req: Request, res: Response) => {
  const { college } = req.query as { college?: string };
  
  const stats = getStats(college);
  
  const response: ApiResponse<StatsData> = {
    success: true,
    data: stats,
  };
  res.json(response);
});

router.get('/not-received', (req: Request, res: Response) => {
  const { college } = req.query as { college?: string };
  
  const students = getNotReceivedStudents(college);
  
  const response: ApiResponse<Student[]> = {
    success: true,
    data: students,
  };
  res.json(response);
});

export default router;
