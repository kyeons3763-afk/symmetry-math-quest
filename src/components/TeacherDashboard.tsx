import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  KeyRound,
  Users,
  Trophy,
  Flame,
  RotateCcw,
  Download,
  PlusCircle,
  Trash2,
  Tv,
  Check,
  Copy,
  ArrowLeft,
  Clock,
  Sparkles,
} from 'lucide-react';
import { classroomSync, DEFAULT_ROOM_PASSWORD } from '../utils/classroomSync';
import { StudentRecord } from '../types';
import { sound } from '../utils/audio';

interface TeacherDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ isOpen, onClose }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // Password configuration
  const [currentRoomPwd, setCurrentRoomPwd] = useState(classroomSync.getRoomPassword());
  const [newRoomPwdInput, setNewRoomPwdInput] = useState(classroomSync.getRoomPassword());
  const [pwdSaveSuccess, setPwdSaveSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  // Student real-time records
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [isProjectorMode, setIsProjectorMode] = useState(false);

  // Load and subscribe to student updates
  useEffect(() => {
    const updateList = () => {
      const pwd = classroomSync.getRoomPassword();
      setCurrentRoomPwd(pwd);
      const list = classroomSync.getStudentsByRoom(pwd);
      setStudents(list);
    };

    updateList();
    const unsubscribe = classroomSync.subscribe(updateList);
    return () => unsubscribe();
  }, []);

  if (!isOpen) return null;

  // Teacher PIN check
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPin = classroomSync.getTeacherPin();
    if (pinInput.trim() === correctPin || pinInput.trim() === '1234') {
      setIsAuthenticated(true);
      setPinError('');
      sound.playTap();
    } else {
      setPinError('선생님 관리자 비밀번호가 틀렸습니다. (기본값: 1234)');
      sound.playWrong();
    }
  };

  // Change room password
  const handleSaveRoomPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomPwdInput.trim()) return;
    classroomSync.setRoomPassword(newRoomPwdInput.trim());
    setCurrentRoomPwd(newRoomPwdInput.trim());
    setPwdSaveSuccess(true);
    sound.playTap();
    setTimeout(() => setPwdSaveSuccess(false), 2500);
  };

  // Copy password to clipboard
  const handleCopyPassword = () => {
    navigator.clipboard.writeText(currentRoomPwd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Clear students
  const handleClearStudents = () => {
    if (window.confirm(`'${currentRoomPwd}' 방의 모든 학생 점수 기록을 초기화하시겠습니까?`)) {
      classroomSync.clearStudentsByRoom(currentRoomPwd);
      sound.playUndo();
    }
  };

  // Add demo students
  const handleAddDemo = () => {
    classroomSync.addDemoStudents(currentRoomPwd);
    sound.playTap();
  };

  // Download CSV
  const handleDownloadCsv = () => {
    if (students.length === 0) return;
    const headers = ['순위', '별명/이름', '점수', '단계', '해결문제수', '최대콤보', '상태'];
    const rows = students.map((s, idx) => [
      idx + 1,
      `"${s.nickname}"`,
      s.score,
      `${s.level}단계`,
      s.solvedCount,
      s.maxCombo,
      s.status === 'cleared' ? '올클리어' : s.status === 'timeUp' ? '시간종료' : '진행중',
    ]);
    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `5학년_대칭도형_순위표_${currentRoomPwd}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`relative w-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col transition-all ${
          isProjectorMode ? 'max-w-6xl h-[95vh]' : 'max-w-4xl max-h-[92vh]'
        }`}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                선생님 전용 관리자 대시보드
              </h2>
              <p className="text-xs text-slate-400">
                실시간 학생 점수 랭킹 및 입장 비밀번호 설정
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={() => setIsProjectorMode(!isProjectorMode)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
                  isProjectorMode
                    ? 'bg-amber-400 text-slate-950 border-amber-400'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
                title="교실 TV/프로젝터 전체화면 뷰"
              >
                <Tv className="w-3.5 h-3.5" />
                <span>{isProjectorMode ? '기본 모드' : '프로젝터 모드'}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>학생 화면으로</span>
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* TEACHER PIN AUTH SCREEN */}
        {/* ======================================================== */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center max-w-md mx-auto my-auto">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-4 text-indigo-600">
              <KeyRound className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">
              선생님 관리자 비밀번호
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              교사용 대시보드에 접근하려면 관리자 비밀번호를 입력해주세요. <br />
              (초기 기본 비밀번호: <strong className="text-indigo-600 font-mono">1234</strong>)
            </p>

            {pinError && (
              <div className="w-full mb-4 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                {pinError}
              </div>
            )}

            <form onSubmit={handlePinSubmit} className="w-full space-y-3">
              <input
                type="password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="관리자 PIN 입력 (1234)"
                className="w-full px-4 py-2.5 text-center font-mono text-base bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all cursor-pointer"
              >
                관리자 페이지 입장
              </button>
            </form>
          </div>
        ) : (
          /* ======================================================== */
          /* AUTHENTICATED TEACHER DASHBOARD */
          /* ======================================================== */
          <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
            {/* 1. ROOM PASSWORD CONFIGURATION ROW */}
            <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              {/* Active Password Badge */}
              <div className="md:col-span-5 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <div className="text-xs text-slate-500 font-medium mb-1">
                  학생들이 입력할 현재 입장 비밀번호
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl sm:text-3xl font-extrabold text-indigo-600 font-mono tracking-wider">
                    {currentRoomPwd}
                  </span>
                  <button
                    onClick={handleCopyPassword}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? '복사됨!' : '비밀번호 복사'}</span>
                  </button>
                </div>
                <div className="text-[11px] text-slate-400 mt-1.5">
                  칠판에 이 비밀번호를 적어주시면 학생들이 바로 입장할 수 있습니다.
                </div>
              </div>

              {/* Form to Change Password */}
              <form onSubmit={handleSaveRoomPassword} className="md:col-span-7 flex flex-col sm:flex-row items-end gap-2">
                <div className="flex-1 w-full">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    새 입장 비밀번호로 변경하기
                  </label>
                  <input
                    type="text"
                    value={newRoomPwdInput}
                    onChange={(e) => setNewRoomPwdInput(e.target.value)}
                    placeholder="새 비밀번호 입력 (예: 502, 수학대장)"
                    maxLength={15}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold rounded-xl text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer shadow-xs"
                >
                  {pwdSaveSuccess ? '변경 완료!' : '비밀번호 저장'}
                </button>
              </form>
            </div>

            {/* 2. LIVE LEADERBOARD TABLE */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              {/* Action Toolbar */}
              <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span className="font-bold text-sm text-slate-900">
                    실시간 접속 학생 순위 ({students.length}명 참가 중)
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    실시간 동기화
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAddDemo}
                    className="px-2.5 py-1.5 text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    title="수업 시연을 위해 가상 학생 데이터를 추가합니다."
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-indigo-600" />
                    <span>시연용 학생 추가</span>
                  </button>

                  <button
                    onClick={handleDownloadCsv}
                    disabled={students.length === 0}
                    className="px-2.5 py-1.5 text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-40"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>엑셀(CSV) 저장</span>
                  </button>

                  <button
                    onClick={handleClearStudents}
                    disabled={students.length === 0}
                    className="px-2.5 py-1.5 text-xs font-semibold bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-40"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>목록 초기화</span>
                  </button>
                </div>
              </div>

              {/* Table */}
              {students.length === 0 ? (
                <div className="py-14 text-center text-slate-400">
                  <Users className="w-12 h-12 mx-auto mb-2 text-slate-300 stroke-1" />
                  <p className="text-sm font-semibold text-slate-600">
                    아직 입장한 학생이 없습니다.
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    학생들에게 비밀번호 <strong className="text-indigo-600">[{currentRoomPwd}]</strong>를 알려주시면
                    문제를 푸는 즉시 실시간 순위가 나타납니다.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-100/60 text-slate-600 font-bold">
                        <th className="py-3 px-4 w-16 text-center">순위</th>
                        <th className="py-3 px-4">학생 별명 (이름)</th>
                        <th className="py-3 px-4 text-right">점수</th>
                        <th className="py-3 px-4 text-center">진행 단계</th>
                        <th className="py-3 px-4 text-center">해결 문제</th>
                        <th className="py-3 px-4 text-center">최대 콤보</th>
                        <th className="py-3 px-4 text-center">상태</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {students.map((student, idx) => {
                        const isTop1 = idx === 0;
                        const isTop2 = idx === 1;
                        const isTop3 = idx === 2;

                        return (
                          <tr
                            key={student.id}
                            className={`hover:bg-slate-50 transition-colors ${
                              isTop1 ? 'bg-amber-50/40 font-semibold' : ''
                            }`}
                          >
                            <td className="py-3 px-4 text-center font-bold font-mono">
                              {isTop1 ? (
                                <span className="text-base text-amber-500">🥇 1위</span>
                              ) : isTop2 ? (
                                <span className="text-base text-slate-400">🥈 2위</span>
                              ) : isTop3 ? (
                                <span className="text-base text-amber-700">🥉 3위</span>
                              ) : (
                                <span className="text-slate-500">{idx + 1}위</span>
                              )}
                            </td>
                            <td className="py-3 px-4 font-bold text-slate-900">
                              {student.nickname}
                            </td>
                            <td className="py-3 px-4 text-right font-extrabold text-indigo-600 font-mono tabular-nums text-base">
                              {student.score.toLocaleString()} 점
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold text-xs border border-indigo-100">
                                {student.level}단계
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center font-mono tabular-nums text-slate-700">
                              {student.solvedCount} 문제
                            </td>
                            <td className="py-3 px-4 text-center font-mono tabular-nums text-rose-600 font-bold">
                              {student.maxCombo}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {student.status === 'cleared' ? (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                                  올클리어 👑
                                </span>
                              ) : student.status === 'timeUp' ? (
                                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium text-xs">
                                  시간 종료
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold text-xs animate-pulse">
                                  도전 중 🔥
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
