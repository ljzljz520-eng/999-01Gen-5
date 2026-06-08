import fs from 'fs';
import path from 'path';
import { Student, ExchangeRecord, AdminUser, ClothingType } from '@shared/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const STUDENTS_FILE = path.join(DATA_DIR, 'students.json');
const EXCHANGE_FILE = path.join(DATA_DIR, 'exchange_records.json');
const ADMINS_FILE = path.join(DATA_DIR, 'admins.json');

interface Database {
  students: Student[];
  exchangeRecords: ExchangeRecord[];
  admins: AdminUser[];
}

let db: Database;
let nextStudentId = 1;
let nextExchangeId = 1;
let nextAdminId = 1;

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJsonFile<T>(filePath: string, defaultValue: T): T {
  if (!fs.existsSync(filePath)) {
    return defaultValue;
  }
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return defaultValue;
  }
}

function writeJsonFile<T>(filePath: string, data: T) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

function initMockData(): Database {
  const students: Student[] = [
    { id: 1, studentId: '2024001', name: '张三', college: '计算机学院', className: '计科2401', topSize: 'L', pantsSize: '32', shoeSize: '42', beltSize: 'M', topReceived: false, pantsReceived: false, shoeReceived: false, beltReceived: false },
    { id: 2, studentId: '2024002', name: '李四', college: '计算机学院', className: '计科2401', topSize: 'XL', pantsSize: '34', shoeSize: '43', beltSize: 'L', topReceived: true, pantsReceived: true, shoeReceived: false, beltReceived: false, receivedAt: '2024-09-01 09:00:00' },
    { id: 3, studentId: '2024003', name: '王五', college: '电子工程学院', className: '电子2401', topSize: 'M', pantsSize: '30', shoeSize: '41', beltSize: 'M', topReceived: false, pantsReceived: false, shoeReceived: false, beltReceived: false },
    { id: 4, studentId: '2024004', name: '赵六', college: '电子工程学院', className: '电子2401', topSize: 'XXL', pantsSize: '36', shoeSize: '44', beltSize: 'L', topReceived: false, pantsReceived: false, shoeReceived: false, beltReceived: false },
    { id: 5, studentId: '2024005', name: '孙七', college: '机械工程学院', className: '机械2401', topSize: 'L', pantsSize: '32', shoeSize: '42', beltSize: 'M', topReceived: true, pantsReceived: true, shoeReceived: true, beltReceived: true, receivedAt: '2024-09-01 10:30:00' },
    { id: 6, studentId: '2024006', name: '周八', college: '机械工程学院', className: '机械2401', topSize: 'XL', pantsSize: '34', shoeSize: '43', beltSize: 'L', topReceived: false, pantsReceived: false, shoeReceived: false, beltReceived: false },
    { id: 7, studentId: '2024007', name: '吴九', college: '计算机学院', className: '计科2402', topSize: 'M', pantsSize: '30', shoeSize: '40', beltSize: 'S', topReceived: false, pantsReceived: false, shoeReceived: false, beltReceived: false },
    { id: 8, studentId: '2024008', name: '郑十', college: '计算机学院', className: '计科2402', topSize: 'L', pantsSize: '32', shoeSize: '42', beltSize: 'M', topReceived: false, pantsReceived: false, shoeReceived: false, beltReceived: false },
    { id: 9, studentId: '2024009', name: '陈十一', college: '计算机学院', className: '计科2402', topSize: 'XXL', pantsSize: '36', shoeSize: '45', beltSize: 'L', topReceived: false, pantsReceived: false, shoeReceived: false, beltReceived: false },
    { id: 10, studentId: '2024010', name: '林十二', college: '电子工程学院', className: '电子2402', topSize: 'S', pantsSize: '28', shoeSize: '39', beltSize: 'S', topReceived: true, pantsReceived: false, shoeReceived: false, beltReceived: false, receivedAt: '2024-09-02 08:30:00' },
  ];

  const admins: AdminUser[] = [
    { id: 1, username: 'staff1', role: 'staff' },
    { id: 2, username: 'staff2', role: 'staff' },
    { id: 3, username: 'admin_cs', role: 'admin', college: '计算机学院' },
    { id: 4, username: 'admin_ee', role: 'admin', college: '电子工程学院' },
    { id: 5, username: 'admin_me', role: 'admin', college: '机械工程学院' },
  ];

  const exchangeRecords: ExchangeRecord[] = [];

  return { students, admins, exchangeRecords };
}

