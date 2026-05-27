"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { ChatBubble } from "@/components/chat-bubble";
import { AnswerInput } from "@/components/answer-input";
import { submitAnswer } from "@/lib/api";
import type { ChatMessage, SubmitAnswerResponse } from "@/types";

export default function InterviewPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const interviewId = localStorage.getItem("interviewId");

    if (!interviewId) {
      toast.error("请先上传简历开始面试");
      setTimeout(() => router.push("/"), 2000);
      return;
    }

    const firstMessage: ChatMessage = {
      id: "welcome",
      role: "ai",
      content:
        "你好！我已经阅读了你的简历。你在前端领域有丰富的经验，特别是 React 和 Vue 的使用。我们今天的面试将重点围绕框架原理、状态管理以及实际项目经验展开。",
      timestamp: new Date(),
    };

    const firstQuestion: ChatMessage = {
      id: "q1",
      role: "ai",
      content:
        "首先，请简单介绍一下你在 React 或 Vue 项目中是如何进行状态管理的？你会根据什么标准来选择不同的状态管理方案？",
      timestamp: new Date(),
    };

    setMessages([firstMessage, firstQuestion]);
    setQuestionCount(1);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmitAnswer = async (answer: string) => {
    const interviewId = localStorage.getItem("interviewId");
    if (!interviewId) return;

    setIsLoading(true);

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: answer,
      timestamp: new Date(),
    };

    // 使用临时id，确保替换时保持同一组件实例
    const tempAiId = `ai-${Date.now()}`;

    // 创建AI loading消息
    const aiLoadingMessage: ChatMessage = {
      id: tempAiId,
      role: "ai",
      content: "",
      timestamp: new Date(),
      isLoading: true,
    };

    setMessages(prev => [...prev, userMessage, aiLoadingMessage]);

    try {
      const response: SubmitAnswerResponse = await submitAnswer(
        interviewId,
        answer,
      );

      if (response.question) {
        const aiMessage: ChatMessage = {
          id: tempAiId, // 使用相同的id，避免React重新渲染
          role: "ai",
          content: response.question.questionText,
          evaluation: response.evaluation,
          timestamp: new Date(),
          isLoading: false,
        };

        // 替换loading消息为真实消息
        setMessages(prev => {
          const newMessages = [...prev];
          // 找到并替换loading消息
          const loadingIndex = newMessages.findIndex(
            msg => msg.id === tempAiId,
          );
          if (loadingIndex !== -1) {
            newMessages[loadingIndex] = aiMessage;
          }
          return newMessages;
        });

        if (response.type === "next") {
          setQuestionCount(prev => prev + 1);
        }
      }

      if (response.type === "finished") {
        setTimeout(() => {
          router.push(`/result/${interviewId}`);
        }, 2000);
      }
    } catch (error) {
      toast.error("提交回答失败，请稍后重试");
      console.error("Failed to submit answer:", error);
      // 移除loading消息
      setMessages(prev => prev.filter(msg => msg.id !== tempAiId));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndInterview = () => {
    const interviewId = localStorage.getItem("interviewId");
    if (interviewId) {
      router.push(`/result/${interviewId}`);
    }
  };

  return (
    <div className="bg-slate-950 text-slate-200 h-screen flex flex-col overflow-hidden">
      {/* 顶部状态栏 */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
            <Icon
              icon="solar:user-rounded-bold-duotone"
              className="text-indigo-400 text-2xl"
            />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">AI 高级面试官</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                正在进行：前端开发专家面试
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">
            <Icon icon="solar:info-circle-bold" className="text-amber-500" />
            <span className="text-xs text-amber-200">
              回答低于 60 分将触发深度追问
            </span>
          </div>
          <button
            onClick={handleEndInterview}
            className="px-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-lg text-sm font-bold transition-all flex items-center gap-2">
            结束面试
            <Icon icon="solar:stop-circle-bold" />
          </button>
        </div>
      </header>

      {/* 聊天区域 */}
      <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-8">
          {messages.map((message, index) => (
            <ChatBubble
              key={message.id}
              message={message}
              animationDelay={index * 200}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* 底部输入框 */}
      <AnswerInput onSubmit={handleSubmitAnswer} isLoading={isLoading} />
    </div>
  );
}
