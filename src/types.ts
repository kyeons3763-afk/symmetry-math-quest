/**
 * Symmetry Quest - Type Definitions
 * 5th Grade Elementary Math Game: Line & Point Symmetry
 */

export type SymmetryType = 'line' | 'point';

export type AxisType = 'vertical' | 'horizontal' | 'diagonal_main';

export interface GridPoint {
  x: number;
  y: number;
}

export interface Problem {
  id: string;
  level: 1 | 2 | 3;
  type: SymmetryType;
  title: string;
  subtitle: string;
  description: string;
  gridSize: number; // e.g., 12 or 14
  // For line symmetry
  axis?: {
    type: AxisType;
    position: number; // coordinate line (e.g., x=6 for vertical, y=6 for horizontal)
  };
  // For point symmetry
  center?: GridPoint;
  // Given vertices (the provided half or shape segment)
  givenPoints: GridPoint[];
  // Vertex labels like 'ㄱ', 'ㄴ', 'ㄷ'
  vertexLabels?: string[];
  // Expected corresponding points in sequence that complete the figure
  expectedPoints: GridPoint[];
  // Educational tip for this specific shape
  educationalTip: string;
  // Base score awarded
  baseScore: number;
}

export interface Inventory {
  hints: number;       // 돋보기: 다음 점 알려주기
  timeBonus: number;   // 모래시계: 30초 추가
  doubleScore: boolean;// 2배 부스터 활성화 여부
  doubleScoreCount: number; // 남은 2배 부스터 개수
}

export interface LeaderboardRecord {
  id: string;
  name: string;
  score: number;
  level: number;
  timeTakenSeconds: number;
  solvedCount: number;
  maxCombo: number;
  date: string;
  title: string;
  roomPassword?: string;
}

// Student session in teacher classroom system
export interface StudentRecord {
  id: string;
  nickname: string;
  roomPassword: string;
  score: number;
  level: number;
  solvedCount: number;
  maxCombo: number;
  status: 'playing' | 'cleared' | 'timeUp';
  updatedAt: number;
}

export interface WrongPointDetail {
  wrongUserIndices: number[]; // indices in userPoints array that are incorrect
  message: string;
}
