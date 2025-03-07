import { Switch, Route } from "wouter";
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
import { Layout } from "./components/ui/layout";
import { ThemeProvider } from "./lib/theme-provider";
import { LanguageProvider } from "./lib/language-context";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="nomad-theme">
      <LanguageProvider>
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
            <Route path="/:rest*">
              {() => <div className="text-center p-8">404 - Page Not Found</div>}
            </Route>
          </Switch>
        </Layout>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;