// [SDD-REQ-04] Static Configuration & Fallback Catalog

// TIME_RANGE_OPTIONS with three objects:
//   { optionId: 'range-short', rangeKey: 'short_term', displayLabel: 'Last 4 Weeks' },
//   { optionId: 'range-medium', rangeKey: 'medium_term', displayLabel: 'Last 6 Months' },
//   { optionId: 'range-long', rangeKey: 'long_term', displayLabel: 'All Time' }
export const TIME_RANGE_OPTIONS = [
    { optionId: 'range-short', rangeKey: 'short_term', displayLabel: 'Last 4 Weeks'},
    { optionId: 'range-medium', rangeKey: 'medium_term', displayLabel: 'Last 6 Months' },
    { optionId: 'range-long', rangeKey: 'long_term', displayLabel: 'All Time' }
];

// DEFAULT_EMBED_PLAYLIST_ID
export const DEFAULT_EMBED_PLAYLIST_ID = '2iFnYqiudxwGD3MGCxu2im';

// LIVE HMR CHECK: Save and verify zero Vite import errors in the terminal.

// NEXT STEP: Open src/components/Navbar.jsx
