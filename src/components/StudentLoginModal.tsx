import React, { useState } from 'react';
import { User, KeyRound, Sparkles, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { classroomSync } from '../utils/classroomSync';
import { sound } from '../utils/audio';

interface StudentLoginModalProps {
  isOpen: boolean;
  onSuccess: (nickname: string, roomPassword: string) => void;
  onOpenTeacherPage: () => void;
}

export const StudentLoginModal: React.FC<StudentLoginModalProps> = ({
  isOpen,
  onSuccess,
  onOpenTeacherPage,
}) => {
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!nickname.trim()) {
      setErrorMsg('별명이나 이름을 입력해주세요.');
      sound.playWrong();
      return;
    }

    if (!password.trim()) {
      setErrorMsg('선생님이 알려주신 입장 비밀번호를 입력해주세요.');
      sound.playWrong();
      return;
    }

    const currentRoomPwd = classroomSync.getRoomPassword();
    if (password.trim() !== currentRoomPwd) {
      setErrorMsg('입장 비밀번호가 올바르지 않습니다. 선생님께 확인해주세요!');
      sound.playWrong();
      return;
    }

    sound.playTap();
    onSuccess(nickname.trim(), password.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden p-6 sm:p-8">
        {/* Header Icon */}
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto mb-4 text-indigo-600">
          <Sparkles className="w-8 h-8" />
        </div>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            대칭도형 탐험대 입장
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            별명과 선생님이 알려주신 비밀번호를 입력하세요.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700 font-medium animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-500" />
              <span>학생 별명 (또는 이름)</span>
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="예: 5반 김민준, 도형마스터"
              maxLength={15}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-indigo-500" />
              <span>수업 입장 비밀번호</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="선생님이 설정한 비밀번호 (초기값: 501)"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-mono"
            />
            <div className="text-[11px] text-slate-400 mt-1">
              * 기본 비밀번호는 <span className="font-mono font-bold text-slate-600">501</span> 입니다.
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm cursor-pointer mt-2"
          >
            <span>게임 방 입장하기</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>선생님이신가요?</span>
          <button
            onClick={onOpenTeacherPage}
            className="text-indigo-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>교사용 관리자 페이지</span>
          </button>
        </div>
      </div>
    </div>
  );
};
