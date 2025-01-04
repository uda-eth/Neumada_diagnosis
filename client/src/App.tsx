import { Switch, Route } from "wouter";
import HomePage from "./pages/HomePage";
import EventPage from "./pages/EventPage";
import ProfilePage from "./pages/ProfilePage";
import CreateEventPage from "./pages/CreateEventPage";
import ChatbotPage from "./pages/ChatbotPage";
import MatchesPage from "./pages/MatchesPage";
import BrowseUsersPage from "./pages/BrowseUsersPage";
import TutorialPage from "./pages/TutorialPage";
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
          <Route path="/create" component={CreateEventPage} />
          <Route path="/companion" component={ChatbotPage} />
          <Route path="/connect" component={MatchesPage} />
          <Route path="/browse" component={BrowseUsersPage} />
          <Route path="/tutorial" component={TutorialPage} />
          <Route path="/:rest*">
            {() => <div className="text-center p-8">404 - Page Not Found</div>}
          </Route>
        </Switch>
      </Layout>
    </ThemeProvider>
  );
}

export default App;