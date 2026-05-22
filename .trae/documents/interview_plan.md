# AI 模拟面试应用 - 前端实现计划

## 一、项目背景与目标

根据 `README.md`，本项目是一个基于 AI 的模拟面试应用：

- 用户上传简历后，AI 自动生成面试题并根据回答追问
- 最终给出评价和技能雷达图

**核心用户流程**：

1. 用户访问首页，上传简历 PDF
2. 进入面试页，AI 根据简历生成第一道面试题（流式显示）
3. 用户在输入框打字回答，点击提交
4. AI 分析回答，给出追问或进入下一题
5. 面试结束（5 题后或用户主动结束），跳转结果页
6. 结果页用 ECharts 展示技能雷达图 + 面试记录回顾

***

## 二、现有代码分析

### 2.1 当前文件结构

```
src/
├── app/
│   ├── api/           # 临时 mock API（待删除）
│   ├── book/          # 示例页面（待删除）
│   ├── components/    # 布局组件
│   ├── home/          # 示例首页（待替换）
│   ├── layout.tsx     # 根布局
│   ├── page.tsx       # 登录页面（待替换为首页）
│   └── globals.css
├── components/ui/     # shadcn 组件库
├── hooks/             # 自定义 hooks
└── lib/               # 工具函数
```

### 2.2 技术栈

- Next.js 16 + TypeScript
- Tailwind CSS 4
- shadcn/ui 组件库
- sonner 通知组件

### 2.3 后端接口（已就绪）

后端服务已在 `nest-project` 准备完成，服务地址：`http://localhost:3000`

| 接口路径                        | HTTP 方法 | 功能描述              |
| :-------------------------- | :------ | :---------------- |
| `/api/interview/start`      | POST    | 开始面试（上传简历，生成第一道题） |
| `/api/interview/answer`     | POST    | 提交回答（返回追问/下一题/结束） |
| `/api/interview/result/:id` | GET     | 获取面试结果（评分和综合评价）   |

***

## 三、分步实现计划

### 模块 1：数据类型定义（优先级：高）

**目标**：定义统一的数据类型，匹配后端接口返回格式

**涉及文件**：

- `src/types/index.ts` - 新建类型定义文件

**核心类型定义**：

```typescript
// 问题对象
interface Question {
  id: string;
  questionText: string;
}

// 评价对象
interface Evaluation {
  technicalScore: number;
  communicationScore: number;
  experienceScore: number;
  feedback: string;
}

// 回答响应类型
type AnswerType = 'followup' | 'next' | 'finished';

// 面试记录项
interface QuestionRecord {
  id: string;
  questionText: string;
  answerText: string;
  technicalScore: number;
  communicationScore: number;
  experienceScore: number;
  feedback: string;
  createdAt: string;
}

// 面试结果
interface InterviewResult {
  technicalScore: number;
  communicationScore: number;
  experienceScore: number;
  summary: string;
  questions: QuestionRecord[];
}
```

***

### 模块 2：首页 - 简历上传（优先级：高）

**目标**：实现首页，支持用户上传简历 PDF 文件并开始面试

**设计要求**：

- 简约大气的科技感设计
- 同时支持PC 端和移动端的响应式布局

**涉及文件**：

- `src/app/page.tsx` - 重写为首页（替换现有登录页面）
- `src/components/resume-uploader.tsx` - 新建简历上传组件

**核心代码逻辑**：

1. 文件上传组件（支持拖拽上传和点击上传）
2. 使用 FormData 发送 multipart/form-data 请求
3. 调用后端 `POST http://localhost:3000/api/interview/start`
4. 成功后保存 interviewId 并跳转到 `/interview` 页面

**实现步骤**：

1. 创建简历上传组件（使用 react-dropzone）
2. 实现文件类型和大小验证（PDF，<10MB）
3. 调用后端 API 创建面试会话
4. 将 interviewId 存入 localStorage 或 URL 参数
5. 成功后跳转到面试页面

