"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginInput } from "@/lib/validations";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginInput) => {
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      
      const resData = await res.json();
      
      if (!res.ok) {
        setError(resData.error || "Login failed");
        return;
      }
      
      setUser(resData.user);
      router.push("/");
    } catch (err) {
      setError("An unexpected error occurred.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-md p-8 border rounded-2xl shadow-sm bg-card text-card-foreground">
        <h1 className="text-2xl font-bold mb-6 text-center tracking-tight">Login to BookMyTurf</h1>
        
        {error && <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm font-medium">{error}</div>}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5">Email</label>
            <input 
              {...register("email")}
              type="email"
              className="w-full bg-background border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary transition-all"
              placeholder="you@example.com"
            />
            {errors.email && <p className="text-destructive text-xs mt-1.5">{errors.email.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1.5">Password</label>
            <input 
              {...register("password")}
              type="password"
              className="w-full bg-background border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary transition-all"
              placeholder="••••••••"
            />
            {errors.password && <p className="text-destructive text-xs mt-1.5">{errors.password.message}</p>}
          </div>

          <Button type="submit" size="lg" className="w-full rounded-lg" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Log In"}
          </Button>
        </form>
        
        <p className="mt-6 text-sm text-center text-muted-foreground">
          Don't have an account? <a href="/register" className="text-primary font-semibold hover:underline">Sign up</a>
        </p>
      </div>
    </div>
  );
}
