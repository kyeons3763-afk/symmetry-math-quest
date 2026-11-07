import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Trophy,
  BookOpen,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  Sparkles,
  Clock,
  Flame,
  CheckCircle,
  HelpCircle,
  ChevronRight,
  ShieldAlert,
  Award,
  User,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PROBLEMS } from './data/problems';
import { Problem, GridPoint, LeaderboardRecord, Inventory, StudentRecord } from './types';
import { sound } from './utils/audio';
import { classroomSync } from './utils/classroomSync';
import { TopBar } from './components/TopBar';
import { GridCanvas } from './components/GridCanvas';
import { ItemBar } from './components/ItemBar';
import { ErrorFeedbackBanner } from './components/ErrorFeedbackBanner';
import { ConceptModal } from './components/ConceptModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { GameResultModal } from './components/GameResultModal';
import { StudentLoginModal } from './components/StudentLoginModal';
import { TeacherDashboard } from './components/TeacherDashboard';

// Generated image assets
const MASCOT_IMG = '/src/assets/images/math_quest_mascot_1794016355758.jpg';
const BADGE_LINE_IMG = '/src/assets/images/badge_line_symmetry_1794016356934.jpg';
const BADGE_POINT_IMG = '/src/assets/images/badge_point_symmetry_1794016357520.jpg';
const HERO_WORLD_IMG = '/src/assets/images/hero_geometry_world_1794016357999.jpg';

const TOTAL_TIME_SECONDS = 300; // 5분 = 300초

