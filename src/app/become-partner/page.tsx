"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { turfSchema, TurfInput } from "@/lib/validations";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store";
import toast from "react-hot-toast";

const SPORTS_OPTIONS = ["Football", "Cricket", "Tennis", "Badminton", "Pickleball", "Basketball"];

export default function RegisterTurfPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm<TurfInput>({
    resolver: zodResolver(turfSchema),
    defaultValues: {
      sports: []
    }
  });

  const toggleSport = (sport: string) => {
    const updated = selectedSports.includes(sport)
      ? selectedSports.filter(s => s !== sport)
      : [...selectedSports, sport];
    setSelectedSports(updated);
    setValue("sports", updated);
  };

  const onSubmit = async (data: TurfInput) => {
    if (!user) {
      toast.error("Please login first to register a turf.");
      router.push("/login");
      return;
    }
    
    try {
      const uploadedUrls: string[] = [];
      
      // Upload all images sequentially to Cloudinary
      if (imageFiles.length > 0) {
        setUploading(true);
        for (const file of imageFiles) {
          const formData = new FormData();
          formData.append("file", file);
          const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
          const uploadData = await uploadRes.json();
          if (uploadData.url) {
            uploadedUrls.push(uploadData.url);
          }
        }
        setUploading(false);
      }

      // Create turf record
      const payload = { ...data, images: uploadedUrls };
      const res = await fetch("/api/turfs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success("Turf registered successfully! It is now live.");
        window.location.href = "/dashboard";
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to register turf");
      }
    } catch (e) {
      toast.error("An error occurred during registration.");
      setUploading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center mt-12">
        <h1 className="text-3xl font-bold mb-4 tracking-tight">Register Your Turf</h1>
        <p className="text-muted-foreground mb-8 text-lg">You must be logged in to register a turf.</p>
        <Button onClick={() => router.push("/login")} size="lg" className="rounded-xl px-8 cursor-pointer">
          Login to Register
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-10 bg-card text-card-foreground border rounded-2xl mt-8 shadow-sm">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-3 tracking-tight">Register Your Turf</h1>
        <p className="text-muted-foreground">Fill in the details below to instantly list your turf for users to book.</p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1.5">Turf Name</label>
          <input {...register("name")} className="w-full bg-background border p-3 rounded-lg outline-none focus:ring-2 focus:ring-primary transition-all" placeholder="e.g. Champions Arena" />
          {errors.name && <p className="text-destructive text-xs mt-1.5">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Map Location / Address</label>
          <input {...register("location")} className="w-full bg-background border p-3 rounded-lg outline-none focus:ring-2 focus:ring-primary transition-all" placeholder="Full address" />
          {errors.location && <p className="text-destructive text-xs mt-1.5">{errors.location.message}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium mb-1.5">Rate / Price per Hour (₹)</label>
            <input type="number" {...register("pricePerHour")} className="w-full bg-background border p-3 rounded-lg outline-none focus:ring-2 focus:ring-primary transition-all" placeholder="e.g. 500" />
            {errors.pricePerHour && <p className="text-destructive text-xs mt-1.5">{errors.pricePerHour.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Capacity (Max People)</label>
            <input type="number" {...register("capacity")} className="w-full bg-background border p-3 rounded-lg outline-none focus:ring-2 focus:ring-primary transition-all" placeholder="e.g. 14" />
            {errors.capacity && <p className="text-destructive text-xs mt-1.5">{errors.capacity.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Operating Hours</label>
          <input {...register("operatingHours")} className="w-full bg-background border p-3 rounded-lg outline-none focus:ring-2 focus:ring-primary transition-all" placeholder="e.g. 6:00 AM - 11:00 PM" />
          {errors.operatingHours && <p className="text-destructive text-xs mt-1.5">{errors.operatingHours.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Sports Supported</label>
          <div className="flex flex-wrap gap-2">
            {SPORTS_OPTIONS.map(sport => (
              <div 
                key={sport} 
                onClick={() => toggleSport(sport)}
                className={`px-4 py-2 border rounded-full text-sm font-medium cursor-pointer transition-all ${
                  selectedSports.includes(sport) 
                  ? "bg-primary text-primary-foreground border-primary" 
                  : "bg-background hover:bg-muted"
                }`}
              >
                {sport}
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Description (General Details)</label>
          <textarea {...register("description")} className="w-full bg-background border p-3 rounded-lg h-24 outline-none focus:ring-2 focus:ring-primary transition-all" placeholder="Tell users about the turf facilities..." />
          {errors.description && <p className="text-destructive text-xs mt-1.5">{errors.description.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Turf Photos (Select multiple)</label>
          <input 
            type="file" 
            accept="image/*" 
            multiple
            onChange={(e) => {
              if (e.target.files) {
                setImageFiles(Array.from(e.target.files));
              }
            }}
            className="w-full file:bg-primary file:text-primary-foreground file:border-0 file:px-4 file:py-2.5 file:rounded-md file:cursor-pointer file:font-medium hover:file:bg-primary/90 file:mr-4 border bg-background rounded-lg p-2"
          />
          <p className="text-xs text-muted-foreground mt-2">The first image will be used as the cover photo.</p>
          {imageFiles.length > 0 && (
            <p className="text-sm font-medium mt-2 text-primary">{imageFiles.length} file(s) selected.</p>
          )}
        </div>

        <Button type="submit" size="lg" disabled={isSubmitting || uploading} className="w-full rounded-xl py-6 text-lg cursor-pointer">
          {uploading ? "Uploading Images..." : isSubmitting ? "Registering..." : "Register Turf Instantly"}
        </Button>
      </form>
    </div>
  );
}