***

### 模块 3：面试页 - 对话交互（优先级：高）

**目标**：实现面试对话界面，支持流式显示 AI 回答

**设计要求**：

- 深色主题、渐变背景、发光效果
- 流畅的打字机动画效果
- 移动端适配（单列布局、触摸友好）

**涉及文件**：

- `src/app/interview/page.tsx` - 新建面试页面
- `src/components/chat-bubble.tsx` - 新建聊天气泡组件
- `src/components/answer-input.tsx` - 新建回答输入组件

**核心代码逻辑**：

1. 消息列表展示（AI 问题 + 用户回答）
2. 流式文本渲染（打字机效果）
3. 回答输入框（支持 Enter 提交）
4. 调用后端 `POST http://localhost:3000/api/interview/answer`
5. 根据响应 type 字段判断：
   - `followup`：继续提交回答（追问）
   - `next`：继续提交回答（下一题）
   - `finished`：跳转到结果页 `/result/:id`
6. 面试进度追踪（5 题限制）
7. 主动结束面试功能

**实现步骤**：

1. 创建聊天消息列表组件
2. 实现流式文本显示效果
3. 实现回答输入和提交逻辑
4. 实现面试进度和结束控制

***

### 模块 4：结果页 - 技能雷达图（优先级：高）

**目标**：展示面试结果，包含技能雷达图和面试记录

**设计要求**：

- ECharts 雷达图展示三项评分
- 面试记录时间线展示
- 移动端自适应布局

**涉及文件**：

- `src/app/result/[id]/page.tsx` - 新建结果页面
- `src/components/radar-chart.tsx` - 新建雷达图组件

**核心代码逻辑**：

1. URL 参数获取面试 ID
2. 调用后端 `GET http://localhost:3000/api/interview/result/:id`
3. 使用 ECharts 渲染技能雷达图（三个维度：技术能力、表达能力、项目经验）
4. 展示面试问答记录时间线
5. 提供重新开始面试入口

**实现步骤**：

1. 安装 ECharts 依赖
2. 创建雷达图组件
3. 获取并展示面试结果数据
4. 展示完整面试记录

***

### 模块 5：UI 组件完善（优先级：中）

**目标**：完善全局布局和组件样式，实现简约大气的科技感设计

**设计要求**：

- **科技感风格**：深色主题、渐变背景、发光效果、流畅动画
- **移动端适配**：响应式布局、触摸友好、小屏幕优化

**涉及文件**：

- `src/app/layout.tsx` - 更新全局布局
- `src/app/globals.css` - 全局样式（科技感主题）
- `src/components/ui/*` - 完善 UI 组件

**核心代码逻辑**：

