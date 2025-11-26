import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Overview from "./pages/Overview";
import Upload from "./pages/Upload";
import Preprocessing from "./pages/Preprocessing";
import Dashboard from "./pages/Dashboard";
import Datasets from "@/pages/Datasets"
import Settings from "@/pages/Settings"
import Workflows from "@/pages/Workflows"
import Logs from "@/pages/Logs"
  ;
import ComparisonView from "./pages/ComparisonView";
import { ThemeProvider } from "./components/ThemeProvider";
import { Toaster } from "./components/ui/toaster";
import { AppShell } from "./components/layout/AppShell";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="ml-preprocessing-theme">
      <Router>
        <AppShell>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/overview" element={<Overview />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/preprocessing/:id" element={<Preprocessing />} />
              <Route path="/dashboard/:id" element={<Dashboard />} />
              <Route path="/comparison/:id" element={<ComparisonView />} />
              <Route path="/datasets" element={<Datasets />} />
              <Route path="/workflows" element={<Workflows />} />
              <Route path="/logs" element={<Logs />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </ErrorBoundary>
        </AppShell>
      </Router>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
