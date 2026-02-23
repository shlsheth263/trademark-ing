import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import SimilarityCheck from "./pages/SimilarityCheck";
import ExploreSimilar from "./pages/ExploreSimilar";
import TrackApplication from "./pages/TrackApplication";
import AgentLogin from "./pages/agent/Login";
import AgentDashboard from "./pages/agent/Dashboard";
import ReviewApplication from "./pages/agent/ReviewApplication";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/check-similarity" element={<SimilarityCheck />} />
            <Route path="/explore" element={<ExploreSimilar />} />
            <Route path="/track" element={<TrackApplication />} />
            <Route path="/agent/login" element={<AgentLogin />} />
            <Route path="/agent/dashboard" element={<ProtectedRoute><AgentDashboard /></ProtectedRoute>} />
            <Route path="/agent/review/:id" element={<ProtectedRoute><ReviewApplication /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
