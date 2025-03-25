import { Switch, Route, useLocation } from "wouter";
import HomePage from "./pages/HomePage";
import EventPage from "./pages/EventPage";
import ProfilePage from "./pages/ProfilePage";
import CreateEventPage from "./pages/CreateEventPage";
import ChatbotPage from "./pages/ChatbotPage";
import ConnectPage from "./pages/ConnectPage";
import MessagesPage from "./pages/MessagesPage";
import ChatPage from "./pages/ChatPage";
import SettingsPage from "./pages/SettingsPage";
import PremiumPage from "./pages/PremiumPage";
import InboxPage from "./pages/InboxPage";
import ProfileEditPage from "./pages/ProfileEditPage";
import TranslatorPage from "./pages/TranslatorPage";
import OndaLindaFestivalPage from "./pages/OndaLindaFestivalPage";
import ProfileGeneratorPage from "./pages/ProfileGeneratorPage";
import ReplitProfilePage from "./pages/ReplitProfilePage";
import AuthPage from "./pages/AuthPage";
import { Layout } from "./components/ui/layout";
import { ThemeProvider } from "./lib/theme-provider";
import { LanguageProvider } from "./lib/language-context";
import { QueryProvider } from "./lib/query-provider";
import { UserProvider } from "./lib/user-provider";
import { useUser } from "@/hooks/use-user";
import { useEffect } from "react";

function AppContent() {
  const [location, setLocation] = useLocation();
  const { user, isLoading } = useUser();

  // Redirect to auth page if not logged in and not already on auth page
  useEffect(() => {
    if (!isLoading && !user && !location.startsWith('/auth')) {
      setLocation('/auth');
    }
  }, [user, isLoading, location, setLocation]);

  // Determine if we should show the layout based on the current route
  const showLayout = !location.startsWith('/auth');

  return (
    <>
      {showLayout ? (
        <Layout>
          <Switch>
            <Route path="/" component={HomePage} />
            <Route path="/event/onda-linda-festival" component={OndaLindaFestivalPage} />
            <Route path="/event/:id" component={EventPage} />
            <Route path="/profile/:username" component={ProfilePage} />
            <Route path="/create" component={CreateEventPage} />
            <Route path="/companion" component={ChatbotPage} />
            <Route path="/connect" component={ConnectPage} />
            <Route path="/messages" component={MessagesPage} />
            <Route path="/chat/:username" component={ChatPage} />
            <Route path="/settings" component={SettingsPage} />
            <Route path="/premium" component={PremiumPage} />
            <Route path="/inbox" component={InboxPage} />
            <Route path="/profile-edit" component={ProfileEditPage} />
            <Route path="/translator" component={TranslatorPage} />
            <Route path="/profile-setup" component={ProfileGeneratorPage} />
            <Route path="/replit-profile" component={ReplitProfilePage} />
            <Route path="/:rest*">
              {() => <div className="text-center p-8">404 - Page Not Found</div>}
            </Route>
          </Switch>
        </Layout>
      ) : (
        <Switch>
          <Route path="/auth" component={AuthPage} />
          <Route path="/:rest*">
            {() => <AuthPage />}
          </Route>
        </Switch>
      )}
    </>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="nomad-theme">
      <QueryProvider>
        <UserProvider>
          <LanguageProvider>
            <AppContent />
          </LanguageProvider>
        </UserProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}

export default App;