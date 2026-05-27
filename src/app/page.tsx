"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { startInterview } from "@/lib/api";
import { useRouter } from "next/navigation";
import { LoadingDots } from "@/components/loading-dots";

export default function Home() {
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const router = useRouter();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      if (!selectedFile.type.includes("application/pdf")) {
        toast.error("请上传 PDF 格式的简历");
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("文件大小不能超过 10MB");
        return;
      }
      setFile(selectedFile);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
  });

  const handleStartInterview = async (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡，防止触发文件选择
    if (!file) {
      toast.error("请先选择简历文件");
      return;
    }

    setIsUploading(true);
    try {
      const response = await startInterview(file);
      localStorage.setItem("interviewId", response.interviewId);
      localStorage.setItem("currentQuestionId", response.question.id);
      router.push("/interview");
    } catch (error) {
      toast.error("面试启动失败，请稍后重试");
      console.error("Failed to start interview:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const resetFile = (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡
    setFile(null);
  };

  return (
    <div className="bg-slate-950 text-slate-200 min-h-screen font-sans bg-grid">
      {/* 顶部导航 */}
      <nav className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Icon
                icon="solar:cpu-bolt-bold-duotone"
                className="text-white text-xl"
              />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              AI 智能面试官
            </span>
          </div>
        </div>
      </nav>

      {/* 主内容 */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* 标题区 */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold mb-6 tracking-tight text-white">
            开启您的{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              AI 模拟面试
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            基于大规模语言模型，为您量身定制技术面试。只需上传简历，AI
            将深入分析您的背景并进行实时互动问答。
          </p>
        </div>

        {/* 上传区域 */}
        <div className="relative group mb-24">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-10 transition-all cursor-pointer bg-slate-950/50 ${isDragActive ? "border-indigo-500 bg-indigo-500/5" : "border-slate-700 hover:border-indigo-500"}`}>
              <input {...getInputProps()} className="hidden" />
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 text-indigo-400">
                  <Icon
                    icon="solar:file-send-bold-duotone"
                    className="text-4xl"
                  />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  点击或拖拽简历至此处
                </h3>
                <p className="text-slate-500 mb-6">
                  仅支持 PDF 格式 (最大 10MB)
                </p>

                {/* 文件显示状态 */}
                {file ? (
                  <div className="flex items-center gap-3 py-2 px-4 bg-indigo-500/10 border border-indigo-500/20 rounded-lg mb-6">
                    <Icon
                      icon="solar:document-text-bold"
                      className="text-indigo-400"
                    />
                    <span className="text-indigo-200 text-sm italic">
                      {file.name}
                    </span>
                    <button
                      className="text-slate-400 hover:text-red-400"
                      onClick={resetFile}>
                      <Icon icon="solar:close-circle-bold" />
                    </button>
                  </div>
                ) : null}

                <button
                  onClick={handleStartInterview}
                  disabled={!file || isUploading}
                  className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
                    file && !isUploading
                      ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/40 cursor-pointer"
                      : "bg-slate-800 text-slate-500 cursor-not-allowed"
                  }`}>
                  {isUploading ? (
                    <>
                      正在生成面试题
                      <LoadingDots />
                    </>
                  ) : (
                    <>
                      开始面试
                      <Icon icon="solar:arrow-right-bold" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 流程展示 */}
        <div>
          <h2 className="text-2xl font-bold text-center mb-12">面试流程</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-slate-800 to-transparent -z-10"></div>

            {/* 步骤 1 */}
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl hover:bg-slate-900 transition-colors">
              <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-lg flex items-center justify-center mb-4 font-bold text-xl">
                1
              </div>
              <h4 className="text-lg font-bold text-white mb-2">上传简历</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                支持 PDF 格式，AI 将深度解析您的技能矩阵、项目经验与技术栈偏好。
              </p>
            </div>

            {/* 步骤 2 */}
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl hover:bg-slate-900 transition-colors">
              <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-lg flex items-center justify-center mb-4 font-bold text-xl">
                2
              </div>
              <h4 className="text-lg font-bold text-white mb-2">智能问答</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                AI
                将根据简历内容发起挑战，实时追问技术细节，评估您的知识深度与逻辑。
              </p>
            </div>

            {/* 步骤 3 */}
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl hover:bg-slate-900 transition-colors">
              <div className="w-12 h-12 bg-pink-500/20 text-pink-400 rounded-lg flex items-center justify-center mb-4 font-bold text-xl">
                3
              </div>
              <h4 className="text-lg font-bold text-white mb-2">获取报告</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                面试结束后立即生成多维度的技能雷达图与详尽的改进建议报告。
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* 底部 */}
      <footer className="mt-24 py-12 border-t border-slate-900 text-center">
        <p className="text-slate-600 text-sm">
          © 2026 AI 智能面试官 | 专业级技术面试平台
        </p>
      </footer>
    </div>
  );
}
