# Full-Screen Modal Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform inline lyrics display into a full-screen modal with immersive reading experience, removing lyrical analysis section.

**Architecture:** Add modal state to App component, create new LyricsModal component for full-screen display, update ResultsPanel to show empty state with button when modal closed, move all content rendering into modal.

**Tech Stack:** React (hooks: useState, useCallback, useEffect), Tailwind CSS, Lucide React icons

---

### Task 1: Add Modal State to App Component

**Files:**
- Modify: `src/App.jsx:361-370`

**Step 1: Add isModalOpen state**

In the `App` component, after the existing `useSongForge` hook call (around line 369), add:

```javascript
const [isModalOpen, setIsModalOpen] = useState(false);
```

**Step 2: Verify import**

Ensure `useState` is already imported at the top of the file (line 1):
```javascript
import React, { useState, useCallback } from 'react';
```

**Step 3: Test the change**

Run: `npm run dev`
Expected: App compiles without errors, no visual changes yet

**Step 4: Commit**

```bash
git add src/App.jsx
git commit -m "feat: add modal state for lyrics display"
```

---

### Task 2: Create LyricsModal Component

**Files:**
- Modify: `src/App.jsx:224-358` (add new component before ResultsPanel)

**Step 1: Add X icon import**

At the top of the file (line 3), update the import to include `X`:

```javascript
import { Loader2, Feather, Music, BookOpen, Download, Layout, Edit3, X } from 'lucide-react';
```

**Step 2: Create LyricsModal component**

Add this new component after `InputCard` component (around line 243):

```javascript
const LyricsModal = ({ isOpen, onClose, currentSongData, sources, handleExport }) => {
    // Close on ESC key
    React.useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
            // Lock body scroll
            document.body.style.overflow = 'hidden';
        }
        return () => {
            window.removeEventListener('keydown', handleEsc);
            // Restore body scroll
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen || !currentSongData) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="relative w-screen h-screen bg-gray-900 overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    aria-label="Close modal"
                    className="fixed top-6 right-6 z-10 p-3 bg-gray-800 hover:bg-gray-700 text-amber-400 rounded-full transition-colors duration-200 shadow-lg"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Content Container */}
                <div className="max-w-4xl mx-auto p-6 md:p-12 space-y-6">
                    {/* Export Button */}
                    <div className="text-center">
                        <button
                            onClick={handleExport}
                            className="px-6 py-3 bg-transparent text-amber-400 font-semibold rounded-2xl
                                border-2 border-amber-500 shadow-lg shadow-amber-900/50 flex items-center justify-center mx-auto
                                hover:bg-amber-900/50 hover:text-amber-300 transition duration-200 ease-in-out"
                        >
                            <Download className="w-5 h-5 mr-2" /> Export to Markdown (.md)
                        </button>
                    </div>

                    {/* 1. Title Card */}
                    <div className="bg-gradient-to-r from-amber-700 to-orange-800 text-white p-6 rounded-3xl shadow-xl shadow-amber-900/50">
                        <h2 className="text-4xl font-black mb-1">{currentSongData.title || 'Untitled Worship Song'}</h2>
                        <p className="text-xl text-amber-200">{currentSongData.theme || 'No theme specified'}</p>
                        {currentSongData.scripture_reference && (
                            <p className="text-amber-300 text-sm italic mt-2 border-t border-amber-600/50 pt-2">Foundation: {currentSongData.scripture_reference}</p>
                        )}
                    </div>

                    {/* 2. Music Guidance Card */}
                    {(currentSongData.suggested_key || currentSongData.suggested_bpm || currentSongData.suggested_progression) && (
                        <div className="p-6 bg-gray-800 rounded-3xl modular-card">
                            <h4 className="text-xl font-bold text-amber-400 mb-3 border-b border-amber-900 pb-2 flex items-center"><Music className="w-5 h-5 mr-2" /> Musical Core</h4>
                            <div className="flex flex-wrap justify-between items-center text-lg font-extrabold">
                                <p className="text-gray-300">Key: <span className="text-white">{currentSongData.suggested_key || 'N/A'}</span></p>
                                <p className="text-gray-300">BPM: <span className="text-white">{currentSongData.suggested_bpm || 'N/A'}</span></p>
                            </div>
                            <div className="mt-3 text-lg font-extrabold p-3 bg-gray-900 rounded-xl border border-gray-700">
                                <p className="text-gray-300">Progression: <span className="text-amber-300">{currentSongData.suggested_progression || 'N/A'}</span></p>
                            </div>
                        </div>
                    )}

                    {/* 3. Lyrics Sections - NOTE: Lyrical Analysis removed */}
                    {currentSongData.sections && currentSongData.sections.map((section, index) => {
                        const isRevision = section.type === 'Revision';
                        const sectionClasses = isRevision
                            ? "p-6 bg-orange-950/40 rounded-3xl border-2 border-orange-700 shadow-md"
                            : "p-6 bg-gray-800 rounded-3xl modular-card";
                        const typeColor = isRevision ? "text-orange-400" : "text-gray-200";

                        return (
                            <div key={index} className={sectionClasses}>
                                <div className="flex justify-between items-center mb-4 border-b pb-2 border-amber-900">
                                    <h3 className={`text-2xl font-bold ${typeColor}`}>{section.type}</h3>
                                </div>
                                <pre className="whitespace-pre-wrap text-lg text-gray-300 leading-relaxed">{section.lyrics}</pre>
                            </div>
                        );
                    })}

                    {/* 4. Citations */}
                    {sources.length > 0 ? (
                        <div className="p-6 bg-gray-800 rounded-3xl modular-card">
                            <h3 className="text-xl font-semibold text-gray-400 mb-3 border-b border-amber-900 pb-2 flex items-center"><BookOpen className="w-5 h-5 mr-2" /> Scriptural Grounding Sources</h3>
                            <ul className="list-disc list-inside text-sm text-gray-500 space-y-1">
                                {sources.map((s, index) => (
                                    <li key={index}><a href={s.uri} target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 underline">{s.title || s.uri}</a></li>
                                ))}
                            </ul>
                        </div>
                    ) : currentSongData.title && (
                        <div className="p-6 bg-gray-800 rounded-3xl modular-card">
                            <p className="text-sm text-gray-500">Note: Scriptural references were generated based on internal knowledge and the prompt.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
```

