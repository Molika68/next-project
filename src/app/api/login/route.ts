import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
export async function POST(request: NextRequest) {
  // const { searchParams } = request.nextUrl;
  // const username = searchParams.get("username");
  // const password = searchParams.get("password");

  const body = await request.json();
  const { username, password } = body;

  if (username === "admin" && password === "admin") {
    const cookieStore = await cookies();
    cookieStore.set("token", "123456", {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: true,
    });
    return NextResponse.json(
      { code: 200, message: "Logged in successfully" },
      {
        status: 200,
      },
    );
  }
  return NextResponse.json(
    { code: 401, message: "Invalid username or password" },
    {
      status: 401,
    },
  );
}

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  if (token && token.value === "123456") {
    return NextResponse.json({ code: 200 });
  } else {
    return NextResponse.json({ code: 401 });
  }
}
