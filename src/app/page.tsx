"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    console.log("登录");
    fetch("/api/login", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    })
      .then(res => res.json())
      .then(data => {
        console.log(data);
        if (data.code === 200) {
          // 登录成功
          toast.success("登录成功", { position: "top-center" });
          router.push("/home");
        } else {
          // 登录失败
          toast.error(data.message, { position: "top-center" });
        }
      });
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 h-screen">
      <Input
        type="text"
        placeholder="请输入用户名"
        style={{ width: "380px" }}
        onChange={e => setUsername(e.target.value)}
      />
      <Input
        type="password"
        placeholder="请输入密码"
        style={{ width: "380px" }}
        onChange={e => setPassword(e.target.value)}
      />
      <Button
        className="cursor-pointer"
        style={{ width: "380px" }}
        onClick={handleLogin}>
        登录
      </Button>
    </div>
  );
}
