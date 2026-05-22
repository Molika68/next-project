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
  const option = {
    backgroundColor: "transparent",
    radar: {
      indicator: [
        { name: "技术能力", max: 100 },
        { name: "表达能力", max: 100 },
        { name: "项目经验", max: 100 },
      ],
      shape: "polygon",
      splitNumber: 4,
      axisName: {
        color: "#9CA3AF",
        fontSize: 12,
      },
      splitLine: {
        lineStyle: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: ["rgba(6, 182, 212, 0.05)", "rgba(124, 58, 237, 0.05)"],
        },
      },
      axisLine: {
        lineStyle: {
          color: "rgba(255, 255, 255, 0.2)",
        },
      },
    },
    series: [
      {
        type: "radar",
        data: [
          {
            value: [
              result.technicalScore,
              result.communicationScore,
              result.experienceScore,
            ],
            name: "面试评分",
            symbol: "circle",
            symbolSize: 6,
            lineStyle: {
              width: 2,
              color: {
                type: "linear",
                x: 0,
                y: 0,
                x2: 1,
                y2: 1,
                colorStops: [
                  { offset: 0, color: "#06b6d4" },
                  { offset: 1, color: "#7c3aed" },
                ],
              },
            },
            areaStyle: {
              color: {
                type: "linear",
                x: 0,
                y: 0,
                x2: 1,
                y2: 1,
                colorStops: [
                  { offset: 0, color: "rgba(6, 182, 212, 0.3)" },
                  { offset: 1, color: "rgba(124, 58, 237, 0.3)" },
                ],
              },
            },
            itemStyle: {
              color: "#06b6d4",
            },
          },
        ],
      },
    ],
  };

  return (
    <div className="w-full h-64 md:h-80">
      <ReactECharts
        option={option}
        style={{ height: "100%", width: "100%" }}
        opts={{ renderer: "canvas" }}
      />
    </div>
  );
}
