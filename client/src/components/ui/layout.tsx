import { BottomNav } from "./bottom-nav";
import { ThemeToggle } from "./theme-toggle";
import { Logo } from "./logo";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header with branding */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center">
          <div className="mr-4 hidden md:flex">
            <a className="mr-6 flex items-center space-x-2" href="/">
              <Logo className="h-8 w-auto" />
            </a>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <nav className="flex items-center">
                <Logo className="h-6 w-auto md:hidden" />
              </nav>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main content with bottom padding for mobile nav */}
      <main className="flex-1 pb-28 md:pb-0">
        {children}
      </main>

      {/* Bottom navigation - only visible on mobile */}
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  );
}