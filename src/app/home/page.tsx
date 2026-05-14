"use client";

import { useEffect, useState } from "react";
import { redirect, usePathname } from "next/navigation";

export default function Home() {
  const checkLogin = async () => {
    const res = await fetch("/api/login");
    const data = await res.json();
    return data.code === 200 ? true : false;
  };
  useEffect(() => {
    checkLogin().then(res => {
      if (!res) {
        // redirect to login page
        redirect("./");
      }
    });
  }, []);

  return <div>home</div>;
}
