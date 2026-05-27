"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { LoadingDots } from "./loading-dots";
import type { ChatMessage } from "@/types";

interface ChatBubbleProps {
  message: ChatMessage;
  animationDelay?: number;
}

export function ChatBubble({ message, animationDelay = 0 }: ChatBubbleProps) {
  const [displayedText, setDisplayedText] = useState(
    message.isLoading ? "" : message.content,
  );
  const [isTyping, setIsTyping] = useState(
    message.role === "ai" && !message.isLoading && message.content.length > 0,
  );

  useEffect(() => {
    // 跳过loading状态的处理
    if (message.isLoading) {
      setDisplayedText("");
      setIsTyping(false);
      return;
    }

    if (message.role !== "ai") {
      setDisplayedText(message.content);
      setIsTyping(false);
      return;
    }

    // 只有当内容变化且有内容时才启动打字机效果
    if (message.content.length > 0) {
      setDisplayedText("");
      setIsTyping(true);

      let index = 0;
      const text = message.content;
      const interval = setInterval(() => {
        if (index < text.length) {
          setDisplayedText(text.slice(0, index + 1));
          index++;
        } else {
          clearInterval(interval);
          setIsTyping(false);
        }
      }, 20);

      return () => clearInterval(interval);
    }
  }, [message.content, message.role, message.isLoading]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className={`flex gap-4 animate-msg ${message.role === "ai" ? "" : "flex-row-reverse"}`}
      style={{ animationDelay: `${animationDelay}ms` }}>
      {/* 头像 */}
      <div
        className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center ${
          message.role === "ai"
            ? "bg-slate-800 border border-slate-700"
            : "bg-indigo-600 shadow-lg shadow-indigo-500/30"
        }`}>
        {message.role === "ai" ? (
          <Icon
            icon="solar:user-rounded-bold-duotone"
            className="text-indigo-400 text-2xl"
          />
        ) : (
          <Icon icon="solar:user-bold" className="text-white text-xl" />
        )}
      </div>

      {/* 消息内容 */}
      <div className="max-w-[80%]">
        <div
          className={`p-4 rounded-2xl text-sm leading-relaxed shadow-xl relative ${
            message.role === "ai"
              ? "chat-bubble-ai text-slate-200"
              : "chat-bubble-user text-white"
          } ${message.evaluation && message.evaluation.technicalScore < 60 ? "pl-5" : ""}`}>
          {/* 深度追问橙色边框 */}
          {message.evaluation && message.evaluation.technicalScore < 60 && (
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 rounded-l-2xl"></div>
          )}
          {/* 追问标识 */}
          {message.evaluation &&
            message.evaluation.technicalScore < 60 &&
            !message.isLoading && (
              <div className="flex items-center gap-2 mb-2 text-amber-500 text-xs font-bold">
                <Icon icon="solar:danger-bold" />
                <span>深度追问：基础概念解释尚可，但缺乏具体实现细节</span>
              </div>
            )}

          {/* loading状态显示 */}
          {message.isLoading ? (
            <span className="flex items-center gap-1">
              <span>正在思考</span>
              <LoadingDots />
            </span>
          ) : (
            <p>
              {displayedText}
              {isTyping && (
                <span className="inline-block w-1 h-4 bg-current ml-0.5 animate-pulse" />
              )}
            </p>
          )}
        </div>

        {/* 评价信息 - loading状态不显示 */}
        {message.evaluation && !message.isLoading && (
          <div className="mt-2 px-3 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
            <div className="flex justify-between items-center mb-2">
              <div className="flex gap-4">
                <div className="text-center">
                  <div className="text-cyan-400 font-bold text-xs">
                    {message.evaluation.technicalScore}
                  </div>
                  <div className="text-[10px] text-slate-500">技术能力</div>
                </div>
                <div className="text-center">
                  <div className="text-purple-400 font-bold text-xs">
                    {message.evaluation.communicationScore}
                  </div>
                  <div className="text-[10px] text-slate-500">表达能力</div>
                </div>
                <div className="text-center">
                  <div className="text-green-400 font-bold text-xs">
                    {message.evaluation.experienceScore}
                  </div>
                  <div className="text-[10px] text-slate-500">项目经验</div>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400 italic">
              {message.evaluation.feedback}
            </p>
          </div>
        )}

        {/* 时间 - loading状态不显示 */}
        {!message.isLoading && (
          <span
            className={`text-[10px] text-slate-500 mt-2 block ${message.role === "ai" ? "ml-1" : "text-right mr-1"}`}>
            {formatTime(message.timestamp)}
          </span>
        )}
      </div>
    </div>
  );
}
