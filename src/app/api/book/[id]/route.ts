import { NextRequest, NextResponse } from "next/server";
// get 请求获取动态参数
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  console.log("id---", id); // 获取动态参数
  return NextResponse.json({ id });
}
