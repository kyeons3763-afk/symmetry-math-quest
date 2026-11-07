import React, { useState } from 'react';
import { X, Trophy, Medal, Award, Flame, Calendar, Trash2, Database, Users, Globe } from 'lucide-react';
import { LeaderboardRecord } from '../types';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: LeaderboardRecord[];
  currentRoomPassword?: string;
  onClearRecords?: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  records,
  currentRoomPassword,
  onClearRecords,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'room'>('all');

  if (!isOpen) return null;

  const displayRecords = records.filter((rec) => {
    if (filterMode === 'room' && currentRoomPassword) {
      return (rec as unknown as { roomPassword?: string }).roomPassword === currentRoomPassword;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-amber-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
              <Trophy className="w-5 h-5 fill-amber-500 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">
                명예의 전당 (실시간 리더보드)
              </h2>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>구글 Firebase Firestore 실시간 연동 중</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Tabs */}
        {currentRoomPassword && (
          <div className="flex items-center gap-1 px-6 pt-3 pb-1 bg-slate-50 border-b border-slate-100">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-white text-indigo-700 shadow-2xs border border-indigo-100'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>전체 순위</span>
            </button>
            <button
              onClick={() => setFilterMode('room')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                filterMode === 'room'
                  ? 'bg-white text-indigo-700 shadow-2xs border border-indigo-100'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>우리 반 순위 (방 코드: {currentRoomPassword})</span>
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
            <span>실시간으로 갱신되는 명예의 전당 Top 30 기록입니다.</span>
            {onClearRecords && (
              <button
                onClick={onClearRecords}
                className="flex items-center gap-1 text-rose-500 hover:text-rose-700 transition-colors cursor-pointer text-[11px]"
              >
                <Trash2 className="w-3 h-3" />
                로컬 기록 정리
              </button>
            )}
          </div>

          {displayRecords.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Award className="w-12 h-12 mx-auto mb-2 text-slate-300 stroke-1" />
              <p className="text-sm font-medium">아직 등록된 기록이 없습니다.</p>
              <p className="text-xs text-slate-400 mt-1">
                지금 문제를 풀고 첫 번째 명예의 전당 주인공이 되어보세요!
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {displayRecords.map((rec, idx) => {
                const isTop1 = idx === 0;
                const isTop2 = idx === 1;
                const isTop3 = idx === 2;

                return (
                  <div
                    key={rec.id || idx}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                      isTop1
                        ? 'bg-amber-50/90 border-amber-300 shadow-xs ring-1 ring-amber-200'
                        : isTop2
                        ? 'bg-slate-50 border-slate-200 shadow-2xs'
                        : isTop3
                        ? 'bg-orange-50/50 border-orange-200'
                        : 'bg-white border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 text-center font-bold font-mono">
                        {isTop1 ? (
                          <span className="text-amber-500 text-xl drop-shadow-xs">🥇</span>
                        ) : isTop2 ? (
                          <span className="text-slate-400 text-xl">🥈</span>
                        ) : isTop3 ? (
                          <span className="text-amber-700 text-xl">🥉</span>
                        ) : (
                          <span className="text-slate-500 text-sm font-semibold">#{idx + 1}</span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 text-sm">{rec.name}</span>
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {rec.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span className="font-medium">{rec.level}단계 도달</span>
                          <span>·</span>
                          <span className="flex items-center gap-0.5 text-rose-600 font-semibold">
                            <Flame className="w-3 h-3 fill-rose-500 text-rose-500" />
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
                      <div className="text-base sm:text-lg font-extrabold text-indigo-600 font-mono tabular-nums">
                        {rec.score.toLocaleString()} 점
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
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
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-indigo-500" />
            <span>Firestore DB 실시간 반영</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs sm:text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
