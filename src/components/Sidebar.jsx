import React, { useState, useEffect } from 'react';

const DEFAULT_PLAYLISTS = [
  { id: '5WLp2EAJJCzbE4BsIiUw22', title: 'Rock Opera', subtitle: 'Your Playlist • Rock / Metal' },
  { id: '37i9dQZF1DWXRqgorJj26U', title: 'Rock Classics', subtitle: 'Playlist • Classic Rock' },
  { id: '37i9dQZF1DWTcqUzwhNmKv', title: 'Kickass Metal', subtitle: 'Playlist • Heavy Metal' },
  { id: '37i9dQZF1DWWJOmJ7nRx0C', title: 'Rock Hard', subtitle: 'Playlist • Hard Rock' },
];

const STORAGE_KEY = 'spotifyClone.customPlaylists';

/**
 * Extracts a Spotify playlist ID from a full Spotify URL, URI, or raw ID.
 */
function extractPlaylistId(input) {
  const trimmed = (input || '').trim();
  if (!trimmed) return null;
  const urlMatch = trimmed.match(/playlist\/([a-zA-Z0-9]+)/);
  if (urlMatch) return urlMatch[1];
  const uriMatch = trimmed.match(/spotify:playlist:([a-zA-Z0-9]+)/);
  if (uriMatch) return uriMatch[1];
  if (/^[a-zA-Z0-9]{10,}$/.test(trimmed)) return trimmed;
  return null;
}

/**
 * Fixed left Spotify "Your Library" sidebar with Rock/Metal playlists,
 * custom Spotify playlist URL importer, and dual beat-reactive subwoofer speakers.
 */
export default function Sidebar({
  activePlaylistId,
  onSelectPlaylist,
  isPlaying = false,
}) {
  const [customPlaylists, setCustomPlaylists] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [playlistTitle, setPlaylistTitle] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customPlaylists));
    } catch {
      // Ignore storage quota errors
    }
  }, [customPlaylists]);

  const allPlaylists = [...customPlaylists, ...DEFAULT_PLAYLISTS];

  const handleAddPlaylist = (e) => {
    e.preventDefault();
    const id = extractPlaylistId(playlistUrl);
    if (!id) {
      setFormError('Paste a valid Spotify playlist link or ID.');
      return;
    }
    const label = playlistTitle.trim() || 'Custom Playlist';
    const nextItem = { id, title: label, subtitle: 'Your Playlist • Custom' };
    setCustomPlaylists((prev) => [nextItem, ...prev.filter((p) => p.id !== id)]);
    setPlaylistUrl('');
    setPlaylistTitle('');
    setFormError('');
    setShowAddForm(false);
    if (onSelectPlaylist) {
      onSelectPlaylist(id);
    }
  };

  return (
    <aside
      className={`spotify-sidebar ${isPlaying ? 'is-bumping' : ''}`}
      aria-label="Your Library"
    >
      <div className="sidebar-header">
        <span className="sidebar-title">Your Library</span>
        <button
          type="button"
          className="sidebar-plus-btn"
          title="Add Spotify Playlist Link"
          aria-label="Add Spotify Playlist Link"
          onClick={() => {
            setShowAddForm((prev) => !prev);
            setFormError('');
          }}
        >
          {showAddForm ? '×' : '+'}
        </button>
      </div>

      {showAddForm && (
        <form className="sidebar-add-form" onSubmit={handleAddPlaylist}>
          <input
            type="text"
            value={playlistTitle}
            onChange={(e) => setPlaylistTitle(e.target.value)}
            placeholder="Playlist name (optional)"
            aria-label="Playlist name"
          />
          <input
            type="text"
            value={playlistUrl}
            onChange={(e) => setPlaylistUrl(e.target.value)}
            placeholder="Paste Spotify playlist link..."
            aria-label="Spotify playlist link"
          />
          {formError && <span className="sidebar-form-error">{formError}</span>}
          <button type="submit" className="sidebar-add-submit">
            Add & Play
          </button>
        </form>
      )}

      <div className="sidebar-list">
        {allPlaylists.map((pl) => {
          const isActive = activePlaylistId === pl.id;
          return (
            <button
              key={pl.id}
              type="button"
              className={`sidebar-item ${isActive ? 'is-active' : ''}`}
              onClick={() => onSelectPlaylist && onSelectPlaylist(pl.id)}
            >
              <span className="sidebar-art" aria-hidden="true">
                ♪
              </span>
              <span className="sidebar-meta">
                <span className="sidebar-item-title">{pl.title}</span>
                <span className="sidebar-item-sub">{pl.subtitle}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Pair of beat-reactive studio subwoofer speakers */}
      <div className="sidebar-speakers" aria-label="Beat Reactive Speakers">
        <div className="speaker-enclosure speaker-left">
          <div className="speaker-tweeter" />
          <div className="speaker-woofer">
            <div className="speaker-cone">
              <div className="speaker-cap" />
            </div>
          </div>
        </div>

        <div className="speaker-enclosure speaker-right">
          <div className="speaker-tweeter" />
          <div className="speaker-woofer">
            <div className="speaker-cone">
              <div className="speaker-cap" />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
