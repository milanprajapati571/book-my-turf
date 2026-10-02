import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";
import * as React from "react";

interface BookingConfirmationEmailProps {
  userName: string;
  turfName: string;
  date: string;
  timeSlot: string;
  totalAmount: number;
  qrCodeDataUrl: string; // Base64 data URL for the QR code image
}

export const BookingConfirmationEmail = ({
  userName,
  turfName,
  date,
  timeSlot,
  totalAmount,
  qrCodeDataUrl,
}: BookingConfirmationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your booking at {turfName} is confirmed!</Preview>
      <Tailwind>
        <Body className="bg-gray-100 font-sans">
          <Container className="bg-white border border-gray-200 rounded-lg my-10 mx-auto p-8 max-w-xl">
            <Heading className="text-2xl font-bold text-center text-black mb-6">
              Booking Confirmed!
            </Heading>
            <Text className="text-gray-700 text-lg mb-4">
              Hi {userName},
            </Text>
            <Text className="text-gray-700 text-base mb-6">
              Your payment of <strong className="text-green-600">₹{totalAmount}</strong> was successful. 
              Here are your booking details for <strong>{turfName}</strong>:
            </Text>
            
            <Section className="bg-gray-50 rounded-md p-6 mb-8 text-center border">
              <Text className="text-xl font-semibold mb-2">{date}</Text>
              <Text className="text-gray-600 mb-4">{timeSlot}</Text>
              
              <Text className="text-sm text-gray-500 mb-4">Show this QR code at the venue for entry:</Text>
              <Img 
                src={qrCodeDataUrl} 
                alt="Booking Ticket QR Code" 
                width="200" 
                height="200" 
                className="mx-auto rounded-md shadow-sm border"
              />
            </Section>

            <Text className="text-sm text-gray-500 text-center mt-8">
              Thank you for choosing BookMyTurf! If you have any questions, reply to this email.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default BookingConfirmationEmail;
