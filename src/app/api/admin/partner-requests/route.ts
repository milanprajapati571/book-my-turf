import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (session?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const requests = await prisma.partnerRequest.findMany({
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json({ requests });
}

export async function PUT(req: Request) {
  const session = await getSession();
  if (session?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id, status } = await req.json(); // status = APPROVED or REJECTED
  
  const partnerReq = await prisma.partnerRequest.update({
    where: { id },
    data: { status },
    include: { user: true }
  });

  if (status === "APPROVED") {
    await prisma.user.update({
      where: { id: partnerReq.userId },
      data: { role: "OWNER" }
    });
    // Can trigger an email to the user here.
  }

  return NextResponse.json({ success: true, partnerReq });
}
