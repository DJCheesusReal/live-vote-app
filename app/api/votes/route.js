import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

// Tell Vercel to run this on the Edge for speed
export const runtime = "edge";

export async function GET() {
  try {
    const [djCount, chillyCount] = await kv.mget(
      "vote:dj_cheesuslive",
      "vote:chillyplayzwastaken"
    );
    return NextResponse.json({
      dj_cheesuslive: djCount || 0,
      chillyplayzwastaken: chillyCount || 0,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
