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

  const sizeDemand = new Map<string, number>();
  const sizeReceived = new Map<string, number>();

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

      const demandKey = `${type}-${size}`;
      sizeDemand.set(demandKey, (sizeDemand.get(demandKey) || 0) + 1);
      if (!received) {
        sizeReceived.set(demandKey, (sizeReceived.get(demandKey) || 0) + 1);
      }
    });
  });

  const outOfStock: { type: string; size: string; count: number }[] = [];
  sizeReceived.forEach((count, key) => {
    if (count > 0) {
      const [type, size] = key.split('-');
      outOfStock.push({ type, size, count });
    }
  });

  outOfStock.sort((a, b) => b.count - a.count);

  return {
    totalStudents,
    receivedStudents,
    notReceivedStudents,
    outOfStock,
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
