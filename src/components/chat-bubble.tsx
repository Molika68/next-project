"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { LoadingDots } from "./loading-dots";
import type { ChatMessage } from "@/types";

/**
 * @description 检测内容是否包含目录树格式
 * @param content - 消息内容
 * @returns boolean - 是否为目录树格式
 */
const isDirectoryTree = (content: string): boolean => {
  // 检测目录树特征：包含 ├──、└──、│ 等特殊字符
  const treePatterns = [
    /^\s*src\//,
    /├──/,
    /└──/,
    /│\s*/,
    /──\s*[\w\/]+(#.*)?$/,
  ];
  const matches = treePatterns.filter(pattern => pattern.test(content));
  return matches.length >= 2;
};

/**
 * @description 将目录树格式包装为代码块
 * @param content - 消息内容
 * @returns string - 处理后的内容
 */
const formatContent = (content: string): string => {
  if (isDirectoryTree(content)) {
    return "```\n" + content + "\n```";
  }
  return content;
};

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
          ) : isTyping ? (
            <p className="whitespace-pre-wrap">
              {displayedText}
              <span className="inline-block w-1 h-4 bg-current ml-0.5 animate-pulse" />
            </p>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                code({
                  node,
                  inline,
                  className,
                  children,
                  ...props
                }: {
                  node?: any;
                  inline?: boolean;
                  className?: string;
                  children?: React.ReactNode;
                }) {
                  return !inline ? (
                    <pre className="bg-[#1e1e1e] rounded-lg p-4 overflow-x-auto my-3 text-sm font-mono">
                      <code className="hljs" {...props}>
                        {children}
                      </code>
                    </pre>
                  ) : (
                    <code
                      className="bg-slate-700/80 px-2 py-0.5 rounded text-cyan-400 text-sm font-mono"
                      {...props}>
                      {children}
                    </code>
                  );
                },
                p({ children }) {
                  return <p className="my-2 leading-relaxed">{children}</p>;
                },
                ul({ children }) {
                  return (
                    <ul className="list-disc list-inside space-y-1.5 my-3">
                      {children}
                    </ul>
                  );
                },
                ol({ children }) {
                  return (
                    <ol className="list-decimal list-inside space-y-1.5 my-3">
                      {children}
                    </ol>
                  );
                },
                li({ children }) {
                  return (
                    <li className="text-slate-200 text-sm leading-relaxed">
                      {children}
                    </li>
                  );
                },
                strong({ children }) {
                  return (
                    <strong className="text-white font-semibold">
                      {children}
                    </strong>
                  );
                },
                em({ children }) {
                  return <em className="text-purple-400 italic">{children}</em>;
                },
                blockquote({ children }) {
                  return (
                    <blockquote className="border-l-2 border-indigo-500 pl-4 italic text-slate-300 my-3 bg-slate-800/30 py-2 rounded-r">
                      {children}
                    </blockquote>
                  );
                },
                h1({ children }) {
                  return (
                    <h1 className="text-xl font-bold text-white my-3 border-b border-slate-700 pb-2">
                      {children}
                    </h1>
                  );
                },
                h2({ children }) {
                  return (
                    <h2 className="text-lg font-bold text-white my-3">
                      {children}
                    </h2>
                  );
                },
                h3({ children }) {
                  return (
                    <h3 className="text-base font-bold text-white my-2">
                      {children}
                    </h3>
                  );
                },
                table({ children }) {
                  return (
                    <div className="my-3 overflow-x-auto">
                      <table className="text-sm">{children}</table>
                    </div>
                  );
                },
                th({ children }) {
                  return (
                    <th className="border border-slate-600 px-3 py-2 bg-slate-800 text-left">
                      {children}
                    </th>
                  );
                },
                td({ children }) {
                  return (
                    <td className="border border-slate-600 px-3 py-2">
                      {children}
                    </td>
                  );
                },
              }}>
              {formatContent(message.content)}
            </ReactMarkdown>
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
