import { db } from "@/config/db";
import { chatTable, frameTable } from "@/config/schema";
import { and,eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const frameId = searchParams.get("frameId");
    const projectId=searchParams.get("projectId");

    if (!frameId) {
      return NextResponse.json({ error: "Missing frameId" }, { status: 400 });
    }

    // Fetch the frame details
    const frameResult = await db.select().from(frameTable).where(eq(frameTable.frameId, frameId));

    // Fetch the chat messages associated with this frame
    const chatResult = await db.select().from(chatTable).where(eq(chatTable.frameId, frameId));

    if (!frameResult.length) {
      return NextResponse.json({ error: "Frame not found" }, { status: 404 });
    }

    const finalResult = {
      ...frameResult[0],
      chatMessage: chatResult[0]?.chatMessage ?? null,
    };

    return NextResponse.json(finalResult);
  } catch (error) {
    console.error("Error in /api/frames:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req:NextRequest){
  const {designCode,frameId,projectId} = await req.json();
  const result= await db.update(frameTable).set({
    designCode:designCode
  }).where(and(eq(frameTable.frameId,frameId),eq(frameTable.projectId,projectId)));
  return NextResponse.json({result:'updated'});
}
