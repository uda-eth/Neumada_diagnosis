import { Switch, Route } from "wouter";
import HomePage from "./pages/HomePage";
import EventPage from "./pages/EventPage";
import ProfilePage from "./pages/ProfilePage";
import ChatbotPage from "./pages/ChatbotPage";

function App() {
  // Temporarily bypass authentication for demo
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/event/:id" component={EventPage} />
      <Route path="/profile/:username" component={ProfilePage} />
      <Route path="/chat" component={ChatbotPage} />
      <Route path="/:rest*">
        {() => <div className="text-center p-8">404 - Page Not Found</div>}
      </Route>
    </Switch>
  );
}

export default App;