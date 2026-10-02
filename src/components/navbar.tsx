"use client";

import Link from "next/link";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { LogOut, User as UserIcon, Menu } from "lucide-react";
import { useState, useEffect } from "react";

export function Navbar() {
  const { user, setUser } = useAuthStore();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
  };

  return (
    <nav className="border-b bg-background sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-bold tracking-tight text-primary">
              BookMyTurf
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            {isClient && user ? (
              <div className="flex items-center space-x-4">
                <Link href="/dashboard">
                  <Button variant="ghost" className="font-medium">
                    Dashboard
                  </Button>
                </Link>
                {user.role === "USER" && (
                  <Link href="/become-partner">
                    <Button variant="ghost" className="font-medium">Become a Partner</Button>
                  </Link>
                )}
                <div className="flex items-center space-x-2 text-sm font-medium px-3 py-2 bg-muted rounded-full">
                  <UserIcon className="w-4 h-4" />
                  <span>{user.name}</span>
                </div>
                <Button variant="outline" size="icon" onClick={handleLogout} title="Logout">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : isClient ? (
              <div className="flex items-center space-x-3">
                <Link href="/login">
                  <Button variant="ghost">Log In</Button>
                </Link>
                <Link href="/register">
                  <Button>Sign Up</Button>
                </Link>
              </div>
            ) : null}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
              <Menu className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden border-t bg-background">
          <div className="px-4 pt-2 pb-4 space-y-1 sm:px-3 flex flex-col">
            {isClient && user ? (
              <>
                <Link href="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-muted" onClick={() => setIsOpen(false)}>
                  Dashboard
                </Link>
                {user.role === "USER" && (
                  <Link href="/become-partner" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-muted" onClick={() => setIsOpen(false)}>
                    Become a Partner
                  </Link>
                )}
                <button 
                  onClick={() => { handleLogout(); setIsOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-destructive hover:bg-muted"
                >
                  Log Out
                </button>
              </>
            ) : isClient ? (
              <>
                <Link href="/login" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-muted" onClick={() => setIsOpen(false)}>
                  Log In
                </Link>
                <Link href="/register" className="block px-3 py-2 rounded-md text-base font-medium bg-primary text-primary-foreground hover:bg-primary/90 mt-2" onClick={() => setIsOpen(false)}>
                  Sign Up
                </Link>
              </>
            ) : null}
          </div>
        </div>
      )}
    </nav>
  );
}
