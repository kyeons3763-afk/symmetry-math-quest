import { StudentRecord } from '../types';

const STORAGE_ROOM_PWD = 'symmetry_room_password';
const STORAGE_TEACHER_PIN = 'symmetry_teacher_pin';
const STORAGE_STUDENTS = 'symmetry_classroom_students';
const BROADCAST_CHANNEL_NAME = 'symmetry_classroom_channel';

// Fallback defaults
export const DEFAULT_ROOM_PASSWORD = '501';
export const DEFAULT_TEACHER_PIN = '1234';

class ClassroomSyncManager {
  private channel: BroadcastChannel | null = null;
  private listeners: Array<() => void> = [];

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        this.channel.onmessage = () => {
          this.notifyListeners();
        };
      } catch (e) {
        // BroadcastChannel might not be supported in some sandboxes
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_STUDENTS || e.key === STORAGE_ROOM_PWD) {
          this.notifyListeners();
        }
      });
    }
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (e) {
        console.error(e);
      }
    });
  }

  public subscribe(callback: () => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  private broadcastChange() {
    this.notifyListeners();
    if (this.channel) {
      try {
        this.channel.postMessage({ type: 'UPDATE', timestamp: Date.now() });
      } catch (e) {
        // ignore
      }
    }
  }

  // Room Password
  public getRoomPassword(): string {
    if (typeof window === 'undefined') return DEFAULT_ROOM_PASSWORD;
    const pwd = localStorage.getItem(STORAGE_ROOM_PWD);
    return pwd || DEFAULT_ROOM_PASSWORD;
  }

  public setRoomPassword(pwd: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_ROOM_PWD, pwd.trim());
    this.broadcastChange();
  }

  // Teacher Master PIN
  public getTeacherPin(): string {
    if (typeof window === 'undefined') return DEFAULT_TEACHER_PIN;
    const pin = localStorage.getItem(STORAGE_TEACHER_PIN);
    return pin || DEFAULT_TEACHER_PIN;
  }

  public setTeacherPin(pin: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_TEACHER_PIN, pin.trim());
  }

  // All students in storage
  private getAllStudents(): StudentRecord[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_STUDENTS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  private saveAllStudents(students: StudentRecord[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_STUDENTS, JSON.stringify(students));
      this.broadcastChange();
    } catch (e) {
      console.error('Failed to save students:', e);
    }
  }

  // Get active students for the current room
  public getStudentsByRoom(roomPassword: string): StudentRecord[] {
    const all = this.getAllStudents();
    return all
      .filter((s) => s.roomPassword === roomPassword.trim())
      .sort((a, b) => b.score - a.score || b.updatedAt - a.updatedAt);
  }

  // Register / update student session
  public upsertStudent(student: StudentRecord): void {
    const all = this.getAllStudents();
    const existingIdx = all.findIndex((s) => s.id === student.id);
    if (existingIdx !== -1) {
      all[existingIdx] = { ...all[existingIdx], ...student, updatedAt: Date.now() };
    } else {
      all.push({ ...student, updatedAt: Date.now() });
    }
    this.saveAllStudents(all);
  }

  // Clear students for current room (Teacher reset action)
  public clearStudentsByRoom(roomPassword: string): void {
    const all = this.getAllStudents();
    const remaining = all.filter((s) => s.roomPassword !== roomPassword.trim());
    this.saveAllStudents(remaining);
  }

  // Add realistic demo students for class demo
  public addDemoStudents(roomPassword: string): void {
    const demoNames = [
      '5반 김민준',
      '도형탐정 이서연',
      '수학마스터 박도윤',
      '대칭요정 정하은',
      '빛나는 최준우',
      '기하학 천재 윤지아',
    ];
    const demoScores = [4650, 3900, 3450, 2800, 2200, 1600];
    const demoLevels = [3, 3, 2, 2, 1, 1];
    const demoSolved = [8, 7, 6, 5, 4, 3];
    const demoCombos = [6, 4, 4, 3, 2, 2];

    const current = this.getAllStudents();
    const newStudents: StudentRecord[] = demoNames.map((name, i) => ({
      id: `demo-${Date.now()}-${i}`,
      nickname: name,
      roomPassword: roomPassword.trim(),
      score: demoScores[i],
      level: demoLevels[i],
      solvedCount: demoSolved[i],
      maxCombo: demoCombos[i],
      status: demoLevels[i] === 3 ? 'cleared' : 'playing',
      updatedAt: Date.now() - (i * 45000),
    }));

    this.saveAllStudents([...current, ...newStudents]);
  }
}

export const classroomSync = new ClassroomSyncManager();
