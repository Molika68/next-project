"use client";

import { Toaster } from "sonner";

/**
 * 客户端布局组件
 * 包含需要在客户端渲染的内容
 */
export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            backgroundColor: "#1e293b",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            color: "#f1f5f9",
          },
        }}
      />
    </>
  );
}
