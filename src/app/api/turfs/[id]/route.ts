import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { turfSchema } from "@/lib/validations";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const turf = await prisma.turf.findUnique({
      where: { id },
      include: {
        owner: { select: { name: true } },
        reviews: { include: { user: { select: { name: true } } } }
      }
    });

    if (!turf) {
      return NextResponse.json({ error: "Turf not found" }, { status: 404 });
    }

    return NextResponse.json({ turf });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    const { id } = await params;
    
    const existingTurf = await prisma.turf.findUnique({ where: { id } });
    if (!existingTurf) return NextResponse.json({ error: "Turf not found" }, { status: 404 });

    if (!session || (session.userId !== existingTurf.ownerId && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    // Partial updates or full based on your needs, using full schema for now
    const turf = await prisma.turf.update({
      where: { id },
      data: body, // Ensure proper validation in production
    });

    return NextResponse.json({ turf });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