**Step 3: Test the modal structure**

Run: `npm run dev`
Expected: App compiles without errors, no visual changes (modal not rendered yet)

**Step 4: Commit**

```bash
git add src/App.jsx
git commit -m "feat: create LyricsModal component with full-screen layout"
```

---

### Task 3: Update ResultsPanel for Empty State

**Files:**
- Modify: `src/App.jsx:245-357` (update ResultsPanel component)

**Step 1: Add openModal prop to ResultsPanel**

Update the `ResultsPanel` component signature (line 245):

```javascript
const ResultsPanel = ({ currentSongData, sources, error, handleExport, openModal }) => {
```

**Step 2: Replace content when modal is closed**

Replace the entire `return` statement in `ResultsPanel` (lines 264-356) with:

```javascript
    return (
        <div className="text-center p-12 bg-gray-800 rounded-3xl modular-card">
            <Music className="w-16 h-16 mx-auto mb-4 text-amber-500" />
            <h3 className="text-3xl font-bold text-amber-400 mb-2">{currentSongData.title || 'Untitled Song'}</h3>
            <p className="text-lg text-gray-400 mb-6">{currentSongData.theme || 'No theme specified'}</p>
            <button
                onClick={openModal}
                className="px-8 py-4 bg-transparent text-amber-400 font-semibold text-xl rounded-3xl
                    border-2 border-amber-500 shadow-xl shadow-amber-900/50
                    hover:bg-amber-900/50 hover:text-amber-300 transition duration-200 ease-in-out transform hover:scale-105"
            >
                View Song
            </button>
        </div>
    );
```

**Step 3: Test empty state**

Run: `npm run dev`
Expected: App compiles without errors

**Step 4: Commit**

```bash
git add src/App.jsx
git commit -m "feat: update ResultsPanel to show empty state with View Song button"
```

---

### Task 4: Wire Up Modal in App Component

**Files:**
- Modify: `src/App.jsx:361-497` (App component)

**Step 1: Add modal auto-open in handleGenerate**

In the `useSongForge` hook (around line 128-223), find where `setCurrentSongData(songData)` is called (around line 193). After that line, add:

Actually, we need to add this in the App component itself since we can't modify the hook directly. We'll use a `useEffect` instead.

In the App component (after line 369 where we added isModalOpen state), add:

```javascript
// Auto-open modal when song data is set
React.useEffect(() => {
    if (currentSongData && !isModalOpen) {
        setIsModalOpen(true);
    }
}, [currentSongData]);
```

**Step 2: Update ResultsPanel call**

