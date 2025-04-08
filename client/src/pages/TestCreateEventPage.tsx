import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft } from "lucide-react";

export default function TestCreateEventPage() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const createSimpleEvent = async () => {
    try {
      setLoading(true);
      
      // Create a simple event with just the required fields
      const formData = new FormData();
      formData.append('title', 'Test Event ' + new Date().toLocaleTimeString());
      formData.append('description', 'This is a test event created to verify authentication is working correctly.');
      formData.append('location', 'Mexico City');
      formData.append('category', 'Social');
      formData.append('date', new Date().toISOString());
      formData.append('isDraft', 'false');
      formData.append('tags', JSON.stringify(['Test']));
      
      // Get the session ID from localStorage
      const sessionId = localStorage.getItem('maly_session_id');
      console.log("Using session ID for test event creation:", sessionId ? "yes (first 5 chars: " + sessionId.substring(0, 5) + "...)" : "no");
      
      // Make the API call
      const response = await fetch('/api/events', {
        method: 'POST',
        body: formData,
        headers: {
          // Include the session ID in the header
          'X-Session-ID': sessionId || '',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.details || `Error: ${response.status}`);
      }
      
      const result = await response.json();
      console.log("Test event created successfully:", result);
      
      toast({
        title: "Success",
        description: "Test event created successfully!"
      });
      
      // Redirect to the homepage
      setLocation("/");
    } catch (error) {
      console.error("Error creating test event:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create test event"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-10 bg-black/80 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-white/60"
              onClick={() => setLocation("/")}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-sm font-medium uppercase tracking-wider">
              Test Event Creation
            </h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8 max-w-2xl">
        <div className="bg-white/5 p-6 rounded-lg space-y-4">
          <h2 className="text-xl font-medium">Authentication Test</h2>
          <p className="text-white/60">
            Click the button below to create a simple test event. This will attempt to use your 
            current authentication status to create an event with minimal information.
          </p>
          
          <div className="pt-4">
            <Button 
              onClick={createSimpleEvent}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Creating...' : 'Create Test Event'}
            </Button>
          </div>
          
          <div className="bg-black/50 p-4 rounded text-xs mt-6">
            <h3 className="font-medium mb-2">Session Information:</h3>
            <pre className="whitespace-pre-wrap overflow-auto max-h-40">
              Session ID present: {localStorage.getItem('maly_session_id') ? 'Yes' : 'No'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}