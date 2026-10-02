"use client";

import { useQuery } from "@tanstack/react-query";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";

import { useAuthStore } from "@/lib/store";

export default function Home() {
  const { user } = useAuthStore();
  const { data, isLoading } = useQuery({
    queryKey: ["turfs"],
    queryFn: async () => {
      const res = await fetch("/api/turfs");
      return res.json();
    }
  });

  return (
    <main className="w-full">
      {/* Hero Section */}
      <section className="bg-primary/5 py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
            Your Game, Your Turf
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Discover and book the finest Football, Cricket, Tennis, and Pickleball turfs in your city instantly.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {user?.role === "ADMIN" && (
              <Link href="/dashboard" className={buttonVariants({ size: "lg", className: "rounded-full px-8 text-lg cursor-pointer" })}>
                Admin Dashboard
              </Link>
            )}
            <Link href="#explore" className={buttonVariants({ variant: user?.role === "ADMIN" ? "outline" : "default", size: "lg", className: "rounded-full px-8 text-lg cursor-pointer" })}>
              Book Turf
            </Link>
            <Link href="/become-partner" className={buttonVariants({ variant: "outline", size: "lg", className: "rounded-full px-8 text-lg cursor-pointer" })}>
              Own Turf
            </Link>
          </div>
        </div>
      </section>

      {/* Turfs Grid */}
      <section id="explore" className="max-w-7xl mx-auto py-16 px-6">
        <h2 className="text-3xl font-bold mb-8 text-center">Available Venues</h2>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-80 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data?.turfs?.map((turf: any) => (
              <div key={turf.id} className="group flex flex-col bg-card border text-card-foreground rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                <div className="h-56 overflow-hidden relative">
                  {turf.images?.[0] ? (
                    <img 
                      src={turf.images[0]} 
                      alt={turf.name} 
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                      No Image
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold shadow-sm">
                    ₹{turf.pricePerHour}/hr
                  </div>
                </div>
                
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold mb-2 line-clamp-1">{turf.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{turf.location}</p>
                  
                  <div className="mt-auto pt-4 flex items-center justify-between border-t">
                    <span className="text-sm font-medium text-primary">
                      {turf.owner?.name}
                    </span>
                    <Link href={`/turfs/${turf.id}`} className={buttonVariants({ variant: "default", className: "cursor-pointer" })}>
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            
            {(!data?.turfs || data.turfs.length === 0) && (
              <div className="col-span-full text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                No turfs registered yet. Partner with us to list your turf!
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
