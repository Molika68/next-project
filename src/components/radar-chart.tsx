"use client";

import ReactECharts from "echarts-for-react";
import type { InterviewResult } from "@/types";

/**
 * 技能雷达图组件
 */
interface RadarChartProps {
  result: InterviewResult;
}

export function RadarChart({ result }: RadarChartProps) {
  // 动态获取指标数据，优先使用接口返回的 skills，否则使用默认指标
  const skills =
    result.skills && result.skills.length > 0
      ? result.skills
      : [
          { name: "技术能力", score: result.technicalScore },
          { name: "表达能力", score: result.communicationScore },
          { name: "项目经验", score: result.experienceScore },
        ];

  const option = {
    backgroundColor: "transparent",
    padding: [10, 10, 10, 10],
    radar: {
      indicator: skills.map(skill => ({ name: skill.name, max: 100 })),
      shape: "polygon",
      splitNumber: 4,
      radius: "75%",
      axisName: {
        color: "#9CA3AF",
        fontSize: 14,
      },
      splitLine: {
        lineStyle: {
          color: "rgba(124, 58, 237, 0.25)",
        },
      },
      splitArea: {
        show: false,
      },
      axisLine: {
        lineStyle: {
          color: "rgba(124, 58, 237, 0.3)",
        },
      },
    },
    series: [
      {
        type: "radar",
        data: [
          {
            value: skills.map(skill => skill.score),
            name: "面试评分",
            symbol: "none",
            lineStyle: {
              width: 2.5,
              color: "#818cf8",
            },
            areaStyle: {
              color: "rgba(129, 140, 248, 0.45)",
            },
            itemStyle: {
              color: "#818cf8",
            },
          },
        ],
      },
    ],
  };

  return (
    <div className="w-full h-full min-h-[250px]">
      <ReactECharts
        option={option}
        style={{ height: "100%", width: "100%" }}
        opts={{ renderer: "canvas" }}
      />
    </div>
  );
}