export default function App() {
  // Navigation / Modal States
  const [isConceptOpen, setIsConceptOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isTeacherOpen, setIsTeacherOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Student Authentication / Room Session
  const [currentStudent, setCurrentStudent] = useState<StudentRecord | null>(() => {
    try {
      const saved = sessionStorage.getItem('symmetry_active_student');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return null;
  });
  const [isLoginOpen, setIsLoginOpen] = useState(() => {
    // If not logged in yet, prompt login
    return !sessionStorage.getItem('symmetry_active_student');
  });

  // Game Progress States
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'levelClear' | 'allClear' | 'timeUp'>('intro');
  const [currentLevel, setCurrentLevel] = useState<1 | 2 | 3>(1);
  const [problemIdx, setProblemIdx] = useState(0);

  // Drawing States
  const [userPoints, setUserPoints] = useState<GridPoint[]>([]);
  const [hintPoint, setHintPoint] = useState<GridPoint | null>(null);
  const [showGuideLine, setShowGuideLine] = useState(false);
  // Indices of user points that are marked red/wrong
  const [wrongUserIndices, setWrongUserIndices] = useState<number[]>([]);
  const [isSuccessAnimating, setIsSuccessAnimating] = useState(false);

  // Game Mechanics: Score, Timer, Combo, Items
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME_SECONDS);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [solvedCount, setSolvedCount] = useState(0);

  const [inventory, setInventory] = useState<Inventory>({
    hints: 3,
    timeBonus: 2,
    doubleScore: false,
    doubleScoreCount: 1,
  });

  // Leaderboard Records in LocalStorage
  const [leaderboard, setLeaderboard] = useState<LeaderboardRecord[]>(() => {
    try {
      const saved = localStorage.getItem('symmetry_quest_leaderboard');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return [];
  });

  // Filter problems for current level
  const levelProblems = useMemo(() => {
    return PROBLEMS.filter((p) => p.level === currentLevel);
  }, [currentLevel]);

  const currentProblem: Problem = useMemo(() => {
    return levelProblems[problemIdx % levelProblems.length] || levelProblems[0];
  }, [levelProblems, problemIdx]);

  // Sync sound controller
  useEffect(() => {
    setSoundEnabled(sound.enabled);
  }, []);

  const handleToggleSound = () => {
    const newState = sound.toggleSound();
    setSoundEnabled(newState);
  };

  // Sync score and level to Teacher Classroom real-time board
  const syncStudentProgress = useCallback(
    (newScore: number, newLevel: number, newSolved: number, newMaxCombo: number, status: 'playing' | 'cleared' | 'timeUp') => {
      if (!currentStudent) return;
      const updated: StudentRecord = {
        ...currentStudent,
        score: newScore,
        level: newLevel,
        solvedCount: newSolved,
        maxCombo: newMaxCombo,
        status,
        updatedAt: Date.now(),
      };
      setCurrentStudent(updated);
      try {
        sessionStorage.setItem('symmetry_active_student', JSON.stringify(updated));
      } catch (e) {
        // ignore
      }
      classroomSync.upsertStudent(updated);
    },
    [currentStudent]
  );

  // 5-minute Countdown Timer
  useEffect(() => {
    let timerId: number | undefined;
    if (isTimerRunning && gameState === 'playing' && timeLeft > 0) {
      timerId = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            setGameState('timeUp');
            sound.playWrong();
            syncStudentProgress(score, currentLevel, solvedCount, maxCombo, 'timeUp');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [isTimerRunning, gameState, timeLeft, score, currentLevel, solvedCount, maxCombo, syncStudentProgress]);

  // Handle student login success
  const handleLoginSuccess = (nickname: string, roomPassword: string) => {
    const student: StudentRecord = {
      id: `std-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      nickname,
      roomPassword,
      score: 0,
      level: 1,
      solvedCount: 0,
      maxCombo: 0,
      status: 'playing',
      updatedAt: Date.now(),
    };
    setCurrentStudent(student);
    try {
      sessionStorage.setItem('symmetry_active_student', JSON.stringify(student));
    } catch (e) {
      // ignore
    }
    classroomSync.upsertStudent(student);
    setIsLoginOpen(false);
  };

  // Start new game
  const handleStartGame = (startLevel: 1 | 2 | 3 = 1) => {
    if (!currentStudent) {
      setIsLoginOpen(true);
      return;
    }
    setCurrentLevel(startLevel);
    setProblemIdx(0);
    setUserPoints([]);
    setHintPoint(null);
    setWrongUserIndices([]);
    setIsSuccessAnimating(false);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setTimeLeft(TOTAL_TIME_SECONDS);
    setIsTimerRunning(true);
    setSolvedCount(0);
    setInventory({
      hints: 3,
      timeBonus: 2,
      doubleScore: false,
      doubleScoreCount: 1,
    });
    setGameState('playing');
    sound.playTap();
    syncStudentProgress(0, startLevel, 0, 0, 'playing');
  };

  // Add a point on grid
  const handleAddPoint = (pt: GridPoint) => {
    if (isSuccessAnimating) return;
    setWrongUserIndices([]);
    setUserPoints((prev) => [...prev, pt]);
  };

  // Remove a point
  const handleRemovePoint = (index: number) => {
    if (isSuccessAnimating) return;
    setWrongUserIndices([]);
    setUserPoints((prev) => prev.filter((_, i) => i !== index));
  };

  // Undo point
  const handleUndoPoint = () => {
    if (userPoints.length === 0 || isSuccessAnimating) return;
    sound.playUndo();
    setWrongUserIndices([]);
    setUserPoints((prev) => prev.slice(0, -1));
  };

  // Clear all points
  const handleClearAll = () => {
    if (userPoints.length === 0 || isSuccessAnimating) return;
    sound.playUndo();
    setWrongUserIndices([]);
    setUserPoints([]);
  };

  // Remove only the wrong red points
  const handleClearWrongPoints = () => {
    if (wrongUserIndices.length === 0) return;
    sound.playUndo();
    setUserPoints((prev) => prev.filter((_, idx) => !wrongUserIndices.includes(idx)));
    setWrongUserIndices([]);
  };

  // ========================================================
  // CHECK ANSWER HANDLER (Order-Independent & Red Error State)
  // ========================================================
  const handleCheckAnswer = () => {
    if (isSuccessAnimating || userPoints.length === 0) return;

    const expected = currentProblem.expectedPoints;

    // Check which user points are correct and which are wrong
    const matchedExpectedIndices = new Set<number>();
    const wrongIndices: number[] = [];

    userPoints.forEach((u, uIdx) => {
      // Find matching expected point that hasn't been claimed yet
      const expIdx = expected.findIndex(
        (exp, eIdx) => exp.x === u.x && exp.y === u.y && !matchedExpectedIndices.has(eIdx)
      );

      if (expIdx !== -1) {
        matchedExpectedIndices.add(expIdx);
      } else {
        wrongIndices.push(uIdx);
      }
    });

    // Case 1: Some user points are wrong coordinates
    if (wrongIndices.length > 0) {
      sound.playWrong();
      setCombo(0);
      setWrongUserIndices(wrongIndices);
      return;
    }

    // Case 2: All current user points are valid, but not all expected points are placed yet
    if (matchedExpectedIndices.size < expected.length) {
      sound.playWrong();
      // Highlight nothing as red since the existing points are valid, but notify student
      alert(`아직 대응점을 다 찍지 않았어요! (필요한 대응점: ${expected.length}개 중 ${userPoints.length}개 찍음)`);
      return;
    }

    // Case 3: 100% Correct! All expected points placed in ANY order!
    handleCorrectAnswer();
  };

  // When answer is correct
  const handleCorrectAnswer = () => {
    sound.playDingDongDang();
    setIsSuccessAnimating(true);
    setWrongUserIndices([]);
    setHintPoint(null);

    // Calculate score
    const newCombo = combo + 1;
    setCombo(newCombo);
    const newMaxCombo = newCombo > maxCombo ? newCombo : maxCombo;
    setMaxCombo(newMaxCombo);

    let earned = currentProblem.baseScore;
    if (newCombo >= 2) {
      earned = Math.round(earned * (1 + (newCombo - 1) * 0.2));
    }
    if (inventory.doubleScore) {
      earned *= 2;
      setInventory((prev) => ({ ...prev, doubleScore: false }));
    }

    const newScore = score + earned;
    const newSolved = solvedCount + 1;
    setScore(newScore);
    setSolvedCount(newSolved);

    // Live sync to teacher dashboard
    syncStudentProgress(newScore, currentLevel, newSolved, newMaxCombo, 'playing');

    // Confetti celebration
    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.65 },
      });
    } catch (e) {
      // ignore
    }

    // Wait for the fold / 180° rotation animation to finish before moving to next problem
    setTimeout(() => {
      setIsSuccessAnimating(false);
      setUserPoints([]);

      const nextProbIdx = problemIdx + 1;
      if (nextProbIdx >= levelProblems.length) {
        if (currentLevel < 3) {
          sound.playLevelUp();
          setGameState('levelClear');
        } else {
          // All 3 Levels Cleared!
          sound.playLevelUp();
          setIsTimerRunning(false);
          setGameState('allClear');
          syncStudentProgress(newScore, currentLevel, newSolved, newMaxCombo, 'cleared');
        }
      } else {
        setProblemIdx(nextProbIdx);
      }
    }, 1400);
  };

  // Item 1: 돋보기 힌트
  const handleUseHint = () => {
    if (inventory.hints <= 0 || isSuccessAnimating) return;
    sound.playItemUse();

    const expected = currentProblem.expectedPoints;
    // Find first expected point not yet clicked by user
    const missingExp = expected.find(
      (exp) => !userPoints.some((u) => u.x === exp.x && u.y === exp.y)
    );
    const targetPt = missingExp || expected[0];

    setHintPoint(targetPt);
    setInventory((prev) => ({ ...prev, hints: prev.hints - 1 }));

    setTimeout(() => {
      setHintPoint(null);
    }, 4500);
  };

  // Item 2: 시간 연장 (+30초)
  const handleUseTimeBonus = () => {
    if (inventory.timeBonus <= 0 || isSuccessAnimating) return;
    sound.playItemUse();
    setTimeLeft((prev) => prev + 30);
    setInventory((prev) => ({ ...prev, timeBonus: prev.timeBonus - 1 }));
  };

  // Item 3: 2배 부스터
  const handleUseDoubleScore = () => {
    if (inventory.doubleScoreCount <= 0 || inventory.doubleScore || isSuccessAnimating) return;
    sound.playItemUse();
    setInventory((prev) => ({
      ...prev,
      doubleScore: true,
      doubleScoreCount: prev.doubleScoreCount - 1,
    }));
  };

  // Next level handler
  const handleNextLevel = () => {
    const nextLvl = (currentLevel + 1) as 1 | 2 | 3;
    setCurrentLevel(nextLvl);
    setProblemIdx(0);
    setUserPoints([]);
    setWrongUserIndices([]);
    setHintPoint(null);
    setIsSuccessAnimating(false);
    setInventory((prev) => ({
      ...prev,
      hints: prev.hints + 1,
      timeBonus: prev.timeBonus + 1,
    }));
    setGameState('playing');
    syncStudentProgress(score, nextLvl, solvedCount, maxCombo, 'playing');
  };

  // Save score to personal leaderboard
  const handleSaveScore = (playerName: string) => {
    const newRecord: LeaderboardRecord = {
      id: `rec-${Date.now()}`,
      name: playerName,
      score,
      level: currentLevel,
      timeTakenSeconds: TOTAL_TIME_SECONDS - timeLeft,
      solvedCount,
      maxCombo,
      date: new Date().toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
      title: score >= 5000 ? '기하학의 제왕' : score >= 3500 ? '대칭 마스터' : score >= 2000 ? '선과 점의 달인' : '대칭 탐험대원',
    };

    const updated = [newRecord, ...leaderboard]
      .sort((a, b) => b.score - a.score)
      .slice(0, 15);

    setLeaderboard(updated);
    try {
      localStorage.setItem('symmetry_quest_leaderboard', JSON.stringify(updated));
    } catch (e) {
      // ignore
    }
  };

  const handleClearRecords = () => {
    setLeaderboard([]);
    try {
      localStorage.removeItem('symmetry_quest_leaderboard');
    } catch (e) {
      // ignore
    }
  };

  // Format time (MM:SS)
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* Top Bar (§2 Contract) */}
      <TopBar
        onOpenConcept={() => setIsConceptOpen(true)}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        onOpenTeacher={() => setIsTeacherOpen(true)}
        onRestart={() => setGameState('intro')}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        currentStudentNickname={currentStudent?.nickname}
        onPrimaryAction={() => (gameState === 'intro' ? handleStartGame(1) : setGameState('intro'))}
        primaryActionLabel={gameState === 'intro' ? '게임 시작' : '메인 화면'}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-4 sm:py-6 flex flex-col justify-center">
        {/* ======================================================== */}
        {/* INTRO / LEVEL SELECTOR SCREEN */}
        {/* ======================================================== */}
        {gameState === 'intro' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Student Welcome Badge */}
            {currentStudent && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-indigo-700 font-semibold">입장 완료 학생</div>
                    <div className="text-base font-extrabold text-slate-900">{currentStudent.nickname} 학생 환영합니다!</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">
                    현재 입장 코드: <strong className="font-mono text-indigo-700">{currentStudent.roomPassword}</strong>
                  </span>
                  <button
                    onClick={() => setIsLoginOpen(true)}
                    className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer text-slate-700"
                  >
                    별명/방 바꾸기
                  </button>
                </div>
              </div>
            )}

            {/* Hero Banner Split */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs grid grid-cols-1 lg:grid-cols-12 items-stretch">
              <div className="p-6 sm:p-10 lg:col-span-7 flex flex-col justify-center space-y-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600">
                  <span>초등학교 5학년 수학 2학기</span>
                  <span aria-hidden="true">·</span>
                  <span>3단원 합동과 대칭</span>
                  <span aria-hidden="true">·</span>
                  <span>5분 타임어택</span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  모눈종이 위에서 펼쳐지는 <br className="hidden sm:inline" />
                  <span className="text-indigo-600">선대칭 & 점대칭</span> 탐험대!
                </h1>

                <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
                  반으로 접었을 때 완전히 겹치는 <strong className="text-slate-800">선대칭도형</strong>과, 180도 돌렸을 때 완전히 겹치는 <strong className="text-slate-800">점대칭도형</strong>을 직접 그려보세요! 대응점을 어떤 순서로 찍든 알맞은 위치라면 멋진 도형이 완성됩니다.
                </p>

                {/* Primary Start Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => handleStartGame(1)}
                    className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 text-sm sm:text-base cursor-pointer"
                  >
                    <Play className="w-5 h-5 fill-white" />
                    <span>1단계부터 도전 시작 (5분)</span>
                  </button>
                  <button
                    onClick={() => setIsConceptOpen(true)}
                    className="px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-indigo-500" />
                    <span>개념 복습하기</span>
                  </button>
                </div>
              </div>

              {/* Hero Image Showcase */}
              <div className="lg:col-span-5 relative min-h-[220px] lg:min-h-full bg-indigo-50">
                <img
                  src={HERO_WORLD_IMG}
                  alt="기하학 모험의 세계"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 to-transparent"></div>
                <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/60 shadow-xs">
                  <img
                    src={MASCOT_IMG}
                    alt="수학 올빼미 마스코트"
                    referrerPolicy="no-referrer"
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="text-xs font-bold text-slate-800">박사 올빼미가 함께해요!</span>
                </div>
              </div>
            </div>

            {/* 3 Level Selectors */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900">도전할 단계를 선택하세요</h2>
                <span className="text-xs text-slate-500">순서대로 클리어하거나 원하는 단계로 바로 시작 가능합니다.</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Level 1 Card */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between group">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center overflow-hidden border border-indigo-100">
                        <img
                          src={BADGE_LINE_IMG}
                          alt="선대칭 뱃지"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700">
                        1단계 (기초)
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition-colors">
                      선대칭도형 완성하기
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      빨간색 대칭축(세로/가로)을 기준으로 반으로 접었을 때 완전히 겹치는 도형을 완성합니다.
                    </p>
                  </div>
                  <button
                    onClick={() => handleStartGame(1)}
                    className="mt-4 w-full py-2.5 px-3 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>1단계 시작</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Level 2 Card */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-amber-300 transition-all flex flex-col justify-between group">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center overflow-hidden border border-amber-100">
                        <img
                          src={BADGE_POINT_IMG}
                          alt="점대칭 뱃지"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">
                        2단계 (발전)
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-slate-900 group-hover:text-amber-600 transition-colors">
                      점대칭도형 완성하기
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      대칭의 중심(주황색 점 ㅇ)을 기준으로 180도 돌렸을 때 처음과 겹치는 도형을 완성합니다.
                    </p>
                  </div>
                  <button
                    onClick={() => handleStartGame(2)}
                    className="mt-4 w-full py-2.5 px-3 bg-amber-50 hover:bg-amber-600 hover:text-white text-amber-800 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>2단계 시작</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Level 3 Card */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between group">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center overflow-hidden border border-purple-100 text-purple-600">
                        <Award className="w-7 h-7" />
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700">
                        3단계 (마스터)
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-slate-900 group-hover:text-purple-600 transition-colors">
                      마스터 챌린지
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      선대칭과 점대칭이 혼합 출제되며, 대각선 대칭축 등 최고난도 문제를 해결합니다.
                    </p>
                  </div>
                  <button
                    onClick={() => handleStartGame(3)}
                    className="mt-4 w-full py-2.5 px-3 bg-purple-50 hover:bg-purple-600 hover:text-white text-purple-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>3단계 시작</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* ACTIVE GAMEPLAY STAGE */}
        {/* ======================================================== */}
        {gameState === 'playing' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Game HUD Bar */}
            <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
              {/* Level & Problem indicator */}
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-extrabold text-xs">
                  {currentLevel}단계 · {currentProblem.type === 'line' ? '선대칭도형' : '점대칭도형'}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  문제 {problemIdx + 1} / {levelProblems.length}
                </span>
              </div>

              {/* Metrics: Timer, Score, Combo */}
              <div className="flex items-center gap-4 sm:gap-6">
                {/* 5-minute Timer */}
                <div
                  className={`flex items-center gap-1.5 font-mono font-bold text-sm sm:text-base tabular-nums ${
                    timeLeft <= 30 ? 'text-rose-600 animate-pulse' : 'text-slate-700'
                  }`}
                >
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>{formatTime(timeLeft)}</span>
                </div>

                {/* Score */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400 font-medium">점수</span>
                  <span className="text-base sm:text-lg font-extrabold text-indigo-600 font-mono tabular-nums">
                    {score.toLocaleString()}
                  </span>
                </div>

                {/* Combo Badge */}
                {combo >= 2 && (
                  <div className="flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full animate-bounce">
                    <Flame className="w-3.5 h-3.5 fill-rose-500" />
                    <span>{combo} COMBO!</span>
                  </div>
                )}
              </div>
            </div>

            {/* Problem Title & Educational Direction */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span>{currentProblem.title}</span>
                  {currentProblem.type === 'line' ? (
                    <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                      접었을 때 겹치게
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                      180° 돌렸을 때 겹치게
                    </span>
                  )}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  대응점을 순서와 상관없이 편하게 찍어보세요! 알맞은 점들을 찍으면 자동으로 도형이 연결됩니다.
                </p>
              </div>

              <div className="text-xs text-slate-400 shrink-0">
                필요 대응점: <strong className="text-emerald-600">{currentProblem.expectedPoints.length}개</strong>
              </div>
            </div>

            {/* Educational Error Feedback Banner (Only shows red points count, no leaks) */}
            <ErrorFeedbackBanner
              wrongCount={wrongUserIndices.length}
              problem={currentProblem}
              onClearWrongPoints={handleClearWrongPoints}
            />

            {/* Main Interactive Grid Canvas */}
            <GridCanvas
              problem={currentProblem}
              userPoints={userPoints}
              onAddPoint={handleAddPoint}
              onRemovePoint={handleRemovePoint}
              hintPoint={hintPoint}
              wrongUserIndices={wrongUserIndices}
              isSuccessAnimating={isSuccessAnimating}
              showGuideLine={showGuideLine}
            />

            {/* Educational Hint Callout */}
            <div className="text-xs text-slate-500 bg-white/70 p-3 rounded-xl border border-slate-200 flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <span>
                <strong>선생님의 힌트:</strong> {currentProblem.educationalTip}
              </span>
            </div>

            {/* Bottom Controls / Items Bar */}
            <ItemBar
              inventory={inventory}
              onUseHint={handleUseHint}
              onUseTimeBonus={handleUseTimeBonus}
              onUseDoubleScore={handleUseDoubleScore}
              onUndoPoint={handleUndoPoint}
              onClearAll={handleClearAll}
              showGuideLine={showGuideLine}
              onToggleGuideLine={() => setShowGuideLine((prev) => !prev)}
              onCheckAnswer={handleCheckAnswer}
              canCheck={userPoints.length > 0}
              canUndo={userPoints.length > 0}
              isSuccessAnimating={isSuccessAnimating}
            />
          </div>
        )}

        {/* ======================================================== */}
        {/* RESULT / VICTORY / TIMEOUT MODAL */}
        {/* ======================================================== */}
        {(gameState === 'levelClear' || gameState === 'allClear' || gameState === 'timeUp') && (
          <GameResultModal
            type={gameState}
            currentLevel={currentLevel}
            score={score}
            timeRemainingSeconds={timeLeft}
            maxCombo={maxCombo}
            solvedCount={solvedCount}
            onNextLevel={handleNextLevel}
            onRestart={() => handleStartGame(1)}
            onSaveScore={handleSaveScore}
          />
        )}
      </main>

      {/* Student Entrance Login Modal */}
      <StudentLoginModal
        isOpen={isLoginOpen}
        onSuccess={handleLoginSuccess}
        onOpenTeacherPage={() => {
          setIsLoginOpen(false);
          setIsTeacherOpen(true);
        }}
      />

      {/* Teacher Dashboard Modal */}
      <TeacherDashboard isOpen={isTeacherOpen} onClose={() => setIsTeacherOpen(false)} />

      {/* Concept Guide Modal */}
      <ConceptModal isOpen={isConceptOpen} onClose={() => setIsConceptOpen(false)} />

      {/* Leaderboard Modal */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        records={leaderboard}
        onClearRecords={handleClearRecords}
      />
    </div>
  );
}
