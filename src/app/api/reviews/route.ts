import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { reviewSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const result = reviewSchema.safeParse(body);

    if (!result.success) return NextResponse.json({ error: result.error.errors }, { status: 400 });

    const { turfId, rating, comment } = result.data;

    // Optional: Verify that the user has a CONFIRMED past booking for this turf before allowing a review.
    const hasBooked = await prisma.booking.findFirst({
      where: { turfId, userId: session.userId, status: "CONFIRMED" }
    });

    if (!hasBooked) {
      return NextResponse.json({ error: "You can only review turfs you have booked." }, { status: 403 });
    }

    const review = await prisma.review.create({
      data: {
        turfId,
        userId: session.userId,
        rating,
        comment,
      }
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
