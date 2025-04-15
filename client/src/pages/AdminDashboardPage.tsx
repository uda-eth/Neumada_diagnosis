import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { useUser } from "@/lib/useUser";
import { PaymentStats } from "@/components/admin/PaymentStats";

export default function AdminDashboardPage() {
  const [, setLocation] = useLocation();
  const { user } = useUser();
  
  useEffect(() => {
    // Redirect if not an admin
    if (user && !user.isAdmin) {
      setLocation("/");
    }
  }, [user, setLocation]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8 max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user.fullName || user.username}
            </p>
          </div>
          
          <div className="space-y-8">
            {/* Quick stats overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="bg-card rounded-lg border shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-1">Payment Analytics</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Monitor revenue and payment activity
                </p>
                <button 
                  onClick={() => setLocation('/admin/payments')}
                  className="text-primary hover:underline text-sm"
                >
                  View payment details →
                </button>
              </div>
              
              <div className="bg-card rounded-lg border shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-1">User Management</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Manage users and permissions
                </p>
                <button 
                  onClick={() => setLocation('/admin/users')}
                  className="text-primary hover:underline text-sm"
                >
                  Manage users →
                </button>
              </div>
              
              <div className="bg-card rounded-lg border shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-1">Event Management</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Create and manage platform events
                </p>
                <button 
                  onClick={() => setLocation('/admin/events')}
                  className="text-primary hover:underline text-sm"
                >
                  View all events →
                </button>
              </div>
              
              <div className="bg-card rounded-lg border shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-1">System Settings</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Configure application settings
                </p>
                <button 
                  onClick={() => setLocation('/admin/settings')}
                  className="text-primary hover:underline text-sm"
                >
                  Manage settings →
                </button>
              </div>
            </div>
            
            {/* Payment statistics */}
            <div className="bg-card rounded-lg border shadow-sm p-6">
              <PaymentStats />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 