import React, { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import { DEFAULT_EMBED_PLAYLIST_ID } from './data/fallbackCatalog';
import './App.css';

/**
 * Root Spotify Web Player fixed 100vh shell:
 * Fixed top Navbar, fixed left Library Sidebar, scrollable center content pane, fixed bottom Footer.
 */
export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(
    DEFAULT_EMBED_PLAYLIST_ID
  );
  const [visualMeta, setVisualMeta] = useState({
    isPlaying: false,
    bpm: 128,
    foregroundColor: '#1DB954',
    isBeatPulse: false,
    activePlaylistId: DEFAULT_EMBED_PLAYLIST_ID,
  });

  const handleSyncVisualMeta = useCallback((meta) => {
    setVisualMeta((prev) => {
      if (
        prev.isPlaying === meta.isPlaying &&
        prev.bpm === meta.bpm &&
        prev.foregroundColor === meta.foregroundColor &&
        prev.isBeatPulse === meta.isBeatPulse &&
        prev.activePlaylistId === meta.activePlaylistId
      ) {
        return prev;
      }
      return meta;
    });
  }, []);

  return (
    <BrowserRouter>
      <div className="spotify-app-shell">
        <Navbar
          foregroundColor={visualMeta.foregroundColor}
          isBeatPulse={visualMeta.isBeatPulse}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          bpm={visualMeta.bpm}
          isPlaying={visualMeta.isPlaying}
        />

        <div className="spotify-body-grid">
          <Sidebar
            activePlaylistId={visualMeta.activePlaylistId}
            onSelectPlaylist={setSelectedPlaylistId}
            isPlaying={visualMeta.isPlaying}
          />
          <div className="spotify-scroll-pane">
            <Routes>
              <Route
                path="/"
                element={
                  <Dashboard
                    searchQuery={searchQuery}
                    externalPlaylistId={selectedPlaylistId}
                    onPlaylistChange={setSelectedPlaylistId}
                    onSyncVisualMeta={handleSyncVisualMeta}
                  />
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </div>

        <Footer
          activePlaylistId={visualMeta.activePlaylistId}
          foregroundColor={visualMeta.foregroundColor}
          isBeatPulse={visualMeta.isBeatPulse}
        />
      </div>
    </BrowserRouter>
  );
}
