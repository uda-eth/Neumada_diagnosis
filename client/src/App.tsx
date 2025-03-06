import { Switch, Route } from "wouter";
import HomePage from "./pages/HomePage";
import EventPage from "./pages/EventPage";
import ProfilePage from "./pages/ProfilePage";
import EditProfilePage from "./pages/EditProfilePage";
import CreateEventPage from "./pages/CreateEventPage";
import ChatbotPage from "./pages/ChatbotPage";
import MatchesPage from "./pages/MatchesPage";
import ConnectPage from "./pages/ConnectPage";
import TutorialPage from "./pages/TutorialPage";
import ProfileSetupPage from "./pages/ProfileSetupPage";
import MessagesPage from "./pages/MessagesPage";
import ChatPage from "./pages/ChatPage";
import SettingsPage from "./pages/SettingsPage";
import InboxPage from "./pages/InboxPage";
import PremiumPage from "./pages/PremiumPage";
import { Layout } from "./components/ui/layout";
import { ThemeProvider } from "./lib/theme-provider";
import { LanguageProvider } from "./lib/language-context";

function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <Layout>
          <Switch>
            <Route path="/" component={HomePage} />
            <Route path="/event/:id" component={EventPage} />
            <Route path="/profile/:username/edit" component={EditProfilePage} />
            <Route path="/profile/:username" component={ProfilePage} />
            <Route path="/profile/setup" component={ProfileSetupPage} />
            <Route path="/create" component={CreateEventPage} />
            <Route path="/companion" component={ChatbotPage} />
            <Route path="/connect" component={ConnectPage} />
            <Route path="/browse" component={ConnectPage} />
            <Route path="/tutorial" component={TutorialPage} />
            <Route path="/messages" component={MessagesPage} />
            <Route path="/chat/:username" component={ChatPage} />
            <Route path="/settings" component={SettingsPage} />
            <Route path="/inbox" component={InboxPage} />
            <Route path="/premium" component={PremiumPage} />
            <Route path="/:rest*">
              {() => <div className="text-center p-8">404 - Page Not Found</div>}
            </Route>
          </Switch>
        </Layout>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
import { Suspense, lazy } from "react";
import { Route, Switch } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/providers/query-provider";
import { UserProvider } from "@/providers/user-provider";
import { TranslationProvider } from "@/providers/translation-provider";
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
                <Route path="/event/1009" component={OndaLindaFestivalPage} />
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
