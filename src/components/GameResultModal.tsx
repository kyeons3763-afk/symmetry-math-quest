import React, { useState } from 'react';
import { Trophy, Star, ArrowRight, RotateCcw, Award, Sparkles, Clock, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';

interface GameResultModalProps {
  type: 'levelClear' | 'allClear' | 'timeUp';
  currentLevel: 1 | 2 | 3;
  score: number;
  timeRemainingSeconds: number;
  maxCombo: number;
  solvedCount: number;
  onNextLevel: () => void;
  onRestart: () => void;
  onSaveScore: (playerName: string) => void;
}

export const GameResultModal: React.FC<GameResultModalProps> = ({
  type,
  currentLevel,
  score,
  timeRemainingSeconds,
  maxCombo,
  solvedCount,
  onNextLevel,
  onRestart,
  onSaveScore,
}) => {
  const [playerName, setPlayerName] = useState('초등 5학년 수학왕');
  const [hasSaved, setHasSaved] = useState(false);

  // Trigger confetti on mount if victory
  React.useEffect(() => {
    if (type === 'levelClear' || type === 'allClear') {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Fallback gracefully
      }
    }
  }, [type]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || hasSaved) return;
    onSaveScore(playerName.trim());
    setHasSaved(true);
  };

  const getTitleForScore = (s: number) => {
    if (s >= 5000) return '기하학의 제왕';
    if (s >= 3500) return '대칭 마스터';
    if (s >= 2000) return '선과 점의 달인';
    return '대칭 탐험대원';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col p-6 sm:p-8 text-center">
        {/* Visual Badge Icon */}
        <div className="mx-auto mb-4 relative">
          {type === 'levelClear' && (
            <div className="w-20 h-20 rounded-2xl bg-amber-100 flex items-center justify-center shadow-inner">
              <Star className="w-10 h-10 text-amber-500 fill-amber-400 animate-bounce" />
            </div>
          )}
          {type === 'allClear' && (
            <div className="w-24 h-24 rounded-2xl bg-indigo-100 flex items-center justify-center shadow-lg border-2 border-indigo-200">
              <Trophy className="w-14 h-14 text-indigo-600 animate-pulse" />
            </div>
          )}
          {type === 'timeUp' && (
            <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center">
              <Clock className="w-10 h-10 text-slate-500" />
            </div>
          )}
        </div>

        {/* Title */}
        {type === 'levelClear' && (
          <>
            <h2 className="text-2xl font-extrabold text-slate-900">
              {currentLevel}단계 완료 축하합니다!
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              {currentLevel === 1 ? '선대칭도형을 완벽히 마스터하셨어요!' : '점대칭도형의 원리를 정확히 파악하셨어요!'}
            </p>
          </>
        )}

        {type === 'allClear' && (
          <>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-indigo-950">
              대칭도형 마스터 챌린지 올클리어!
            </h2>
            <div className="mt-1 text-sm font-bold text-amber-600 flex items-center justify-center gap-1">
              <Sparkles className="w-4 h-4" />
              <span>칭호 획득: [{getTitleForScore(score)}]</span>
            </div>
          </>
        )}

        {type === 'timeUp' && (
          <>
            <h2 className="text-2xl font-extrabold text-slate-900">
              5분 제한 시간이 끝났습니다!
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              정말 훌륭한 도전이었어요! 이번 게임에서 달성한 기록을 확인해 보세요.
            </p>
          </>
        )}

        {/* Score Statistics Box */}
        <div className="my-6 p-4 bg-slate-50 rounded-2xl border border-slate-200/80 grid grid-cols-3 gap-2 text-center">
          <div className="p-2">
            <div className="text-xs text-slate-500 font-medium">최종 점수</div>
            <div className="text-lg sm:text-xl font-extrabold text-indigo-600 font-mono tabular-nums mt-0.5">
              {score.toLocaleString()}
            </div>
          </div>
          <div className="p-2 border-x border-slate-200">
            <div className="text-xs text-slate-500 font-medium">최대 콤보</div>
            <div className="text-lg sm:text-xl font-extrabold text-rose-500 font-mono tabular-nums mt-0.5 flex items-center justify-center gap-1">
              <Flame className="w-4 h-4" />
              {maxCombo}
            </div>
          </div>
          <div className="p-2">
            <div className="text-xs text-slate-500 font-medium">해결한 문제</div>
            <div className="text-lg sm:text-xl font-extrabold text-emerald-600 font-mono tabular-nums mt-0.5">
              {solvedCount} 문제
            </div>
          </div>
        </div>

        {/* Player Name Form for Leaderboard (on allClear or timeUp) */}
        {(type === 'allClear' || type === 'timeUp') && (
          <form onSubmit={handleSave} className="mb-6 p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 text-left">
            <label className="block text-xs font-bold text-indigo-900 mb-1.5">
              명예의 전당에 내 이름을 등록하세요!
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                disabled={hasSaved}
                maxLength={12}
                className="flex-1 px-3 py-2 text-sm bg-white rounded-xl border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
                placeholder="이름이나 별명 입력"
              />
              <button
                type="submit"
                disabled={hasSaved || !playerName.trim()}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  hasSaved
                    ? 'bg-emerald-600 text-white cursor-default'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
                }`}
              >
                {hasSaved ? '등록 완료!' : '등록하기'}
              </button>
            </div>
          </form>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
          {type === 'levelClear' && (
            <button
              onClick={onNextLevel}
              className="w-full sm:w-auto px-6 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>다음 {currentLevel + 1}단계로 전진!</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {(type === 'allClear' || type === 'timeUp') && (
            <button
              onClick={onRestart}
              className="w-full sm:w-auto px-6 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>새 게임 도전하기</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
