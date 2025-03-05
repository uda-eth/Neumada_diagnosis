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
import SettingsPage from "./pages/SettingsPage";
import { Layout } from "./components/ui/layout";
import { ThemeProvider } from "./lib/theme-provider";

function App() {
  return (
    <ThemeProvider>
      <Layout>
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/event/:id" component={EventPage} />
          <Route path="/profile/:username" component={ProfilePage} />
          <Route path="/profile/edit" component={EditProfilePage} />
          <Route path="/profile/setup" component={ProfileSetupPage} />
          <Route path="/create" component={CreateEventPage} />
          <Route path="/companion" component={ChatbotPage} />
          <Route path="/connect" component={ConnectPage} />
          <Route path="/browse" component={ConnectPage} />
          <Route path="/tutorial" component={TutorialPage} />
          <Route path="/messages" component={MessagesPage} />
          <Route path="/settings" component={SettingsPage} />
          <Route path="/:rest*">
            {() => <div className="text-center p-8">404 - Page Not Found</div>}
          </Route>
        </Switch>
      </Layout>
    </ThemeProvider>
  );
}

export default App;