1. **科技感配色方案**：
   - 主色调：深蓝色/紫色渐变 (#0f172a → #1e1b4b → #7c3aed)
   - 辅助色：青蓝色高亮 (#06b6d4)、绿色状态 (#22c55e)
   - 深色背景配合发光效果和渐变阴影
2. **动画效果**：
   - 淡入淡出过渡
   - 平滑滚动
   - 打字机效果（AI 回答流式显示）
   - 悬停微动画
3. **响应式布局**：
   - 使用 Tailwind CSS 4 响应式断点
   - 移动端：单列布局、底部导航
   - 平板：双列布局
   - 桌面：完整侧边栏布局
4. **移动端优化**：
   - 触摸友好的按钮尺寸（最小 44px）
   - 输入框自适应宽度
   - 聊天区域自适应高度

***

### 模块 6：工具函数与配置（优先级：低）

**目标**：创建 API 调用工具和环境配置

**涉及文件**：

- `src/lib/api.ts` - API 调用工具函数
- `src/lib/utils.ts` - 通用工具函数
- `next.config.ts` - Next.js 配置（添加后端代理）

**核心代码逻辑**：

1. 创建统一的 API 调用函数
2. 配置 Next.js 代理指向后端服务
3. 实现错误处理和请求拦截

***

## 四、依赖安装清单

| 依赖名称              | 用途               | 安装命令                         |
| ----------------- | ---------------- | ---------------------------- |
| echarts           | 雷达图可视化           | `pnpm add echarts`           |
| echarts-for-react | React ECharts 封装 | `pnpm add echarts-for-react` |
| react-dropzone    | 文件拖拽上传           | `pnpm add react-dropzone`    |

***

## 五、路由规划

| 页面  | 路由             | 说明           |
| --- | -------------- | ------------ |
| 首页  | `/`            | 上传简历、开始面试    |
| 面试页 | `/interview`   | 对话界面，预取第一题   |
| 结果页 | `/result/[id]` | 技能雷达图 + 面试记录 |

***

## 六、API 接口清单（后端已就绪）

### 1. 开始面试接口

**请求地址**：`POST http://localhost:3000/api/interview/start`

**请求格式**：`multipart/form-data`

| 参数名      | 类型   | 必填 | 说明        |
| :------- | :--- | :- | :-------- |
| `resume` | File | 是  | 简历 PDF 文件 |

**成功响应**（200）：

```json
{
  "interviewId": "uuid-string",
  "question": {
    "id": "uuid-string",
    "questionText": "请描述你最熟悉的一个项目..."
  }
}
```

***

### 2. 提交回答接口

**请求地址**：`POST http://localhost:3000/api/interview/answer`

**请求格式**：`application/json`

**请求体**：

| 参数名           | 类型     | 必填 | 说明      |
| :------------ | :----- | :- | :------ |
| `interviewId` | String | 是  | 面试会话 ID |
| `answer`      | String | 是  | 用户的回答文本 |

**成功响应**（200）：

```json
{
  "type": "followup",
  "question": {
    "id": "uuid-string",
    "questionText": "追问：在这个项目中，你遇到的最大挑战是什么？"
  },
  "evaluation": {
    "technicalScore": 75,
    "communicationScore": 80,
    "experienceScore": 70,
    "feedback": "回答较好，但技术细节描述不够深入..."
  }
}
```

**type 字段说明**：

- `followup`：需要追问（回答得分低于 60 分）
- `next`：下一道题目
- `finished`：面试结束

***

### 3. 获取面试结果接口

**请求地址**：`GET http://localhost:3000/api/interview/result/:id`

**路径参数**：

| 参数名  | 类型     | 必填 | 说明      |
| :--- | :----- | :- | :------ |
| `id` | String | 是  | 面试会话 ID |

**成功响应**（200）：

```json
{
  "technicalScore": 82,
  "communicationScore": 78,
  "experienceScore": 85,
  "summary": "综合评价：该候选人技术功底扎实，项目经验丰富...",
  "questions": [
    {
      "id": "uuid-string",
      "questionText": "请描述你最熟悉的一个项目...",
      "answerText": "我在 XX 公司负责了一个电商平台项目...",
      "technicalScore": 85,
      "communicationScore": 80,
      "experienceScore": 90,
      "feedback": "项目描述清晰，技术选型合理...",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

***

## 七、实现顺序建议

1. **第一步**：模块 1 - 定义数据类型
2. **第二步**：模块 6 - 创建 API 工具函数和配置代理
3. **第三步**：模块 2 - 首页简历上传
4. **第四步**：模块 3 - 面试页对话交互
5. **第五步**：模块 4 - 结果页雷达图
6. **第六步**：模块 5 - UI 组件完善（科技感风格）

***

## 八、风险与注意事项

1. **文件大小限制**：简历上传需限制文件大小（建议 < 10MB）
2. **后端服务依赖**：确保后端服务运行在 `http://localhost:3000`
3. **状态持久化**：使用 localStorage 存储 interviewId
4. **ECharts 兼容性**：确保 Next.js SSR 环境下正确渲染
5. **错误处理**：完善网络请求失败时的用户提示

