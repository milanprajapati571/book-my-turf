import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { bookingSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = bookingSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.errors }, { status: 400 });
    }

    const { turfId, date, startTime, endTime } = result.data;

    // Concurrency Control: Use a transaction to check if slot is free and then book it
    const newBooking = await prisma.$transaction(async (tx) => {
      // 1. Fetch the turf to get pricing
      const turf = await tx.turf.findUnique({ where: { id: turfId } });
      if (!turf) throw new Error("Turf not found");

      // 2. Check for overlapping CONFIRMED or PENDING bookings
      const overlappingBookings = await tx.booking.findMany({
        where: {
          turfId,
          date,
          status: { in: ["CONFIRMED", "PENDING"] },
          OR: [
            { startTime: { lt: endTime }, endTime: { gt: startTime } }
          ]
        }
      });

      if (overlappingBookings.length > 0) {
        throw new Error("Slot already booked or pending payment");
      }

      // Calculate total amount (mock logic based on hours)
      const hours = (new Date(endTime).getTime() - new Date(startTime).getTime()) / (1000 * 60 * 60);
      const totalAmount = hours * turf.pricePerHour;

      // 3. Create the booking as PENDING
      return await tx.booking.create({
        data: {
          turfId,
          userId: session.userId,
          date,
          startTime,
          endTime,
          totalAmount,
          status: "PENDING"
        }
      });
    });

    const { razorpay } = await import("@/lib/razorpay");
    const order = await razorpay.orders.create({
      amount: newBooking.totalAmount * 100, // Amount in paise
      currency: "INR",
      receipt: `receipt_${newBooking.id}`,
    });

    return NextResponse.json({ booking: newBooking, order }, { status: 201 });
  } catch (error: any) {
    if (error.message === "Slot already booked or pending payment") {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Return bookings for the user. If owner, return bookings for their turfs.
    const bookings = await prisma.booking.findMany({
      where: session.role === "USER" 
        ? { userId: session.userId }
        : { turf: { ownerId: session.userId } },
      include: {
        turf: { select: { name: true, location: true } },
        user: { select: { name: true, email: true } }
      },
      orderBy: { date: 'desc' }
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
