import React from 'react';
import { Volume2, VolumeX, BookOpen, Trophy, RotateCcw, ShieldCheck, User } from 'lucide-react';

interface TopBarProps {
  onOpenConcept: () => void;
  onOpenLeaderboard: () => void;
  onOpenTeacher: () => void;
  onRestart: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  currentStudentNickname?: string;
  onPrimaryAction?: () => void;
  primaryActionLabel?: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenConcept,
  onOpenLeaderboard,
  onOpenTeacher,
  onRestart,
  soundEnabled,
  onToggleSound,
  currentStudentNickname,
  onPrimaryAction,
  primaryActionLabel = '새 게임 시작',
}) => {
  return (
    <header className="flex items-center justify-between gap-4 sm:gap-8 px-4 sm:px-6 py-3.5 bg-white border-b border-slate-200 sticky top-0 z-40">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onRestart();
          }}
          className="text-base sm:text-lg font-bold tracking-tight text-indigo-950 whitespace-nowrap shrink-0 hover:text-indigo-600 transition-colors"
        >
          대칭도형 마스터 챌린지
        </a>
        {currentStudentNickname && (
          <span className="hidden md:flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            <User className="w-3 h-3 text-indigo-600" />
            <span>{currentStudentNickname}</span>
          </span>
        )}
      </div>

      {/* Zone 2: 4-5 concise single-line text navigation links */}
      <nav className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm font-medium text-slate-600">
        <button
          onClick={onOpenConcept}
          className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <BookOpen className="w-4 h-4 text-indigo-500" />
          <span>개념 쏙쏙</span>
        </button>
        <button
          onClick={onOpenLeaderboard}
          className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Trophy className="w-4 h-4 text-amber-500" />
          <span>순위표</span>
        </button>
        <button
          onClick={onOpenTeacher}
          className="flex items-center gap-1.5 text-indigo-600 font-bold hover:text-indigo-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          title="교사용 페이지 (비밀번호 설정 및 학생 실시간 순위)"
        >
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          <span>선생님 공간</span>
        </button>
        <button
          onClick={onToggleSound}
          className="flex items-center gap-1.5 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          title="효과음 켜기/끄기"
        >
          {soundEnabled ? (
            <>
              <Volume2 className="w-4 h-4 text-emerald-600" />
              <span className="hidden lg:inline">소리 켜짐</span>
            </>
          ) : (
            <>
              <VolumeX className="w-4 h-4 text-slate-400" />
              <span className="hidden lg:inline text-slate-400">음소거</span>
            </>
          )}
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onPrimaryAction}
          className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:scale-95 transition-all shadow-xs whitespace-nowrap shrink-0 cursor-pointer"
        >
          {primaryActionLabel}
        </button>
      </div>
    </header>
  );
};
