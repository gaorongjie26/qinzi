import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("user");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("登出失败:", error);
    return NextResponse.json({ success: false });
  }
}
