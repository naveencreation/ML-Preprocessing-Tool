import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import Home from "./pages/Home";
import { ThemeProvider } from "./components/ThemeProvider";
import { Toaster } from "./components/ui/toaster";
import { AppShell } from "./components/layout/AppShell";
import ErrorBoundary from "./components/ErrorBoundary";
import { PageSkeleton } from "./components/LoadingSkeleton";

// Lazy load pages for code splitting - reduces initial bundle size
const Overview = lazy(() => import("./pages/Overview"));
const Upload = lazy(() => import("./pages/Upload"));
const Preprocessing = lazy(() => import("./pages/Preprocessing"));
const Training = lazy(() => import("./pages/Training"));
const Inference = lazy(() => import("./pages/Inference"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Datasets = lazy(() => import("@/pages/Datasets"));
const Settings = lazy(() => import("@/pages/Settings"));
const Workflows = lazy(() => import("@/pages/Workflows"));
const Logs = lazy(() => import("@/pages/Logs"));
const ComparisonView = lazy(() => import("./pages/ComparisonView"));

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="ml-preprocessing-theme">
      <Router>
        <AppShell>
          <ErrorBoundary>
            <Suspense fallback={<PageSkeleton />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/overview" element={<Overview />} />
                <Route path="/upload" element={<Upload />} />
                <Route path="/preprocessing/:id" element={<Preprocessing />} />
                <Route path="/training/:id" element={<Training />} />
                <Route path="/inference/:id" element={<Inference />} />
                <Route path="/dashboard/:id" element={<Dashboard />} />
                <Route path="/comparison/:id" element={<ComparisonView />} />
                <Route path="/datasets" element={<Datasets />} />
                <Route path="/workflows" element={<Workflows />} />
                <Route path="/logs" element={<Logs />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </AppShell>
      </Router>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;

