import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import Home from "./pages/Home";
import RecommendBySong from "./pages/RecommendBySong";
import RecommendByMood from "./pages/RecommendByMood";
import AudioAlchemist from "./pages/AudioAlchemist";
import PlaylistSearch from "./pages/PlaylistSearch";
import PlaylistDetail from "./pages/PlaylistDetail";
import Recommendations from "./pages/Recommendations";
import SmartPlaylistGenerator from "./pages/SmartPlaylistGenerator";
import MusicVisualizer from "./pages/MusicVisualizer";
import Login from "./components/Login";
import UserProfile from "./components/UserProfile";
import SavedPlaylistView from "./pages/SavedPlaylistView";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/recommend-by-song" element={<RecommendBySong />} />
              <Route path="/recommend-by-mood" element={<RecommendByMood />} />
              <Route path="/audio-alchemist" element={<AudioAlchemist />} />
              <Route path="/playlists" element={<PlaylistSearch />} />
              <Route path="/playlist/:playlistId" element={<PlaylistDetail />} />
              <Route path="/recommendations" element={<Recommendations />} />
              <Route path="/smart-playlist" element={<SmartPlaylistGenerator />} />
              <Route path="/visualizer" element={<MusicVisualizer />} />
              <Route path="/login" element={<Login />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/saved-playlist/:playlistId" element={<SavedPlaylistView />} />

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
