import { useTheme } from "@/lib/theme-provider";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Bell, Moon, Sun, Volume2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <PageHeader
            title="Settings"
            backButtonFallbackPath="/discover"
            className="mb-8"
          />

          <div className="space-y-6">
            {/* Appearance */}
            <div className="glass p-6 rounded-lg border border-white/10">
              <h2 className="text-xl font-semibold mb-4">Appearance</h2>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ThemeToggle />
                  <Label>Theme Mode</Label>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="glass p-6 rounded-lg border border-white/10">
              <h2 className="text-xl font-semibold mb-4">Notifications</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bell className="h-4 w-4" />
                    <Label>Push Notifications</Label>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Volume2 className="h-4 w-4" />
                    <Label>Sound Effects</Label>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>

            {/* Privacy */}
            <div className="glass p-6 rounded-lg border border-white/10">
              <h2 className="text-xl font-semibold mb-4">Privacy</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Show Online Status</Label>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Show Last Active</Label>
                  <Switch />
                </div>
              </div>
            </div>

            {/* Account Actions */}
            <div className="glass p-6 rounded-lg border border-white/10">
              <h2 className="text-xl font-semibold mb-4">Account</h2>
              <div className="space-y-4">
                <Button variant="outline" className="w-full glass-hover">
                  Change Password
                </Button>
                <Button variant="destructive" className="w-full">
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
