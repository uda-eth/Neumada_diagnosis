import { Suspense, lazy } from "react";
import { Route, Switch } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/lib/theme-provider";
import { QueryProvider } from "@/lib/query-provider";
import { UserProvider } from "@/lib/user-provider";
import { TranslationProvider } from "@/lib/language-context";
import AuthPage from "@/pages/AuthPage";
import HomePage from "@/pages/HomePage";
import EventPage from "@/pages/EventPage";
import OndaLindaFestivalPage from "@/pages/OndaLindaFestivalPage";
import EventRegistrationPage from "@/pages/EventRegistrationPage";
import EventUsersPage from "@/pages/EventUsersPage";
import CreateEventPage from "@/pages/CreateEventPage";
import ProfilePage from "@/pages/ProfilePage";
import SettingsPage from "@/pages/SettingsPage";
import ChatPage from "@/pages/ChatPage";
import ChatDetailPage from "@/pages/ChatDetailPage";
import ExploreUsersPage from "@/pages/ExploreUsersPage";
import NotFoundPage from "@/pages/NotFoundPage";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="nomad-theme">
      <QueryProvider>
        <UserProvider>
          <TranslationProvider>
            <Suspense fallback={<div>Loading...</div>}>
              <Switch>
                <Route path="/" component={HomePage} />
                <Route path="/login" component={AuthPage} />
                <Route path="/event/1001" component={OndaLindaFestivalPage} />
                <Route path="/event/:id" component={EventPage} />
                <Route path="/event/:id/register" component={EventRegistrationPage} />
                <Route path="/event/:id/users" component={EventUsersPage} />
                <Route path="/create-event" component={CreateEventPage} />
                <Route path="/profile/:username" component={ProfilePage} />
                <Route path="/profile/:username/edit" component={SettingsPage} />
                <Route path="/chat" component={ChatPage} />
                <Route path="/chat/:id" component={ChatDetailPage} />
                <Route path="/explore" component={ExploreUsersPage} />
                <Route component={NotFoundPage} />
              </Switch>
            </Suspense>
            <Toaster />
          </TranslationProvider>
        </UserProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}

export default App;