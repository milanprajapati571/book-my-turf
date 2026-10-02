import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { bookingId } = await req.json();

    if (!bookingId) {
      return NextResponse.json({ error: "Missing booking ID" }, { status: 400 });
    }

    const updatedBooking = await prisma.booking.updateMany({
      where: { 
        id: bookingId,
        status: "PENDING" // Only cancel if it's currently pending
      },
      data: {
        status: "CANCELLED",
      },
    });

    return NextResponse.json({ success: true, cancelled: updatedBooking.count > 0 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
