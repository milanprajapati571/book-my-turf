"use client";

import { useAuthStore } from "@/lib/store";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      router.push("/");
    }
  }, [user, router]);

  const { data: requestsData, isLoading } = useQuery({
    queryKey: ["partnerRequests"],
    queryFn: async () => {
      const res = await fetch("/api/admin/partner-requests");
      return res.json();
    },
    enabled: user?.role === "ADMIN"
  });

  const mutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      await fetch("/api/admin/partner-requests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partnerRequests"] });
    }
  });

  if (!user || user.role !== "ADMIN") return null;

  return (
    <div className="max-w-7xl mx-auto w-full p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
      
      <section>
        <h2 className="text-2xl font-semibold mb-4">Partner Requests</h2>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <div className="bg-white border rounded-lg p-4">
            {requestsData?.requests?.length === 0 ? (
              <p className="text-gray-500">No pending requests.</p>
            ) : (
              <table className="min-w-full text-left">
                <thead>
                  <tr className="border-b">
                    <th className="py-2">User</th>
                    <th className="py-2">Email</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {requestsData?.requests?.map((req: any) => (
                    <tr key={req.id} className="border-b">
                      <td className="py-3">{req.user.name}</td>
                      <td className="py-3">{req.user.email}</td>
                      <td className="py-3 font-semibold">{req.status}</td>
                      <td className="py-3 space-x-2">
                        {req.status === "PENDING" && (
                          <>
                            <Button 
                              size="sm" 
                              onClick={() => mutation.mutate({ id: req.id, status: "APPROVED" })}
                            >
                              Approve
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => mutation.mutate({ id: req.id, status: "REJECTED" })}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
