import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from '../src/pages/Dashboard';
import * as spotifyApi from '../src/utils/spotifyApi';

jest.mock('../src/utils/spotifyApi');

describe('Spotify Clone Dashboard [SDD-REQ-04, SDD-REQ-05, SDD-REQ-06]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders fetched top tracks and updates embed playlist on save', async () => {
    spotifyApi.getTopTracks.mockResolvedValue([
      {
        id: 't1',
        uri: 'spotify:track:2JuasWPUodaUxf5nwNpciQ',
        name: 'Midnight City',
        artists: [{ name: 'M83' }],
      },
    ]);
    spotifyApi.createPlaylistWithTracks.mockResolvedValue({
      id: 'new-playlist-999',
      name: 'My top tracks playlist',
    });

    render(<Dashboard initialToken="test-token" initialBpm={120} />);

    expect(await screen.findByText('Midnight City by M83')).toBeInTheDocument();
    expect(screen.getByTestId('graphic-equalizer')).toBeInTheDocument();
    expect(screen.getAllByTestId(/^eq-bar-/)).toHaveLength(16);

    const saveBtn = screen.getByRole('button', { name: /Save to Playlist/i });
    expect(saveBtn).not.toBeDisabled();
    fireEvent.click(saveBtn);

    await waitFor(() => {
      const iframe = screen.getByTitle(/Spotify Embed: Recommendation Playlist/i);
      expect(iframe.getAttribute('src')).toContain('new-playlist-999');
    });
  });

  test('disables Save to Playlist button and shows empty state when 0 tracks', async () => {
    spotifyApi.getTopTracks.mockResolvedValue([]);
    render(<Dashboard initialToken="test-token" />);

    expect(await screen.findByTestId('empty-tracks-state')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save to Playlist/i })).toBeDisabled();
  });

  test('shows PKCE reconnect fallback on 401 AUTH_EXPIRED error', async () => {
    spotifyApi.getTopTracks.mockRejectedValue(new Error('AUTH_EXPIRED'));
    render(<Dashboard initialToken="expired-token" />);

    expect(await screen.findByTestId('auth-error-banner')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Reconnect Spotify \(PKCE\)/i })
    ).toBeInTheDocument();
  });

  test('shows Retry Request banner on 429 RATE_LIMITED error', async () => {
    spotifyApi.getTopTracks.mockRejectedValue(new Error('RATE_LIMITED'));
    render(<Dashboard initialToken="valid-token" />);

    expect(await screen.findByTestId('rate-limit-banner')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Retry Request/i })
    ).toBeInTheDocument();
  });

  test('auto-starts and pauses equalizer via Spotify Embed playback_update messages', async () => {
    spotifyApi.getTopTracks.mockResolvedValue([]);
    render(<Dashboard initialToken="valid-token" initialBpm={120} />);

    expect(await screen.findByTestId('graphic-equalizer')).toBeInTheDocument();
    expect(screen.getByTestId('eq-bar-0')).toHaveAttribute('data-playing', 'false');

    fireEvent(
      window,
      new MessageEvent('message', {
        origin: 'https://open.spotify.com',
        data: { type: 'playback_update', payload: { isPaused: false } },
      })
    );

    await waitFor(() => {
      expect(screen.getByTestId('eq-bar-0')).toHaveAttribute('data-playing', 'true');
    });

    const barColors = screen
      .getAllByTestId(/^eq-bar-/)
      .map((bar) => bar.getAttribute('data-bar-color'));
    expect(new Set(barColors).size).toBeGreaterThan(1);

    fireEvent(
      window,
      new MessageEvent('message', {
        origin: 'https://open.spotify.com',
        data: { type: 'playback_update', payload: { isPaused: true } },
      })
    );

    await waitFor(() => {
      expect(screen.getByTestId('eq-bar-0')).toHaveAttribute('data-playing', 'false');
    });
  });
});
