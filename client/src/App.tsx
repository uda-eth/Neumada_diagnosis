import { Switch, Route } from "wouter";
import { useUser } from "./hooks/use-user";
import { Loader2 } from "lucide-react";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import EventsPage from "./pages/EventsPage";
import ProfilePage from "./pages/ProfilePage";
import Navigation from "./components/Navigation";

function App() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={user} />
      <main className="container mx-auto px-4 py-6">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/events" component={EventsPage} />
          <Route path="/profile" component={ProfilePage} />
          <Route path="/profile/:id">
            {params => <ProfilePage userId={parseInt(params.id)} />}
          </Route>
        </Switch>
      </main>
    </div>
  );
}

export default App;
