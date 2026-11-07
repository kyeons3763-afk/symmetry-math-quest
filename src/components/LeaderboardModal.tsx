import React from 'react';
import { X, Trophy, Medal, Award, Flame, Calendar, Trash2 } from 'lucide-react';
import { LeaderboardRecord } from '../types';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: LeaderboardRecord[];
  onClearRecords: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  records,
  onClearRecords,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-amber-50/50">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-slate-900">명예의 전당 (리더보드)</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
            <span>브라우저에 저장된 나의 최고 기록 목록입니다.</span>
            {records.length > 0 && (
              <button
                onClick={onClearRecords}
                className="flex items-center gap-1 text-rose-500 hover:text-rose-700 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                기록 초기화
              </button>
            )}
          </div>

          {records.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Award className="w-12 h-12 mx-auto mb-2 text-slate-300 stroke-1" />
              <p className="text-sm font-medium">아직 등록된 기록이 없습니다.</p>
              <p className="text-xs text-slate-400 mt-1">지금 게임을 플레이하고 첫 번째 명예의 전당 주인공이 되어보세요!</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {records.map((rec, idx) => {
                const isTop1 = idx === 0;
                const isTop2 = idx === 1;
                const isTop3 = idx === 2;

                return (
                  <div
                    key={rec.id || idx}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                      isTop1
                        ? 'bg-amber-50/80 border-amber-200 shadow-xs'
                        : isTop2
                        ? 'bg-slate-50 border-slate-200'
                        : isTop3
                        ? 'bg-orange-50/40 border-orange-200'
                        : 'bg-white border-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 text-center font-bold font-mono">
                        {isTop1 ? (
                          <span className="text-amber-500 text-lg">🥇</span>
                        ) : isTop2 ? (
                          <span className="text-slate-400 text-lg">🥈</span>
                        ) : isTop3 ? (
                          <span className="text-amber-700 text-lg">🥉</span>
                        ) : (
                          <span className="text-slate-500 text-sm">#{idx + 1}</span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{rec.name}</span>
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {rec.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span>{rec.level}단계 도달</span>
                          <span>·</span>
                          <span className="flex items-center gap-0.5 text-rose-500">
                            <Flame className="w-3 h-3" />
                            최대 {rec.maxCombo}콤보
                          </span>
                          <span>·</span>
                          <span className="flex items-center gap-0.5 text-slate-400">
                            <Calendar className="w-3 h-3" />
                            {rec.date}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-bold text-indigo-600 font-mono tabular-nums">
                        {rec.score.toLocaleString()} 점
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {Math.floor(rec.timeTakenSeconds / 60)}분 {rec.timeTakenSeconds % 60}초 소요
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
