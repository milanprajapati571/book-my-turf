"use client";

import { useState, useEffect, use } from "react";
import { useAuthStore } from "@/lib/store";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export default function TurfDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuthStore();
  
  // Booking state
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isBooking, setIsBooking] = useState(false);

  // Review state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Load Razorpay script dynamically
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const { data: turfData, isLoading, refetch } = useQuery({
    queryKey: ["turf", id],
    queryFn: async () => {
      const res = await fetch(`/api/turfs/${id}`);
      return res.json();
    }
  });

  const handleBooking = async () => {
    if (!user) {
      toast.error("Please login to book a turf");
      router.push("/login");
      return;
    }
    if (!date || !startTime || !endTime) {
      toast.error("Please select date and time slots");
      return;
    }

    setIsBooking(true);
    try {
      const startDateTime = new Date(`${date}T${startTime}`);
      const endDateTime = new Date(`${date}T${endTime}`);

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          turfId: id,
          date: new Date(date).toISOString(),
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
        })
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Booking failed");
        setIsBooking(false);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder", 
        amount: data.order.amount,
        currency: "INR",
        name: "BookMyTurf",
        description: `Booking for ${turfData?.turf?.name}`,
        order_id: data.order.id,
        handler: async function (response: any) {
          const verifyRes = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId: data.booking.id,
            })
          });

          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            toast.success("Payment successful! Your booking is confirmed.");
            router.push("/dashboard");
          } else {
            toast.error("Payment verification failed.");
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        modal: {
          ondismiss: async function() {
            await fetch("/api/payments/fail", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ bookingId: data.booking.id }),
            });
            setIsBooking(false);
          }
        },
        theme: {
          color: "#000000"
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", async function (response: any) {
        await fetch("/api/payments/fail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId: data.booking.id }),
        });
        toast.error(`Payment failed: ${response.error.description}`);
        setIsBooking(false);
      });
      rzp.open();

    } catch (error) {
      toast.error("An unexpected error occurred.");
      setIsBooking(false);
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please log in to submit a review.");
      return;
    }
    
    setIsSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ turfId: id, rating, comment })
      });
      
      if (res.ok) {
        toast.success("Review submitted successfully!");
        setComment("");
        setRating(5);
        refetch(); // Refresh reviews
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to submit review.");
      }
    } catch (error) {
      toast.error("An error occurred while submitting your review.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center">Loading turf details...</div>;
  if (!turfData?.turf) return <div className="p-8 text-center text-red-500">Turf not found.</div>;

  const turf = turfData.turf;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
      <div className="lg:col-span-2 space-y-10">
        
        {/* Images Section */}
        <div className="space-y-4">
          <div className="w-full aspect-video bg-muted rounded-2xl overflow-hidden shadow-sm">
            {turf.images?.[0] ? (
              <img src={turf.images[0]} alt={turf.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Image Available</div>
            )}
          </div>
          {turf.images?.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {turf.images.slice(1).map((img: string, idx: number) => (
                <img key={idx} src={img} alt={`${turf.name} ${idx+2}`} className="w-32 h-24 object-cover rounded-xl shadow-sm border" />
              ))}
            </div>
          )}
        </div>
        
        {/* Details Section */}
        <div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-3">{turf.name}</h1>
          <p className="text-muted-foreground text-lg mb-4">{turf.location}</p>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {turf.sports?.map((sport: string) => (
              <span key={sport} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                {sport}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8 bg-muted/30 p-6 rounded-2xl border">
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-1">Capacity</p>
              <p className="text-lg font-semibold">{turf.capacity ? `Up to ${turf.capacity} players` : "Not specified"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-1">Operating Hours</p>
              <p className="text-lg font-semibold">{turf.operatingHours || "Not specified"}</p>
            </div>
          </div>

          <div className="prose dark:prose-invert max-w-none">
            <h3 className="text-2xl font-semibold mb-3">About this Venue</h3>
            <p className="text-foreground/80 leading-relaxed text-lg whitespace-pre-wrap">{turf.description}</p>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="pt-8 border-t">
          <h3 className="text-2xl font-semibold mb-6">Reviews & Feedback</h3>
          
          <form onSubmit={submitReview} className="mb-10 bg-card border rounded-2xl p-6 shadow-sm">
            <h4 className="font-semibold mb-4 text-lg">Leave a Review</h4>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Rating (1-5)</label>
              <select 
                value={rating} 
                onChange={e => setRating(Number(e.target.value))} 
                className="w-full p-3 rounded-lg border bg-background outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              >
                {[5,4,3,2,1].map(num => (
                  <option key={num} value={num}>{num} Stars</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Comment</label>
              <textarea 
                value={comment} 
                onChange={e => setComment(e.target.value)} 
                placeholder="Share your experience (e.g., ground quality, lighting, staff...)"
                className="w-full p-3 rounded-lg border bg-background outline-none focus:ring-2 focus:ring-primary h-24"
                required
              />
            </div>
            <Button type="submit" disabled={isSubmittingReview} className="w-full sm:w-auto cursor-pointer rounded-xl px-8">
              {isSubmittingReview ? "Submitting..." : "Submit Review"}
            </Button>
          </form>

          <div className="space-y-6">
            {turf.reviews && turf.reviews.length > 0 ? (
              turf.reviews.map((rev: any) => (
                <div key={rev.id} className="pb-6 border-b last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-bold">{rev.user?.name}</h5>
                    <span className="text-primary font-semibold px-2 py-1 bg-primary/10 rounded-lg text-sm">
                      {rev.rating} / 5
                    </span>
                  </div>
                  <p className="text-foreground/80">{rev.comment}</p>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground italic">No reviews yet. Be the first to book and review!</p>
            )}
          </div>
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="bg-card text-card-foreground border rounded-2xl p-6 sm:p-8 shadow-sm sticky top-24">
          <h3 className="text-4xl font-bold mb-2">
            ₹{turf.pricePerHour} <span className="text-lg font-normal text-muted-foreground">/ hour</span>
          </h3>
          <p className="text-sm text-muted-foreground mb-8 pb-6 border-b">Managed by {turf.owner?.name}</p>

          {user?.role === "ADMIN" ? (
            <div className="text-center py-8">
              <h4 className="text-xl font-bold mb-2">Admin View</h4>
              <p className="text-muted-foreground">
                Administrators cannot book turfs. Please log in as a User to make a booking.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-5 mb-8">
                <div>
                  <label className="block text-sm font-medium mb-2">Select Date</label>
                  <input 
                    type="date" 
                    className="w-full bg-background border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary transition-all cursor-pointer"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Start Time</label>
                    <input 
                      type="time" 
                      className="w-full bg-background border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary transition-all cursor-pointer"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">End Time</label>
                    <input 
                      type="time" 
                      className="w-full bg-background border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary transition-all cursor-pointer"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Button 
                size="lg"
                className="w-full text-lg py-6 rounded-xl cursor-pointer" 
                onClick={handleBooking}
                disabled={isBooking}
              >
                {isBooking ? "Processing..." : "Confirm Booking"}
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-4">
                You won't be charged yet. Secure checkout powered by Razorpay.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
