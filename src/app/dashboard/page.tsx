"use client";

import { useAuthStore } from "@/lib/store";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  const { data, isLoading } = useQuery({
    queryKey: ["bookings"],
    queryFn: async () => {
      const res = await fetch("/api/bookings");
      return res.json();
    },
    enabled: !!user
  });

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        {user.role === "OWNER" && (
          <Link href="/dashboard/owner/turfs/new" className={buttonVariants()}>
            Add New Turf
          </Link>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <div className="bg-card text-card-foreground border rounded-xl p-6 shadow-sm">
          <h3 className="text-muted-foreground font-medium mb-1">Your Role</h3>
          <p className="text-3xl font-bold">{user.role}</p>
        </div>
        
        {user.role === "OWNER" && (
          <div className="bg-card text-card-foreground border rounded-xl p-6 shadow-sm">
            <h3 className="text-muted-foreground font-medium mb-1">Total Revenue</h3>
            <p className="text-3xl font-bold text-green-600 dark:text-green-500">
              ₹{data?.bookings?.reduce((acc: number, b: any) => acc + (b.status === "CONFIRMED" ? b.totalAmount : 0), 0) || "0.00"}
            </p>
          </div>
        )}
        
        <div className="bg-card text-card-foreground border rounded-xl p-6 shadow-sm">
          <h3 className="text-muted-foreground font-medium mb-1">Total Bookings</h3>
          <p className="text-3xl font-bold">{data?.bookings?.length || 0}</p>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mb-6">
        {user.role === "OWNER" ? "Recent Bookings for your Turfs" : "Your Booking History"}
      </h2>
      
      {isLoading ? (
        <div className="h-64 bg-muted animate-pulse rounded-xl" />
      ) : (
        <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-muted/50 text-muted-foreground border-b">
                <tr>
                  <th className="py-4 px-6 font-medium">Turf</th>
                  <th className="py-4 px-6 font-medium">Date & Time</th>
                  <th className="py-4 px-6 font-medium">Status</th>
                  <th className="py-4 px-6 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data?.bookings?.map((booking: any) => (
                  <tr key={booking.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-6 font-medium">{booking.turf.name}</td>
                    <td className="py-4 px-6">
                      {new Date(booking.date).toLocaleDateString()} <br className="hidden sm:block" />
                      <span className="text-muted-foreground text-xs">
                        {new Date(booking.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                        {new Date(booking.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        booking.status === "CONFIRMED" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
                        booking.status === "PENDING" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" : 
                        "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-medium">₹{booking.totalAmount}</td>
                  </tr>
                ))}
                {(!data?.bookings || data.bookings.length === 0) && (
                  <tr>
                    <td colSpan={4} className="py-8 px-6 text-center text-muted-foreground">
                      No bookings found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
