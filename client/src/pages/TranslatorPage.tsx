import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, Globe2 } from "lucide-react";
import { useTranslation } from "@/lib/translations";

export default function TranslatorPage() {
  const [, setLocation] = useLocation();
  const { setLanguage } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-black/40 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground hover:bg-accent"
              onClick={() => setLocation("/")}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Globe2 className="w-6 h-6" />
              <h1 className="text-lg font-semibold">Language Settings</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto space-y-4">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Select Your Language</h2>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start text-left"
                onClick={() => setLanguage("en")}
              >
                <Globe2 className="w-4 h-4 mr-2" />
                English
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-left"
                onClick={() => setLanguage("es")}
              >
                <Globe2 className="w-4 h-4 mr-2" />
                Español
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
