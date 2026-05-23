"use client";

import { useState, KeyboardEvent, useEffect, useRef } from "react";

interface AnswerInputProps {
  onSubmit: (answer: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function AnswerInput({
  onSubmit,
  isLoading,
  disabled,
}: AnswerInputProps) {
  const [answer, setAnswer] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 150) + "px";
      textareaRef.current.style.overflowY =
        textareaRef.current.scrollHeight > 150 ? "auto" : "hidden";
    }
  }, [answer]);

  const handleSubmit = () => {
    if (!answer.trim() || isLoading || disabled) return;
    onSubmit(answer.trim());
    setAnswer("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="p-6 border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto flex gap-4 items-center">
        <div className="flex-1 relative flex items-center">
          <textarea
            ref={textareaRef}
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="在此输入您的回答..."
            disabled={isLoading || disabled}
            className="w-full h-11 bg-slate-800 border-2 border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none custom-scrollbar text-slate-200 placeholder:text-slate-500 leading-5"
            rows={1}
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={!answer.trim() || isLoading || disabled}
          className={`h-11 px-5 rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center border-2 ${
            answer.trim() && !isLoading && !disabled
              ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 border-indigo-600"
              : "bg-slate-800 text-slate-500 cursor-not-allowed border-slate-700"
          }`}>
          发送
        </button>
      </div>
      <p className="text-center text-[10px] text-slate-600 mt-3">
        按下 Enter 发送，Shift + Enter 换行
      </p>
    </div>
  );
}
