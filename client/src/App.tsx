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