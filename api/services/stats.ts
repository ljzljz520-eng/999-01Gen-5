import { Student, StatsData, ClothingType } from '@shared/types';
import { getAllStudents, getStudentsByCollege } from '../db/database';

function isFullyReceived(student: Student): boolean {
  return student.topReceived && student.pantsReceived && student.shoeReceived && student.beltReceived;
}

function calculateStats(students: Student[]): StatsData {
  const totalStudents = students.length;
  const receivedStudents = students.filter(isFullyReceived).length;
  const notReceivedStudents = totalStudents - receivedStudents;

  const collegeMap = new Map<string, { total: number; received: number }>();
  students.forEach(student => {
    const college = student.college;
    const current = collegeMap.get(college) || { total: 0, received: 0 };
    current.total++;
    if (isFullyReceived(student)) {
      current.received++;
    }
    collegeMap.set(college, current);
  });

  const byCollege = Array.from(collegeMap.entries()).map(([college, data]) => ({
    college,
    total: data.total,
    received: data.received,
    notReceived: data.total - data.received,
  }));

  const pendingMap = new Map<string, { type: ClothingType; size: string; count: number }>();

  const types: ClothingType[] = ['top', 'pants', 'shoe', 'belt'];
  types.forEach(type => {
    students.forEach(student => {
      let size: string;
      let received: boolean;

      switch (type) {
        case 'top':
          size = student.topSize;
          received = student.topReceived;
          break;
        case 'pants':
          size = student.pantsSize;
          received = student.pantsReceived;
          break;
        case 'shoe':
          size = student.shoeSize;
          received = student.shoeReceived;
          break;
        case 'belt':
          size = student.beltSize;
          received = student.beltReceived;
          break;
      }

      if (!received) {
        const key = `${type}-${size}`;
        const existing = pendingMap.get(key);
        if (existing) {
          existing.count++;
        } else {
          pendingMap.set(key, { type, size, count: 1 });
        }
      }
    });
  });

  const pendingItems = Array.from(pendingMap.values()).sort((a, b) => b.count - a.count);

  return {
    totalStudents,
    receivedStudents,
    notReceivedStudents,
    pendingItems,
    byCollege,
  };
}

export function getStats(college?: string): StatsData {
  const students = college ? getStudentsByCollege(college) : getAllStudents();
  return calculateStats(students);
}

export function getNotReceivedStudents(college?: string): Student[] {
  const students = college ? getStudentsByCollege(college) : getAllStudents();
  return students.filter(s => !isFullyReceived(s));
}
