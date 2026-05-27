"use client";

import { useState, useEffect } from "react";

/**
 * 动态省略号组件
 * 实现一个点、两个点、三个点的循环动画效果
 */
export function LoadingDots() {
  const [dots, setDots] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev % 3) + 1);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return <span>{'.'.repeat(dots)}</span>;
}