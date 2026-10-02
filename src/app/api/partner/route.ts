import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.role === "OWNER" || session.role === "ADMIN") {
      return NextResponse.json({ error: "You are already an owner or admin." }, { status: 400 });
    }

    const existingRequest = await prisma.partnerRequest.findUnique({
      where: { userId: session.userId }
    });

    if (existingRequest) {
      return NextResponse.json({ error: "You already have a pending request." }, { status: 400 });
    }

    const partnerReq = await prisma.partnerRequest.create({
      data: {
        userId: session.userId,
        status: "PENDING",
      }
    });

    return NextResponse.json({ success: true, partnerReq }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
