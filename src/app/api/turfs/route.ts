import { NextResponse } from "next/server";
import { getSession, generateToken } from "@/lib/auth";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { turfSchema } from "@/lib/validations";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "APPROVED";
    
    // In production, we'd add pagination and location filtering here.
    const turfs = await prisma.turf.findMany({
      where: {
        status: status as any,
      },
      include: {
        owner: { select: { name: true } },
        reviews: { select: { rating: true } }
      }
    });

    return NextResponse.json({ turfs });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = turfSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.errors }, { status: 400 });
    }

    // Create the turf and automatically approve it based on user request
    const turf = await prisma.turf.create({
      data: {
        ...result.data,
        ownerId: session.userId,
        status: "APPROVED", // Auto-approve
      },
    });

    // If the user was a regular USER, upgrade them to OWNER
    if (session.role === "USER") {
      await prisma.user.update({
        where: { id: session.userId },
        data: { role: "OWNER" },
      });
      
      const newToken = generateToken({ userId: session.userId, role: "OWNER" });
      const cookieStore = await cookies();
      cookieStore.set("session", newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });
    }

    return NextResponse.json({ turf }, { status: 201 });
  } catch (error: any) {
    console.error("CREATE TURF ERROR:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
