/**
 * AI 模拟面试应用 - API 工具函数
 * 封装后端接口调用
 */

import type {
  StartInterviewResponse,
  SubmitAnswerResponse,
  InterviewResult,
} from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

/**
 * 开始面试 - 上传简历
 */
export async function startInterview(
  resume: File,
): Promise<StartInterviewResponse> {
  const formData = new FormData();
  formData.append("resume", resume);

  const response = await fetch(`${BASE_URL}/interview/start`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("面试启动失败");
  }

  return response.json();
}

/**
 * 提交回答
 */
export async function submitAnswer(
  interviewId: string,
  answer: string,
): Promise<SubmitAnswerResponse> {
  const response = await fetch(`${BASE_URL}/interview/answer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ interviewId, answer }),
  });

  if (!response.ok) {
    throw new Error("回答提交失败");
  }

  return response.json();
}

/**
 * 获取面试结果
 */
export async function getInterviewResult(id: string): Promise<InterviewResult> {
  const response = await fetch(`${BASE_URL}/interview/result/${id}`);

  if (!response.ok) {
    throw new Error("获取面试结果失败");
  }

  return response.json();
}
