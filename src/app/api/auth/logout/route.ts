import { NextResponse } from "next/server";

export async function POST() {
  const cookie = `lumiu_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; ${process.env.NODE_ENV === 'production' ? 'Secure;' : ''}`;
  return NextResponse.json({ success: true }, { headers: { "Set-Cookie": cookie } });
}
