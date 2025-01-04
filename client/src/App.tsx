import { Switch, Route } from "wouter";
import HomePage from "./pages/HomePage";
import EventPage from "./pages/EventPage";
import ProfilePage from "./pages/ProfilePage";
import CreateEventPage from "./pages/CreateEventPage";
import ChatbotPage from "./pages/ChatbotPage";
import MatchesPage from "./pages/MatchesPage";
import BrowseUsersPage from "./pages/BrowseUsersPage";
import TutorialPage from "./pages/TutorialPage"; // Added import for TutorialPage
import { BottomNav } from "./components/ui/bottom-nav";
import { useEffect, useState } from "react";

function App() {
  const [theme, setTheme] = useState<"light" | "dark">(
    () => (localStorage.getItem("theme") as "light" | "dark") || 
    (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <div className={`min-h-screen bg-background text-foreground ${theme}`}>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/event/:id" component={EventPage} />
        <Route path="/profile/:username" component={ProfilePage} />
        <Route path="/create" component={CreateEventPage} />
        <Route path="/companion" component={ChatbotPage} />
        <Route path="/connect" component={MatchesPage} />
        <Route path="/browse" component={BrowseUsersPage} />
        <Route path="/tutorial" component={TutorialPage} /> {/* Added route for TutorialPage */}
        <Route path="/:rest*">
          {() => <div className="text-center p-8">404 - Page Not Found</div>}
        </Route>
      </Switch>
      <BottomNav />
    </div>
  );
}

export default App;