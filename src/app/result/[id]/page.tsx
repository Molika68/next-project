"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { RadarChart } from "@/components/radar-chart";
import { getInterviewResult } from "@/lib/api";
import type { InterviewResult } from "@/types";

/**
 * @description 检测内容是否包含目录树格式
 * @param content - 消息内容
 * @returns boolean - 是否为目录树格式
 */
const isDirectoryTree = (content: string): boolean => {
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

export default function ResultPage() {
  const [result, setResult] = useState<InterviewResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    const interviewId = params.id as string;
    if (!interviewId) {
      toast.error("无效的面试 ID");
      setTimeout(() => router.push("/"), 2000);
      return;
    }

    const fetchResult = async () => {
      try {
        const data = await getInterviewResult(interviewId);
        setResult(data);
      } catch (error) {
        toast.error("获取面试结果失败");
        console.error("Failed to fetch result:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResult();
  }, [params.id, router]);

  const handleRestart = () => {
    localStorage.removeItem("interviewId");
    localStorage.removeItem("currentQuestionId");
    router.push("/");
  };

  const getOverallScore = () => {
    if (!result) return 0;
    return Math.round(
      (result.technicalScore +
        result.communicationScore +
        result.experienceScore) /
        3,
    );
  };

  const getScoreGrade = (score: number) => {
    if (score >= 90)
      return { label: "优秀", color: "text-green-400", bg: "bg-green-500/20" };
    if (score >= 80)
      return {
        label: "良好",
        color: "text-indigo-400",
        bg: "bg-indigo-500/20",
      };
    if (score >= 60)
      return { label: "中等", color: "text-amber-400", bg: "bg-amber-500/20" };
    return { label: "需改进", color: "text-red-400", bg: "bg-red-500/20" };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="bg-slate-950 text-slate-200 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400">正在加载面试结果...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="bg-slate-950 text-slate-200 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">无法获取面试结果</p>
          <button
            onClick={handleRestart}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg">
            返回首页
          </button>
        </div>
      </div>
    );
  }

  const overallScore = getOverallScore();
  const grade = getScoreGrade(overallScore);

  return (
    <div className="bg-slate-950 text-slate-200 min-h-screen pb-20">
      <nav className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Icon
                icon="solar:chart-square-bold-duotone"
                className="text-white text-xl"
              />
            </div>
            <span className="text-xl font-bold text-white">面试报告</span>
          </div>
          <button
            onClick={handleRestart}
            className="text-sm text-slate-400 hover:text-white flex items-center gap-2 transition-colors cursor-pointer">
            <Icon icon="solar:refresh-bold" />
            重新面试
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-white mb-2">综合评价</h1>
          <p className="text-slate-500 flex items-center gap-2">
            <Icon icon="solar:calendar-bold" />
            面试综合评价报告 · {formatDate(new Date().toISOString())}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-card-gradient p-8 rounded-2xl border border-slate-800 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Icon icon="solar:ranking-bold" className="text-indigo-400" />
              能力指标打分
            </h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-300">技术能力</span>
                  <span className="text-cyan-400 font-bold">
                    {result.technicalScore}/100
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full rounded-full shadow-[0_0_15px_rgba(34,211,238,0.6)] transition-all duration-500"
                    style={{ width: `${result.technicalScore}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-300">表达能力</span>
                  <span className="text-orange-400 font-bold">
                    {result.communicationScore}/100
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-orange-400 to-amber-400 h-full rounded-full shadow-[0_0_15px_rgba(251,146,60,0.6)] transition-all duration-500"
                    style={{ width: `${result.communicationScore}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-300">项目经验</span>
                  <span className="text-pink-400 font-bold">
                    {result.experienceScore}/100
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-pink-400 to-rose-400 h-full rounded-full shadow-[0_0_15px_rgba(244,114,182,0.6)] transition-all duration-500"
                    style={{ width: `${result.experienceScore}%` }}
                  />
                </div>
              </div>
              <div className="pt-4 border-t border-slate-700">
                <div className="flex justify-between items-center">
                  <span className="text-white font-bold">综合评分</span>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${grade.color} ${grade.bg}`}>
                      {grade.label}
                    </span>
                    <span className="text-2xl font-bold text-white">
                      {overallScore}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card-gradient p-8 rounded-2xl border border-slate-800 shadow-2xl flex flex-col items-center justify-center">
            <h3 className="text-lg font-bold text-white mb-6 self-start flex items-center gap-2">
              <Icon icon="solar:graph-bold" className="text-purple-400" />
              能力雷达图
            </h3>
            <RadarChart result={result} />
          </div>
        </div>

        <div className="space-y-8">
          <section className="bg-slate-900/50 rounded-2xl p-8 border border-slate-800">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Icon icon="solar:notes-bold" className="text-indigo-400" />
              总体表现分析
            </h3>
            <div className="text-slate-400 leading-relaxed">
              <ReactMarkdown>{result.summary}</ReactMarkdown>
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="bg-emerald-500/5 rounded-2xl p-8 border border-emerald-500/20">
              <h3 className="text-xl font-bold text-emerald-400 mb-6 flex items-center gap-2">
                <Icon icon="solar:check-circle-bold" />
                优势
              </h3>
              <ul className="space-y-4">
                <li className="flex gap-3 text-slate-300 text-sm">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                    1
                  </span>
                  对 React 和 Vue 的基本状态管理有一定了解。
                </li>
                <li className="flex gap-3 text-slate-300 text-sm">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                    2
                  </span>
                  能用简单语言解释技术要点。
                </li>
              </ul>
            </section>

            <section className="bg-red-500/5 rounded-2xl p-8 border border-red-500/20">
              <h3 className="text-xl font-bold text-red-400 mb-6 flex items-center gap-2">
                <Icon icon="solar:close-circle-bold" />
                不足
              </h3>
              <ul className="space-y-4">
                <li className="flex gap-3 text-slate-300 text-sm">
                  <span className="w-6 h-6 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center shrink-0">
                    1
                  </span>
                  技术细节匮乏：未提供具体项目案例和实现过程。
                </li>
                <li className="flex gap-3 text-slate-300 text-sm">
                  <span className="w-6 h-6 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center shrink-0">
                    2
                  </span>
                  专业知识不扎实：对如何应用框架提升系统性能理解不足。
                </li>
                <li className="flex gap-3 text-slate-300 text-sm">
                  <span className="w-6 h-6 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center shrink-0">
                    3
                  </span>
                  表达能力待提升：描述技术细节时内容浅显，缺乏深度。
                </li>
              </ul>
            </section>
          </div>

          <section className="bg-slate-900/50 rounded-2xl p-8 border border-slate-800">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Icon icon="solar:lightbulb-bold" className="text-amber-400" />
              改进建议
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 bg-slate-800/50 rounded-xl border border-slate-700">
                <h4 className="text-white font-bold mb-2 text-sm">
                  补充具体项目案例
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  说明如何用 React/Vue
                  解决业务需求，重点优化状态管理实现方式与系统可维护性。
                </p>
              </div>
              <div className="p-5 bg-slate-800/50 rounded-xl border border-slate-700">
                <h4 className="text-white font-bold mb-2 text-sm">
                  深入学习技术细节
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  掌握 useContext、useReducer 等高级 API 的应用场景及优势。
                </p>
              </div>
              <div className="p-5 bg-slate-800/50 rounded-xl border border-slate-700">
                <h4 className="text-white font-bold mb-2 text-sm">
                  提升表达能力
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  通过实例或模拟情景增强描述的准确性与逻辑性，补充技术应用场景。
                </p>
              </div>
            </div>
          </section>

          <section className="bg-indigo-600/10 rounded-2xl p-8 border border-indigo-500/20 text-center">
            <h3 className="text-xl font-bold text-indigo-400 mb-4">总结</h3>
            <p className="text-slate-300 max-w-3xl mx-auto italic">
              “总体评价面试者技术细节和经验不足，建议按上述改进建议提升表现；期望未来能提供更详实的技术方案并清晰表达思路。”
            </p>
          </section>

          <section className="bg-slate-900/50 rounded-2xl p-8 border border-slate-800">
            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
              <Icon icon="solar:history-bold" className="text-slate-400" />
              面试问答记录
            </h3>
            <div className="space-y-8">
              {result.questions.map(item => (
                <div
                  key={item.id}
                  className={`border-l-2 pl-6 space-y-3 ${item.technicalScore < 60 ? "border-amber-500" : "border-indigo-500"}`}>
                  <div className="flex justify-between items-start">
                    <h4 className="text-white font-bold">
                      Q: {item.questionText}
                    </h4>
                    <span
                      className={`shrink-0 px-3 py-1.5 text-[10px] rounded-lg font-bold whitespace-nowrap ${item.technicalScore >= 60 ? "bg-indigo-500/10 text-indigo-400" : "bg-amber-500/10 text-amber-400"}`}>
                      评分:{" "}
                      {Math.round(
                        (item.technicalScore +
                          item.communicationScore +
                          item.experienceScore) /
                          3,
                      )}
                    </span>
                  </div>
                  <div className="text-sm text-slate-400 prose prose-slate max-w-none">
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
                          return (
                            <p className="my-2 leading-relaxed">{children}</p>
                          );
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
                            <li className="text-slate-300 text-sm leading-relaxed">
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
                          return (
                            <em className="text-purple-400 italic">
                              {children}
                            </em>
                          );
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
                      {formatContent(item.answerText)}
                    </ReactMarkdown>
                  </div>
                  {item.feedback && (
                    <div className="text-xs text-amber-400/80 bg-amber-500/5 p-3 rounded-lg italic border border-amber-500/10 mt-3">
                      <span className="font-semibold">AI 评价：</span>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight]}
                        components={{
                          p: ({ children }) => (
                            <span className="inline">{children}</span>
                          ),
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
                              <pre className="bg-[#1e1e1e] rounded-lg p-3 overflow-x-auto my-2 text-xs font-mono">
                                <code className="hljs" {...props}>
                                  {children}
                                </code>
                              </pre>
                            ) : (
                              <code
                                className="bg-slate-700/80 px-1.5 py-0.5 rounded text-cyan-400 text-xs font-mono"
                                {...props}>
                                {children}
                              </code>
                            );
                          },
                        }}>
                        {item.feedback}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-12 flex justify-center gap-6">
          <button
            onClick={handleRestart}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2 cursor-pointer">
            <Icon icon="solar:refresh-bold" />
            重新开始面试
          </button>
          <button className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer">
            <Icon icon="solar:download-bold" />
            下载 PDF 报告
          </button>
        </div>
      </main>

      <footer className="mt-20 py-10 border-t border-slate-900 text-center">
        <p className="text-slate-600 text-sm">
          AI 智能面试官报告系统 · 驱动您的职业成长
        </p>
      </footer>
    </div>
  );
}
