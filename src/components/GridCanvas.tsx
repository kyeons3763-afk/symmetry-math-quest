import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Problem, GridPoint } from '../types';
import { sound } from '../utils/audio';

interface GridCanvasProps {
  problem: Problem;
  userPoints: GridPoint[];
  onAddPoint: (pt: GridPoint) => void;
  onRemovePoint: (index: number) => void;
  hintPoint: GridPoint | null;
  wrongUserIndices: number[]; // Indices of userPoints that are incorrect
  isSuccessAnimating: boolean;
  showGuideLine: boolean;
}

export const GridCanvas: React.FC<GridCanvasProps> = ({
  problem,
  userPoints,
  onAddPoint,
  onRemovePoint,
  hintPoint,
  wrongUserIndices,
  isSuccessAnimating,
  showGuideLine,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [hoverGridPt, setHoverGridPt] = useState<GridPoint | null>(null);
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [foldProgress, setFoldProgress] = useState<number>(0);

  const gridSize = problem.gridSize || 12;
  const padding = 40;
  const cellSize = 38;
  const width = gridSize * cellSize + padding * 2;
  const height = gridSize * cellSize + padding * 2;

  // Coordinate conversion: Grid to SVG pixels
  const toSvgX = (gx: number) => padding + gx * cellSize;
  const toSvgY = (gy: number) => padding + gy * cellSize;

  // Handle rotation or fold animation when problem is solved
  useEffect(() => {
    if (isSuccessAnimating) {
      if (problem.type === 'point') {
        let start: number | null = null;
        let reqId: number;
        const duration = 1200;

        const animateRotation = (time: number) => {
          if (!start) start = time;
          const elapsed = time - start;
          const progress = Math.min(elapsed / duration, 1);
          const ease = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;
          setRotationAngle(ease * 180);

          if (progress < 1) {
            reqId = requestAnimationFrame(animateRotation);
          }
        };
        reqId = requestAnimationFrame(animateRotation);
        return () => cancelAnimationFrame(reqId);
      } else {
        let start: number | null = null;
        let reqId: number;
        const duration = 1200;

        const animateFold = (time: number) => {
          if (!start) start = time;
          const elapsed = time - start;
          const progress = Math.min(elapsed / duration, 1);
          setFoldProgress(progress);

          if (progress < 1) {
            reqId = requestAnimationFrame(animateFold);
          }
        };
        reqId = requestAnimationFrame(animateFold);
        return () => cancelAnimationFrame(reqId);
      }
    } else {
      setRotationAngle(0);
      setFoldProgress(0);
    }
  }, [isSuccessAnimating, problem.type]);

  // Pointer move: Calculate closest grid intersection
  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current || isSuccessAnimating) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const scaleX = width / rect.width;
    const scaleY = height / rect.height;

    const svgX = clientX * scaleX;
    const svgY = clientY * scaleY;

    const gx = Math.round((svgX - padding) / cellSize);
    const gy = Math.round((svgY - padding) / cellSize);

    if (gx >= 0 && gx <= gridSize && gy >= 0 && gy <= gridSize) {
      setHoverGridPt({ x: gx, y: gy });
    } else {
      setHoverGridPt(null);
    }
  };

  const handlePointerLeave = () => {
    setHoverGridPt(null);
  };

  const handleClick = (e: React.PointerEvent<SVGSVGElement>) => {
    if (isSuccessAnimating || !hoverGridPt) return;

    // Check if clicked an existing user point to remove it
    const existingIndex = userPoints.findIndex(
      (p) => p.x === hoverGridPt.x && p.y === hoverGridPt.y
    );

    if (existingIndex !== -1) {
      sound.playUndo();
      onRemovePoint(existingIndex);
    } else {
      // Don't add if already filled all expected points
      if (userPoints.length >= problem.expectedPoints.length) {
        sound.playWrong();
        return;
      }
      sound.playTap();
      onAddPoint(hoverGridPt);
    }
  };

  // Build SVG points string for Given Shape
  const givenPointsStr = useMemo(() => {
    return problem.givenPoints.map((p) => `${toSvgX(p.x)},${toSvgY(p.y)}`).join(' ');
  }, [problem.givenPoints]);

  // Order-independent polygon construction:
  // Sort placed user points to align with the expected perimeter boundary order
  // so that even if the student clicks out of order, the polygon lines connect properly!
  const sortedUserPoints = useMemo(() => {
    if (userPoints.length === 0) return [];
    return [...userPoints].sort((a, b) => {
      const idxA = problem.expectedPoints.findIndex((ep) => ep.x === a.x && ep.y === a.y);
      const idxB = problem.expectedPoints.findIndex((ep) => ep.x === b.x && ep.y === b.y);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return 0;
    });
  }, [userPoints, problem.expectedPoints]);

  // Combined polygon
  const combinedPointsStr = useMemo(() => {
    if (sortedUserPoints.length === 0) return '';
    const all = [...problem.givenPoints, ...sortedUserPoints];
    return all.map((p) => `${toSvgX(p.x)},${toSvgY(p.y)}`).join(' ');
  }, [problem.givenPoints, sortedUserPoints]);

  // Complete correct shape for victory animation
  const completeCorrectPointsStr = useMemo(() => {
    const all = [...problem.givenPoints, ...problem.expectedPoints];
    return all.map((p) => `${toSvgX(p.x)},${toSvgY(p.y)}`).join(' ');
  }, [problem.givenPoints, problem.expectedPoints]);

  // Center point for 180° rotation if point symmetry
  const centerSvg = problem.center
    ? { x: toSvgX(problem.center.x), y: toSvgY(problem.center.y) }
    : { x: toSvgX(6), y: toSvgY(6) };

  return (
    <div className="relative flex flex-col items-center justify-center p-2 bg-white rounded-2xl shadow-sm border border-slate-200">
      {/* Grid instruction header */}
      <div className="w-full flex items-center justify-between px-3 py-1.5 mb-1 text-xs text-slate-500 font-medium">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-slate-700">
            <span className="w-3 h-3 rounded-full bg-indigo-500 inline-block"></span>
            주어진 도형
          </span>
          <span className="flex items-center gap-1.5 text-slate-700">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
            찍은 대응점 ({userPoints.length} / {problem.expectedPoints.length})
          </span>
          {wrongUserIndices.length > 0 && (
            <span className="flex items-center gap-1.5 text-rose-600 font-bold">
              <span className="w-3 h-3 rounded-full bg-rose-500 inline-block animate-ping"></span>
              빨간색 점 위치 수정 필요
            </span>
          )}
        </div>
        <div className="text-slate-400 hidden sm:block">
          순서에 상관없이 알맞은 위치에 점을 찍으면 도형이 완성됩니다.
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl bg-slate-50 border border-slate-200/80">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full max-w-[540px] md:max-w-[580px] aspect-square cursor-crosshair touch-none select-none"
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          onPointerDown={handleClick}
        >
          <defs>
            <pattern id="gridPattern" width={cellSize} height={cellSize} patternUnits="userSpaceOnUse">
              <rect width={cellSize} height={cellSize} fill="#ffffff" />
              <path d={`M ${cellSize} 0 L 0 0 0 ${cellSize}`} fill="none" stroke="#e2e8f0" strokeWidth="1" />
            </pattern>

            <filter id="glowRed" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#ef4444" floodOpacity="0.7" />
            </filter>
            <filter id="glowOrange" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#f97316" floodOpacity="0.8" />
            </filter>
            <filter id="glowGreen" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#10b981" floodOpacity="0.7" />
            </filter>
            <filter id="glowWrongRed" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#dc2626" floodOpacity="0.9" />
            </filter>
          </defs>

          {/* Grid Background */}
          <rect x={padding} y={padding} width={gridSize * cellSize} height={gridSize * cellSize} fill="url(#gridPattern)" />

          {/* Major Grid Lines */}
          {Array.from({ length: gridSize + 1 }).map((_, i) => {
            const isMajor = i % 5 === 0;
            return (
              <g key={`grid-lines-${i}`}>
                <line
                  x1={padding}
                  y1={toSvgY(i)}
                  x2={width - padding}
                  y2={toSvgY(i)}
                  stroke={isMajor ? '#cbd5e1' : '#f1f5f9'}
                  strokeWidth={isMajor ? 1.5 : 1}
                />
                <line
                  x1={toSvgX(i)}
                  y1={padding}
                  x2={toSvgX(i)}
                  y2={height - padding}
                  stroke={isMajor ? '#cbd5e1' : '#f1f5f9'}
                  strokeWidth={isMajor ? 1.5 : 1}
                />
                <text
                  x={toSvgX(i)}
                  y={padding - 10}
                  textAnchor="middle"
                  className="text-[11px] font-mono fill-slate-400 select-none"
                >
                  {i}
                </text>
                <text
                  x={padding - 12}
                  y={toSvgY(i) + 4}
                  textAnchor="end"
                  className="text-[11px] font-mono fill-slate-400 select-none"
                >
                  {i}
                </text>
              </g>
            );
          })}

          {/* Outer Border */}
          <rect
            x={padding}
            y={padding}
            width={gridSize * cellSize}
            height={gridSize * cellSize}
            fill="none"
            stroke="#94a3b8"
            strokeWidth="1.5"
          />

          {/* ======================================================== */}
          {/* SYMMETRY AXIS (For Line Symmetry) */}
          {/* ======================================================== */}
          {problem.type === 'line' && problem.axis && (
            <g className="transition-all duration-300">
              {problem.axis.type === 'vertical' && (
                <>
                  <line
                    x1={toSvgX(problem.axis.position)}
                    y1={padding - 18}
                    x2={toSvgX(problem.axis.position)}
                    y2={height - padding + 18}
                    stroke="#ef4444"
                    strokeWidth="3.5"
                    strokeDasharray="8,6"
                    strokeLinecap="round"
                    filter="url(#glowRed)"
                  />
                  <rect
                    x={toSvgX(problem.axis.position) - 28}
                    y={padding - 34}
                    width={56}
                    height={20}
                    rx={6}
                    fill="#ef4444"
                  />
                  <text
                    x={toSvgX(problem.axis.position)}
                    y={padding - 20}
                    textAnchor="middle"
                    fill="#ffffff"
                    className="text-[11px] font-bold select-none tracking-tight"
                  >
                    대칭축
                  </text>
                </>
              )}
              {problem.axis.type === 'horizontal' && (
                <>
                  <line
                    x1={padding - 18}
                    y1={toSvgY(problem.axis.position)}
                    x2={width - padding + 18}
                    y2={toSvgY(problem.axis.position)}
                    stroke="#ef4444"
                    strokeWidth="3.5"
                    strokeDasharray="8,6"
                    strokeLinecap="round"
                    filter="url(#glowRed)"
                  />
                  <rect
                    x={width - padding + 4}
                    y={toSvgY(problem.axis.position) - 10}
                    width={50}
                    height={20}
                    rx={6}
                    fill="#ef4444"
                  />
                  <text
                    x={width - padding + 29}
                    y={toSvgY(problem.axis.position) + 4}
                    textAnchor="middle"
                    fill="#ffffff"
                    className="text-[11px] font-bold select-none tracking-tight"
                  >
                    대칭축
                  </text>
                </>
              )}
              {problem.axis.type === 'diagonal_main' && (
                <>
                  <line
                    x1={toSvgX(0)}
                    y1={toSvgY(0)}
                    x2={toSvgX(gridSize)}
                    y2={toSvgY(gridSize)}
                    stroke="#ef4444"
                    strokeWidth="3.5"
                    strokeDasharray="8,6"
                    strokeLinecap="round"
                    filter="url(#glowRed)"
                  />
                  <text
                    x={toSvgX(gridSize) - 20}
                    y={toSvgY(gridSize) + 24}
                    textAnchor="middle"
                    fill="#ef4444"
                    className="text-[12px] font-bold select-none"
                  >
                    대각선 대칭축
                  </text>
                </>
              )}
            </g>
          )}

          {/* ======================================================== */}
          {/* CENTER OF SYMMETRY (For Point Symmetry) */}
          {/* ======================================================== */}
          {problem.type === 'point' && problem.center && (
            <g className="animate-center-pulse">
              <circle
                cx={toSvgX(problem.center.x)}
                cy={toSvgY(problem.center.y)}
                r={16}
                fill="rgba(249, 115, 22, 0.2)"
                stroke="#f97316"
                strokeWidth="2"
                strokeDasharray="3,3"
              />
              <line
                x1={toSvgX(problem.center.x) - 12}
                y1={toSvgY(problem.center.y)}
                x2={toSvgX(problem.center.x) + 12}
                y2={toSvgY(problem.center.y)}
                stroke="#ea580c"
                strokeWidth="1.5"
              />
              <line
                x1={toSvgX(problem.center.x)}
                y1={toSvgY(problem.center.y) - 12}
                x2={toSvgX(problem.center.x)}
                y2={toSvgY(problem.center.y) + 12}
                stroke="#ea580c"
                strokeWidth="1.5"
              />
              <circle
                cx={toSvgX(problem.center.x)}
                cy={toSvgY(problem.center.y)}
                r={6}
                fill="#ea580c"
                filter="url(#glowOrange)"
              />
              <rect
                x={toSvgX(problem.center.x) - 45}
                y={toSvgY(problem.center.y) + 14}
                width={90}
                height={20}
                rx={6}
                fill="#ea580c"
              />
              <text
                x={toSvgX(problem.center.x)}
                y={toSvgY(problem.center.y) + 28}
                textAnchor="middle"
                fill="#ffffff"
                className="text-[11px] font-bold select-none"
              >
                대칭의 중심 (점 ㅇ)
              </text>
            </g>
          )}

          {/* ======================================================== */}
          {/* GIVEN SHAPE */}
          {/* ======================================================== */}
          <polygon
            points={givenPointsStr}
            fill="rgba(99, 102, 241, 0.16)"
            stroke="#4f46e5"
            strokeWidth="3"
            strokeLinejoin="round"
          />

          {/* USER DRAWN SHAPE (Seamlessly connected regardless of click order) */}
          {sortedUserPoints.length > 0 && (
            <polygon
              points={combinedPointsStr}
              fill="rgba(16, 185, 129, 0.2)"
              stroke="#059669"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
          )}

          {/* ======================================================== */}
          {/* GUIDE LINES (When toggled by user) */}
          {/* ======================================================== */}
          {showGuideLine && problem.type === 'line' && problem.axis && (
            <g opacity="0.6">
              {problem.givenPoints.map((pt, idx) => {
                const isAxisPoint =
                  problem.axis?.type === 'vertical'
                    ? pt.x === problem.axis.position
                    : pt.y === problem.axis?.position;
                if (isAxisPoint) return null;

                const targetX =
                  problem.axis?.type === 'vertical'
                    ? 2 * problem.axis.position - pt.x
                    : pt.x;
                const targetY =
                  problem.axis?.type === 'horizontal'
                    ? 2 * (problem.axis.position || 0) - pt.y
                    : pt.y;

                return (
                  <line
                    key={`guide-${idx}`}
                    x1={toSvgX(pt.x)}
                    y1={toSvgY(pt.y)}
                    x2={toSvgX(targetX)}
                    y2={toSvgY(targetY)}
                    stroke="#94a3b8"
                    strokeWidth="1.5"
                    strokeDasharray="4,4"
                  />
                );
              })}
            </g>
          )}

          {showGuideLine && problem.type === 'point' && problem.center && (
            <g opacity="0.6">
              {problem.givenPoints.map((pt, idx) => {
                if (pt.x === problem.center!.x && pt.y === problem.center!.y) return null;
                const targetX = 2 * problem.center!.x - pt.x;
                const targetY = 2 * problem.center!.y - pt.y;

                return (
                  <line
                    key={`point-guide-${idx}`}
                    x1={toSvgX(pt.x)}
                    y1={toSvgY(pt.y)}
                    x2={toSvgX(targetX)}
                    y2={toSvgY(targetY)}
                    stroke="#ea580c"
                    strokeWidth="1.5"
                    strokeDasharray="4,4"
                  />
                );
              })}
            </g>
          )}

          {/* ======================================================== */}
          {/* GIVEN VERTEX LABELS */}
          {/* ======================================================== */}
          {problem.givenPoints.map((p, idx) => {
            const label = problem.vertexLabels ? problem.vertexLabels[idx] : `P${idx + 1}`;
            const isAxisOrCenter =
              (problem.type === 'line' &&
                problem.axis &&
                ((problem.axis.type === 'vertical' && p.x === problem.axis.position) ||
                  (problem.axis.type === 'horizontal' && p.y === problem.axis.position))) ||
              (problem.type === 'point' && problem.center && p.x === problem.center.x && p.y === problem.center.y);

            return (
              <g key={`given-pt-${idx}`}>
                <circle
                  cx={toSvgX(p.x)}
                  cy={toSvgY(p.y)}
                  r={isAxisOrCenter ? 5 : 7}
                  fill={isAxisOrCenter ? '#6366f1' : '#4338ca'}
                  stroke="#ffffff"
                  strokeWidth="2.5"
                />
                {!isAxisOrCenter && (
                  <g>
                    <rect
                      x={toSvgX(p.x) - 16}
                      y={toSvgY(p.y) - 24}
                      width={32}
                      height={18}
                      rx={5}
                      fill="#312e81"
                      className="drop-shadow-sm"
                    />
                    <text
                      x={toSvgX(p.x)}
                      y={toSvgY(p.y) - 11}
                      textAnchor="middle"
                      fill="#ffffff"
                      className="text-[11px] font-bold select-none"
                    >
                      점 {label}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* ======================================================== */}
          {/* USER PLACED POINTS (With Red error state for incorrect ones!) */}
          {/* ======================================================== */}
          {userPoints.map((p, idx) => {
            const isWrong = wrongUserIndices.includes(idx);

            return (
              <g key={`user-pt-${idx}`} className="cursor-pointer group">
                {/* Outer halo */}
                <circle
                  cx={toSvgX(p.x)}
                  cy={toSvgY(p.y)}
                  r={isWrong ? 14 : 12}
                  fill={isWrong ? 'rgba(239, 68, 68, 0.35)' : 'rgba(16, 185, 129, 0.25)'}
                  className={isWrong ? 'animate-ping' : ''}
                />
                {/* Main point */}
                <circle
                  cx={toSvgX(p.x)}
                  cy={toSvgY(p.y)}
                  r={isWrong ? 9 : 8}
                  fill={isWrong ? '#dc2626' : '#059669'}
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  filter={isWrong ? 'url(#glowWrongRed)' : 'url(#glowGreen)'}
                />
                {/* Tag */}
                <rect
                  x={toSvgX(p.x) - (isWrong ? 22 : 16)}
                  y={toSvgY(p.y) + 12}
                  width={isWrong ? 44 : 32}
                  height={18}
                  rx={5}
                  fill={isWrong ? '#b91c1c' : '#065f46'}
                />
                <text
                  x={toSvgX(p.x)}
                  y={toSvgY(p.y) + 25}
                  textAnchor="middle"
                  fill="#ffffff"
                  className="text-[10px] font-bold select-none"
                >
                  {isWrong ? '틀림!' : `점 ${idx + 1}`}
                </text>
              </g>
            );
          })}

          {/* ======================================================== */}
          {/* HINT OVERLAY (Only when student deliberately uses Hint item) */}
          {/* ======================================================== */}
          {hintPoint && (
            <g>
              <circle
                cx={toSvgX(hintPoint.x)}
                cy={toSvgY(hintPoint.y)}
                r={18}
                fill="rgba(245, 158, 11, 0.3)"
                stroke="#f59e0b"
                strokeWidth="3"
                strokeDasharray="4,4"
                className="animate-spin"
                style={{ transformOrigin: `${toSvgX(hintPoint.x)}px ${toSvgY(hintPoint.y)}px` }}
              />
              <circle
                cx={toSvgX(hintPoint.x)}
                cy={toSvgY(hintPoint.y)}
                r={6}
                fill="#d97706"
              />
              <rect
                x={toSvgX(hintPoint.x) - 28}
                y={toSvgY(hintPoint.y) - 28}
                width={56}
                height={20}
                rx={6}
                fill="#d97706"
              />
              <text
                x={toSvgX(hintPoint.x)}
                y={toSvgY(hintPoint.y) - 14}
                textAnchor="middle"
                fill="#ffffff"
                className="text-[11px] font-bold select-none"
              >
                힌트 위치!
              </text>
            </g>
          )}

          {/* ======================================================== */}
          {/* HOVER SNAP MAGNET */}
          {/* ======================================================== */}
          {hoverGridPt && !isSuccessAnimating && (
            <g>
              <circle
                cx={toSvgX(hoverGridPt.x)}
                cy={toSvgY(hoverGridPt.y)}
                r={10}
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                opacity="0.8"
              />
              <circle
                cx={toSvgX(hoverGridPt.x)}
                cy={toSvgY(hoverGridPt.y)}
                r={4}
                fill="#10b981"
              />
              <text
                x={toSvgX(hoverGridPt.x)}
                y={toSvgY(hoverGridPt.y) + 16}
                textAnchor="middle"
                fill="#475569"
                className="text-[10px] font-mono select-none"
              >
                ({hoverGridPt.x}, {hoverGridPt.y})
              </text>
            </g>
          )}

          {/* ======================================================== */}
          {/* 180° ROTATION ANIMATION (Point Symmetry Solved) */}
          {/* ======================================================== */}
          {isSuccessAnimating && problem.type === 'point' && (
            <g
              style={{
                transformOrigin: `${centerSvg.x}px ${centerSvg.y}px`,
                transform: `rotate(${rotationAngle}deg)`,
              }}
            >
              <polygon
                points={givenPointsStr}
                fill="rgba(249, 115, 22, 0.45)"
                stroke="#ea580c"
                strokeWidth="3.5"
                strokeDasharray="4,4"
              />
            </g>
          )}

          {/* ======================================================== */}
          {/* FOLDING ANIMATION (Line Symmetry Solved) */}
          {/* ======================================================== */}
          {isSuccessAnimating && problem.type === 'line' && (
            <polygon
              points={completeCorrectPointsStr}
              fill="rgba(16, 185, 129, 0.4)"
              stroke="#047857"
              strokeWidth="4"
              className="animate-pulse"
            />
          )}
        </svg>
      </div>
    </div>
  );
};
