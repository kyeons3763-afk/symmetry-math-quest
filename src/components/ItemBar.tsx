import React from 'react';
import { Search, Hourglass, Zap, RotateCcw, Trash2, Eye, Check } from 'lucide-react';
import { Inventory } from '../types';

interface ItemBarProps {
  inventory: Inventory;
  onUseHint: () => void;
  onUseTimeBonus: () => void;
  onUseDoubleScore: () => void;
  onUndoPoint: () => void;
  onClearAll: () => void;
  showGuideLine: boolean;
  onToggleGuideLine: () => void;
  onCheckAnswer: () => void;
  canCheck: boolean;
  canUndo: boolean;
  isSuccessAnimating: boolean;
}

export const ItemBar: React.FC<ItemBarProps> = ({
  inventory,
  onUseHint,
  onUseTimeBonus,
  onUseDoubleScore,
  onUndoPoint,
  onClearAll,
  showGuideLine,
  onToggleGuideLine,
  onCheckAnswer,
  canCheck,
  canUndo,
  isSuccessAnimating,
}) => {
  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
      {/* Item buttons */}
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 w-full sm:w-auto">
        {/* 1. 돋보기 힌트 */}
        <button
          onClick={onUseHint}
          disabled={inventory.hints <= 0 || isSuccessAnimating}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all border cursor-pointer ${
            inventory.hints > 0 && !isSuccessAnimating
              ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100 hover:border-amber-300 active:scale-95'
              : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
          }`}
          title="다음 대응점 위치를 깜빡여 알려줍니다."
        >
          <Search className="w-4 h-4 text-amber-600" />
          <span>돋보기 힌트</span>
          <span className="ml-0.5 px-1.5 py-0.2 bg-amber-200 text-amber-900 rounded-full text-[11px] font-bold">
            {inventory.hints}
          </span>
        </button>

        {/* 2. 시간 추가 모래시계 */}
        <button
          onClick={onUseTimeBonus}
          disabled={inventory.timeBonus <= 0 || isSuccessAnimating}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all border cursor-pointer ${
            inventory.timeBonus > 0 && !isSuccessAnimating
              ? 'bg-sky-50 text-sky-800 border-sky-200 hover:bg-sky-100 hover:border-sky-300 active:scale-95'
              : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
          }`}
          title="남은 시간을 30초 늘려줍니다."
        >
          <Hourglass className="w-4 h-4 text-sky-600" />
          <span>+30초 연장</span>
          <span className="ml-0.5 px-1.5 py-0.2 bg-sky-200 text-sky-900 rounded-full text-[11px] font-bold">
            {inventory.timeBonus}
          </span>
        </button>

        {/* 3. 2배 점수 부스터 */}
        <button
          onClick={onUseDoubleScore}
          disabled={inventory.doubleScoreCount <= 0 || inventory.doubleScore || isSuccessAnimating}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all border cursor-pointer ${
            inventory.doubleScore
              ? 'bg-purple-600 text-white border-purple-600 animate-pulse'
              : inventory.doubleScoreCount > 0 && !isSuccessAnimating
              ? 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100 hover:border-purple-300 active:scale-95'
              : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
          }`}
          title="이번 문제 정답 시 점수 2배 획득!"
        >
          <Zap className="w-4 h-4 text-purple-600" />
          <span>{inventory.doubleScore ? '2배 적용 중!' : '2배 부스터'}</span>
          {!inventory.doubleScore && (
            <span className="ml-0.5 px-1.5 py-0.2 bg-purple-200 text-purple-900 rounded-full text-[11px] font-bold">
              {inventory.doubleScoreCount}
            </span>
          )}
        </button>

        {/* Divider */}
        <div className="hidden sm:block h-6 w-px bg-slate-200 mx-1"></div>

        {/* 4. 한 점 지우기 */}
        <button
          onClick={onUndoPoint}
          disabled={!canUndo || isSuccessAnimating}
          className={`flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
            canUndo && !isSuccessAnimating
              ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900 active:scale-95'
              : 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
          }`}
          title="가장 최근에 찍은 점을 하나 취소합니다."
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>한 점 취소</span>
        </button>

        {/* 5. 전체 지우기 */}
        <button
          onClick={onClearAll}
          disabled={!canUndo || isSuccessAnimating}
          className={`flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
            canUndo && !isSuccessAnimating
              ? 'bg-white text-rose-600 border-rose-100 hover:bg-rose-50 active:scale-95'
              : 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
          }`}
          title="내가 찍은 모든 점을 지우고 다시 시작합니다."
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>모두 지우기</span>
        </button>

        {/* 6. 가이드 선 켜기/끄기 */}
        <button
          onClick={onToggleGuideLine}
          className={`flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
            showGuideLine
              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
          title="대칭축/대칭의 중심을 향하는 가이드 선을 켜거나 끕니다."
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{showGuideLine ? '가이드선 ON' : '가이드선 OFF'}</span>
        </button>
      </div>

      {/* Main Action: 정답 확인 버튼 */}
      <button
        onClick={onCheckAnswer}
        disabled={!canCheck || isSuccessAnimating}
        className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer ${
          canCheck && !isSuccessAnimating
            ? 'bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-emerald-200'
            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
        }`}
      >
        <Check className="w-5 h-5 stroke-[2.5]" />
        <span>정답 확인하기</span>
      </button>
    </div>
  );
};