export function initDatabase() {
  ensureDataDir();
  
  const students = readJsonFile<Student[]>(STUDENTS_FILE, []);
  const exchangeRecords = readJsonFile<ExchangeRecord[]>(EXCHANGE_FILE, []);
  const admins = readJsonFile<AdminUser[]>(ADMINS_FILE, []);

  if (students.length === 0 && admins.length === 0) {
    const mockData = initMockData();
    db = mockData;
    saveDatabase();
    nextStudentId = mockData.students.length + 1;
    nextExchangeId = 1;
    nextAdminId = mockData.admins.length + 1;
  } else {
    db = { students, exchangeRecords, admins };
    nextStudentId = students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 1;
    nextExchangeId = exchangeRecords.length > 0 ? Math.max(...exchangeRecords.map(r => r.id)) + 1 : 1;
    nextAdminId = admins.length > 0 ? Math.max(...admins.map(a => a.id)) + 1 : 1;
  }
}

function saveDatabase() {
  writeJsonFile(STUDENTS_FILE, db.students);
  writeJsonFile(EXCHANGE_FILE, db.exchangeRecords);
  writeJsonFile(ADMINS_FILE, db.admins);
}

export function getStudentByStudentId(studentId: string): Student | undefined {
  return db.students.find(s => s.studentId === studentId);
}

export function getAllStudents(): Student[] {
  return [...db.students];
}

export function getStudentsByCollege(college: string): Student[] {
  return db.students.filter(s => s.college === college);
}

export function updateStudent(studentId: string, updates: Partial<Student>): Student | undefined {
  const index = db.students.findIndex(s => s.studentId === studentId);
  if (index === -1) return undefined;
  db.students[index] = { ...db.students[index], ...updates };
  saveDatabase();
  return db.students[index];
}

export function markItemReceived(studentId: string, items: ClothingType[]): boolean {
  const student = getStudentByStudentId(studentId);
  if (!student) return false;

  const updates: Partial<Student> = {};
  items.forEach(item => {
    switch (item) {
      case 'top':
        updates.topReceived = true;
        break;
      case 'pants':
        updates.pantsReceived = true;
        break;
      case 'shoe':
        updates.shoeReceived = true;
        break;
      case 'belt':
        updates.beltReceived = true;
        break;
    }
  });

  const allReceived = (updates.topReceived ?? student.topReceived) &&
    (updates.pantsReceived ?? student.pantsReceived) &&
    (updates.shoeReceived ?? student.shoeReceived) &&
    (updates.beltReceived ?? student.beltReceived);

  if (allReceived && !student.receivedAt) {
    updates.receivedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
  }

  updateStudent(studentId, updates);
  return true;
}

export function updateStudentSize(studentId: string, type: ClothingType, newSize: string): boolean {
  const student = getStudentByStudentId(studentId);
  if (!student) return false;

  const updates: Partial<Student> = {};
  switch (type) {
    case 'top':
      updates.topSize = newSize;
      break;
    case 'pants':
      updates.pantsSize = newSize;
      break;
    case 'shoe':
      updates.shoeSize = newSize;
      break;
    case 'belt':
      updates.beltSize = newSize;
      break;
  }

  updateStudent(studentId, updates);
  return true;
}

export function addExchangeRecord(record: Omit<ExchangeRecord, 'id' | 'createdAt'>): ExchangeRecord {
  const newRecord: ExchangeRecord = {
    ...record,
    id: nextExchangeId++,
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
  };
  db.exchangeRecords.push(newRecord);
  saveDatabase();
  return newRecord;
}

export function getExchangeRecords(studentId?: string): ExchangeRecord[] {
  let records = [...db.exchangeRecords];
  if (studentId) {
    records = records.filter(r => r.studentId === studentId);
  }
  return records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function authenticateAdmin(username: string, password: string): AdminUser | undefined {
  const admin = db.admins.find(a => a.username === username);
  if (!admin) return undefined;
  
  const passwordMap: Record<string, string> = {
    staff1: 'staff123',
    staff2: 'staff123',
    admin_cs: 'admin123',
    admin_ee: 'admin123',
    admin_me: 'admin123',
  };
  
  if (passwordMap[username] === password) {
    return admin;
  }
  return undefined;
}
