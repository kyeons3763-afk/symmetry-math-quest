import React, { useState } from 'react';
import { X, BookOpen, CheckCircle2, ArrowRight } from 'lucide-react';

interface ConceptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConceptModal: React.FC<ConceptModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'line' | 'point' | 'tips'>('line');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">5학년 2학기 수학 개념 쏙쏙!</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls (Functional buttons) */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('line')}
            className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'line'
                ? 'border-indigo-600 text-indigo-600 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            1. 선대칭도형
          </button>
          <button
            onClick={() => setActiveTab('point')}
            className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'point'
                ? 'border-indigo-600 text-indigo-600 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            2. 점대칭도형
          </button>
          <button
            onClick={() => setActiveTab('tips')}
            className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'tips'
                ? 'border-indigo-600 text-indigo-600 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            3. 모눈종이 꿀팁
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700">
          {activeTab === 'line' && (
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50/70 rounded-xl border border-indigo-100">
                <h3 className="font-bold text-indigo-900 text-base mb-1">선대칭도형이란?</h3>
                <p className="text-slate-700 leading-relaxed">
                  한 직선을 따라 반으로 접었을 때, <span className="font-semibold text-indigo-700">완전히 겹치는 도형</span>을 선대칭도형이라고 합니다.
                  이때 접는 기준이 되는 선을 <span className="font-semibold text-rose-600">대칭축</span>이라고 부릅니다.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-2">꼭 알아야 할 3가지 핵심 성질:</h4>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900">대응점의 거리:</strong> 각각의 대응점에서 대칭축까지의 거리는 서로 같습니다. (왼쪽으로 3칸이면 오른쪽으로도 3칸!)
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900">수직 관계:</strong> 대응점끼리 이은 선분은 대칭축과 <span className="text-indigo-600 font-semibold">수직(90도)</span>으로 만납니다.
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900">대응변과 대응각:</strong> 서로 겹치는 대응변의 길이와 대응각의 크기는 완벽히 같습니다.
                    </div>
                  </li>
                </ul>
              </div>

              {/* Diagram simulation */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center">
                <div className="text-xs text-slate-500 mb-2">선대칭도형 접기 원리</div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-xs font-semibold text-indigo-700">점 ㄱ (거리 3칸)</div>
                    <div className="w-12 h-1 bg-indigo-500 my-1 mx-auto"></div>
                  </div>
                  <div className="px-2 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded">
                    대칭축
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-semibold text-emerald-700">대응점 ㄱ' (거리 3칸)</div>
                    <div className="w-12 h-1 bg-emerald-500 my-1 mx-auto"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'point' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-100">
                <h3 className="font-bold text-amber-950 text-base mb-1">점대칭도형이란?</h3>
                <p className="text-slate-700 leading-relaxed">
                  한 점을 중심으로 <span className="font-semibold text-amber-800">180도 돌렸을 때</span> 처음 도형과 완전히 겹치는 도형을 점대칭도형이라고 합니다.
                  이때 회전의 기준이 되는 점을 <span className="font-semibold text-orange-600">대칭의 중심 (점 ㅇ)</span>이라고 합니다.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-2">꼭 알아야 할 3가지 핵심 성질:</h4>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900">중심 통과:</strong> 대응점끼리 이은 선분은 <span className="text-orange-600 font-semibold">반드시 대칭의 중심을 지납니다</span>.
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900">같은 거리:</strong> 대칭의 중심에서 각 대응점까지의 거리는 서로 같습니다.
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900">대표 도형:</strong> 평행사변형, 직사각형, 마름모, 원 등은 모두 점대칭도형입니다.
                    </div>
                  </li>
                </ul>
              </div>

              {/* Diagram simulation */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center">
                <div className="text-xs text-slate-500 mb-2">점대칭도형 180도 회전 원리</div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-indigo-700">점 ㄱ (왼쪽 위)</span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-bold rounded">
                    대칭의 중심 (점 ㅇ) 통과
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-bold text-emerald-700">대응점 ㄱ' (오른쪽 아래)</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tips' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-100">
                <h3 className="font-bold text-emerald-950 text-base mb-1">모눈종이에서 실수 없이 점 찍는 3초 비법!</h3>
                <p className="text-slate-700 leading-relaxed">
                  어려워 보이지만 칸 수만 세면 100점을 맞을 수 있어요!
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="font-bold text-slate-900 mb-1">선대칭 점 찾기</div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    꼭짓점에서 빨간 대칭축까지 똑바로 몇 칸 가는지 세어보세요. 대칭축을 건너서 같은 칸 수만큼 더 가면 바로 대응점!
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="font-bold text-slate-900 mb-1">점대칭 점 찾기</div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    점 ㅇ(대칭의 중심)까지 가로로 몇 칸, 세로로 몇 칸 가는지 세어보세요. 점 ㅇ에서 같은 방향으로 한 번 더 이동하면 정답!
                  </p>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900">
                💡 <strong>게임 아이템 활용법:</strong> 헷갈릴 때는 화면 아래의 [돋보기] 아이템을 누르면 다음 대응점 위치를 미리 깜빡여줍니다!
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            이해했어요! 게임 계속하기
          </button>
        </div>
      </div>
    </div>
  );
};
