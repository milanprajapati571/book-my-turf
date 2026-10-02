import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = await req.json();

    const secret = process.env.RAZORPAY_KEY_SECRET || "";
    
    // Create the expected signature
    const shasum = crypto.createHmac("sha256", secret);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const expectedSignature = shasum.digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Update the booking status to CONFIRMED
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "CONFIRMED",
        paymentId: razorpay_payment_id,
      },
      include: {
        user: true,
        turf: true,
      }
    });

    // Generate QR Code and Send Email
    try {
      const QRCode = await import("qrcode");
      const { Resend } = await import("resend");
      const { BookingConfirmationEmail } = await import("@/emails/BookingConfirmation");
      const { render } = await import("@react-email/components");

      const resend = new Resend(process.env.RESEND_API_KEY || "fallback_key");

      // Generate a QR code containing the booking ID and details
      const qrData = JSON.stringify({
        bookingId: updatedBooking.id,
        turf: updatedBooking.turf.name,
        date: updatedBooking.date,
      });
      const qrCodeDataUrl = await QRCode.toDataURL(qrData);

      const timeSlot = `${new Date(updatedBooking.startTime).toLocaleTimeString()} - ${new Date(updatedBooking.endTime).toLocaleTimeString()}`;

      // Render the React Email template to an HTML string
      const html = await render(
        BookingConfirmationEmail({
          userName: updatedBooking.user.name,
          turfName: updatedBooking.turf.name,
          date: new Date(updatedBooking.date).toLocaleDateString(),
          timeSlot,
          totalAmount: updatedBooking.totalAmount,
          qrCodeDataUrl,
        })
      );

      await resend.emails.send({
        from: "BookMyTurf <noreply@yourdomain.com>", // Note: update domain when verified
        to: updatedBooking.user.email,
        subject: `Booking Confirmed: ${updatedBooking.turf.name}`,
        html,
      });
    } catch (emailError) {
      console.error("Failed to send confirmation email", emailError);
      // We don't fail the payment verification if email fails
    }

    return NextResponse.json({ success: true, booking: updatedBooking });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
