import React from 'react';
import { AlertCircle, HelpCircle, RotateCcw } from 'lucide-react';
import { Problem } from '../types';

interface ErrorFeedbackBannerProps {
  wrongCount: number;
  problem: Problem;
  onClearWrongPoints: () => void;
}

export const ErrorFeedbackBanner: React.FC<ErrorFeedbackBannerProps> = ({
  wrongCount,
  problem,
  onClearWrongPoints,
}) => {
  if (wrongCount <= 0) return null;

  return (
    <div className="w-full bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 sm:p-5 shadow-xs transition-all animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-start gap-3.5">
        <div className="p-2 bg-rose-100 text-rose-700 rounded-xl shrink-0 mt-0.5">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-rose-900">
              앗! 빨간색으로 표시된 대응점을 다시 확인해 볼까요?
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 bg-rose-200 text-rose-950 rounded-full">
              틀린 대응점 {wrongCount}개
            </span>
          </div>

          <p className="text-sm text-rose-800 mt-1 leading-relaxed font-medium">
            모눈종이 위에 <span className="font-bold text-rose-700 underline">빨간색으로 빛나는 점</span>이 잘못 찍힌 대응점입니다.
            {problem.type === 'line'
              ? ' 대칭축에서 수직으로 떨어진 칸 수를 다시 세어보세요!'
              : ' 대칭의 중심(점 ㅇ)을 지나 정반대 방향으로 떨어진 칸 수를 다시 세어보세요!'}
          </p>

          <div className="mt-3 p-3 bg-white/90 rounded-xl border border-rose-200 text-xs text-slate-700 space-y-1">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
              <span>선생님의 힌트</span>
            </div>
            {problem.type === 'line' ? (
              <p>
                빨간 점을 탭하여 지우고, 원래 꼭짓점에서 <span className="text-rose-600 font-bold">빨간 대칭축까지의 칸 수</span>만큼 반대편으로 건너가서 다시 점을 찍어보세요!
              </p>
            ) : (
              <p>
                빨간 점을 탭하여 지우고, 원래 꼭짓점에서 <span className="text-orange-600 font-bold">주황색 점 ㅇ(대칭의 중심)</span>까지 가로·세로 몇 칸 이동하는지 확인한 뒤, 점 ㅇ에서 한 번 더 똑같이 이동해보세요!
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 mt-3.5">
            <button
              onClick={onClearWrongPoints}
              className="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>틀린 빨간 점 지우기</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
