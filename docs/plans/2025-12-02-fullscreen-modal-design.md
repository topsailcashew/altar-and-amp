# Full-Screen Modal Design for Lyrics Display

**Date:** 2025-12-02
**Status:** Approved for Implementation

## Overview

Transform the lyrics display from inline results to a full-screen modal interface, removing the lyrical analysis section and providing an immersive, distraction-free reading experience.

## Requirements

1. Remove "Lyrical Analysis & Polish ✨" section from UI (keep in JSON schema)
2. Display all generated content in a full-screen modal
3. Modal auto-opens when generation completes
4. Main page shows empty state with "View Song" button when modal is closed
5. Export button moves inside the modal

## Design Approach: Full-Screen Modal with Close Button

### Architecture

**New Components:**
- `LyricsModal` - Full-screen modal component containing all song content

**State Management:**
- Add `isModalOpen` boolean state
- Modal auto-opens when `currentSongData` is set (after successful generation)
- User can close and re-open via button

**Component Hierarchy:**
```
App
├── Input sections (Blueprint, Filters, Revision)
├── Generate Button
└── Results Area
    ├── Empty state with "View Song" button (when song exists but modal closed)
    └── LyricsModal (when isModalOpen = true)
        ├── Backdrop (semi-transparent black)
        └── Content Container (scrollable)
            ├── Close button (X in top-right)
            ├── Title Card
            ├── Musical Core
            ├── Lyrics Sections
            ├── Scriptural Foundation
            └── Export Button
```

## Visual Design

### Modal Styling
- **Backdrop**: Fixed position, full viewport, `bg-black/80` (80% opacity black)
- **Container**: Full screen (`w-screen h-screen`), `bg-gray-900` to match app theme
- **Content**: Scrollable with padding for comfortable reading
- **Close Button**:
  - Fixed top-right corner
  - X icon from Lucide
  - Amber color matching app theme
  - High z-index to stay above scrolling content

### Modal Behavior
- **Auto-open**: Modal opens automatically when generation completes successfully
- **Close triggers**:
  - Click X button
  - Click backdrop
  - ESC key press
- **Scroll lock**: Body scroll disabled when modal is open
- **Animation**: Fade-in (0.2s duration)

### Empty State (Modal Closed)
When a song exists but modal is closed, show:
```
┌─────────────────────────────────┐
│   [Music Note Icon]             │
│   Song Title Goes Here          │
│   Theme: [Theme text]           │
│                                 │
│   [View Song Button]            │
└─────────────────────────────────┘
```
- Centered card with song title and theme
- "View Song" button styled with amber theme
- Replaces all current result panels

## Modal Content Layout

Content displayed in modal (top to bottom):

1. **Title Card**
   - Song title, theme, scripture reference
   - Gradient amber-to-orange background
   - Unchanged from current design

2. **Musical Core**
   - Key, BPM, Progression
   - Card format with amber accents
   - Unchanged from current design

3. **Lyrics Sections**
   - Verse 1, Verse 2, Chorus, Bridge, etc.
   - Each in its own card
   - Unchanged from current design

4. **Scriptural Foundation**
   - Citation sources (if available)
   - Unchanged from current design

5. **Export Button**
   - Positioned at bottom of modal content
   - Same styling as current export button

## Features Removed

### Lyrical Analysis Section
- **Removed from UI**: "Lyrical Analysis & Polish ✨" card (rhyme scheme, complexity, meter/flow critique)
- **Keep in JSON Schema**: `lyrical_analysis` remains in API schema to avoid breaking API calls
- **Implementation**: Simply don't render this section in the modal

## Implementation Details

### Code Changes Required

1. **Add State** (in `App` component):
   ```javascript
   const [isModalOpen, setIsModalOpen] = useState(false);
   ```

2. **Auto-open Modal** (in `handleGenerate` success path):
   ```javascript
   setCurrentSongData(songData);
   setIsModalOpen(true); // Add this line
   ```

3. **Create `LyricsModal` Component**:
   - Props: `isOpen`, `onClose`, `songData`, `sources`, `handleExport`
   - Full-screen overlay with backdrop
   - Scrollable content container
   - Close button (X) in top-right
   - Export button at bottom
   - All existing content cards (except Lyrical Analysis)

4. **Update `ResultsPanel` Component**:
   - When `currentSongData` exists but modal closed: render empty state
   - Empty state includes song title, theme, and "View Song" button
   - Button onClick: `setIsModalOpen(true)`

5. **Body Scroll Lock**:
   - Use `useEffect` to toggle `overflow: hidden` on document body when modal opens
   - Restore scroll on unmount/close

6. **Keyboard Support**:
   - ESC key closes modal
   - Use `useEffect` with event listener

### Accessibility Features

- **ARIA labels**: Close button has `aria-label="Close modal"`
- **Focus management**: Focus moves to modal when opened
- **Keyboard navigation**: ESC key support
- **Focus trap**: Keep focus within modal when open

## Trade-offs

### Advantages
- ✅ Immersive, distraction-free reading experience
- ✅ Simple implementation (standard modal pattern)
- ✅ Works well on mobile (full screen)
- ✅ Clean separation between input controls and output
- ✅ Removes unnecessary lyrical analysis clutter

### Disadvantages
- ❌ Requires closing modal to access input controls for new generation
- ❌ Less "reference while working" friendly
- ❌ Slightly more clicks to view song after closing modal

## Success Criteria

1. Modal opens automatically after successful generation
2. All song content visible in modal (except Lyrical Analysis)
3. User can close modal and re-open via button
4. Export functionality works from within modal
5. Modal is accessible (keyboard support, ARIA labels)
6. Body scroll is locked when modal is open
7. Empty state displays correctly when modal is closed

## Files Modified

- `src/App.jsx` - All changes in this single file:
  - Add `isModalOpen` state
  - Create `LyricsModal` component
  - Update `ResultsPanel` component
  - Modify `handleGenerate` to auto-open modal
  - Add body scroll lock effect
  - Remove Lyrical Analysis rendering
