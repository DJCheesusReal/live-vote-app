import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { voteId } = await request.json();
    if (!["dj_cheesuslive", "chillyplayzwastaken"].includes(voteId)) {
      return NextResponse.json(
        { error: "Invalid contestant" },
        { status: 400 }
      );
    }
    await kv.incr(`vote:${voteId}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