Find where `ResultsPanel` is rendered in the App component (around line 486-491). Update it to:

```javascript
<ResultsPanel
    currentSongData={currentSongData}
    sources={sources}
    error={error}
    handleExport={handleExport}
    openModal={() => setIsModalOpen(true)}
/>
```

**Step 3: Add LyricsModal render**

After the `ResultsPanel` in the App component, add the modal render:

```javascript
<LyricsModal
    isOpen={isModalOpen}
    onClose={() => setIsModalOpen(false)}
    currentSongData={currentSongData}
    sources={sources}
    handleExport={handleExport}
/>
```

**Step 4: Test full integration**

Run: `npm run dev`
Then:
1. Fill in a song concept (e.g., "A song about God's grace")
2. Click "Forge New Song Part"
3. Wait for generation to complete

Expected: Modal should auto-open with all content, empty state shown when closed, can re-open with button

**Step 5: Commit**

```bash
git add src/App.jsx
git commit -m "feat: wire up modal with auto-open and empty state integration"
```

---

### Task 5: Test All Functionality

**Files:**
- Test: `src/App.jsx`

**Step 1: Test auto-open behavior**

1. Run: `npm run dev`
2. Enter concept: "A song about redemption"
3. Click "Forge New Song Part"
4. Wait for generation

Expected: Modal opens automatically showing all content (title, musical core, lyrics, sources)

**Step 2: Test close functionality**

1. Click X button in top-right
2. Expected: Modal closes, empty state shows with song title and "View Song" button

3. Click backdrop (outside modal content)
4. Expected: Modal closes

5. Re-open modal by clicking "View Song"
6. Press ESC key
7. Expected: Modal closes

**Step 3: Test scroll lock**

1. Open modal
2. Try to scroll the background page
3. Expected: Background doesn't scroll, only modal content scrolls

4. Close modal
5. Expected: Background scrolling restored

**Step 4: Test export functionality**

1. Open modal
2. Click "Export to Markdown (.md)" button
3. Expected: File downloads with song content in markdown format

**Step 5: Verify lyrical analysis is removed**

1. Open modal
2. Scroll through all content
3. Expected: No "Lyrical Analysis & Polish ✨" section visible

**Step 6: Test error state**

1. Enter empty concept
2. Click "Forge New Song Part"
3. Expected: Error message displayed, no modal

**Step 7: Commit if any fixes needed**

If you made any fixes during testing:
```bash
git add src/App.jsx
git commit -m "fix: [description of what was fixed]"
```

---

### Task 6: Final Verification

**Files:**
- Test: `src/App.jsx`

**Step 1: Test full user workflow**

1. Start fresh (reload page)
2. Enter: "A worship song about Psalm 23"
3. Select tone: "Reflective"
4. Select structure: "Chorus-Heavy"
5. Click "Forge New Song Part"
6. Wait for generation
7. Verify modal opens automatically
8. Scroll through all content
9. Click export button
10. Close modal
11. Verify empty state
12. Click "View Song" to re-open
13. Press ESC to close

Expected: All steps work smoothly, no console errors

**Step 2: Check accessibility**

1. Open browser DevTools
2. Check Console for any errors
3. Check Network tab for API call status

Expected: No errors, API call returns 200 status

**Step 3: Final commit**

```bash
git status
```

If everything is committed:
```bash
git log --oneline -6
```

Expected output should show 6 commits:
```
[hash] feat: wire up modal with auto-open and empty state integration
[hash] feat: update ResultsPanel to show empty state with View Song button
[hash] feat: create LyricsModal component with full-screen layout
[hash] feat: add modal state for lyrics display
[previous commits...]
```

---

## Success Criteria Checklist

- [ ] Modal opens automatically after generation
- [ ] All content visible in modal (title, musical core, lyrics, citations)
- [ ] Lyrical Analysis section removed from display
- [ ] X button closes modal
- [ ] Backdrop click closes modal
- [ ] ESC key closes modal
- [ ] Empty state shows when modal closed
- [ ] "View Song" button re-opens modal
- [ ] Export button works from within modal
- [ ] Body scroll locked when modal open
- [ ] No console errors
- [ ] Responsive on mobile

## Notes for Implementation

- Keep the `lyrical_analysis` in the JSON schema to avoid breaking API calls
- All existing styling (colors, fonts, spacing) maintained in modal
- Focus management is basic but functional (ESC key support)
- Modal uses fixed positioning for full-screen overlay
- z-index: 50 ensures modal appears above all other content
