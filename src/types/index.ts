/**
 * AI 模拟面试应用 - 数据类型定义
 * 匹配后端接口返回格式
 */

/**
 * 问题对象
 */
export interface Question {
  id: string;
  questionText: string;
}

/**
 * 评价对象
 */
export interface Evaluation {
  technicalScore: number;
  communicationScore: number;
  experienceScore: number;
  feedback: string;
  /** 技术栈评分（如 {"React": 85, "Vue": 78}） */
  techSkillScores?: Record<string, number>;
}

/**
 * 回答响应类型
 */
export type AnswerType = "followup" | "next" | "finished";

/**
 * 面试记录项
 */
export interface QuestionRecord {
  id: string;
  questionText: string;
  answerText: string;
  technicalScore: number;
  communicationScore: number;
  experienceScore: number;
  feedback: string;
  /** 该问题涉及的技术栈 */
  techSkills?: string[];
  /** 技术栈评分 */
  techSkillScores?: Record<string, number>;
  createdAt: string;
}

/**
 * 技能指标项
 */
export interface SkillItem {
  name: string;
  score: number;
}

/**
 * 面试结果
 */
export interface InterviewResult {
  technicalScore: number;
  communicationScore: number;
  experienceScore: number;
  summary: string;
  /** 动态技能评分维度（用于雷达图） */
  skills: SkillItem[];
  questions: QuestionRecord[];
}

/**
 * 开始面试响应
 */
export interface StartInterviewResponse {
  interviewId: string;
  question: Question;
  /** 从简历中提取的技术栈列表 */
  extractedTechSkills: string[];
}

/**
 * 提交回答响应
 */
export interface SubmitAnswerResponse {
  type: AnswerType;
  question?: Question;
  evaluation?: Evaluation;
}

/**
 * 消息类型
 */
export type MessageRole = "ai" | "user";

/**
 * 聊天消息
 */
export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  evaluation?: Evaluation;
  timestamp: Date;
  isLoading?: boolean;
}
