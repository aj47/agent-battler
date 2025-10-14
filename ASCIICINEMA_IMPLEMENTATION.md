# asciicinema Recording Implementation

This document describes the implementation of asciicinema terminal session recording support in Agent Battler.

## Overview

Users can now optionally submit terminal session recordings when submitting PRs. These recordings show how they and their AI coding agent worked on the issue, providing transparency and helping others learn.

## What Was Implemented

### 1. Database Schema Updates

**File:** `convex/schema.ts`

Added three new optional fields to the `pullRequests` table:

```typescript
// asciicinema recording fields
asciinemaUrl: v.optional(v.string()), 
// URL to asciicinema.org or self-hosted recording

asciinemaFileId: v.optional(v.id("_storage")), 
// Convex storage ID for uploaded .cast file (future enhancement)

asciinemaMetadata: v.optional(v.object({
  duration: v.optional(v.number()), // Recording duration in seconds
  terminalSize: v.optional(v.string()), // e.g., "80x24"
  timestamp: v.optional(v.number()), // Recording timestamp
  title: v.optional(v.string()), // Recording title
})),
```

### 2. Backend API Updates

**File:** `convex/pullRequests.ts`

Updated the `submitPullRequest` mutation to accept and store asciicinema data:

```typescript
export const submitPullRequest = mutation({
  args: {
    // ... existing args
    asciinemaUrl: v.optional(v.string()),
    asciinemaFileId: v.optional(v.id("_storage")),
    asciinemaMetadata: v.optional(v.object({...})),
  },
  handler: async (ctx, args) => {
    // ... stores the asciicinema data with the PR
  },
});
```

### 3. Frontend Components

#### AsciinemaPlayer Component

**File:** `components/AsciinemaPlayer.tsx`

A React component that:
- Dynamically loads the asciinema-player library from CDN
- Displays terminal recordings with full playback controls
- Supports customization (speed, idle time limit, theme, etc.)
- Provides a clean, embedded player experience

Features:
- ▶️ Play/pause controls
- ⏩ Adjustable playback speed
- 📋 Copy-paste text from the recording
- 🎨 Terminal theme support
- 📏 Responsive sizing

#### Submit PR Page Updates

**File:** `app/issues/[id]/submit-pr/page.tsx`

Added:
1. **Input field** for asciicinema URL
2. **Comprehensive guide** on how to record sessions
3. **Quick start instructions** embedded in the form
4. **Privacy warnings** about sensitive data
5. **Link to full documentation**

The form now includes:
```tsx
<input
  type="url"
  placeholder="https://asciinema.org/a/..."
  value={asciinemaUrl}
  onChange={(e) => setAsciinemaUrl(e.target.value)}
/>
```

#### Issue Detail Page Updates

**File:** `app/issues/[id]/page.tsx`

Enhanced PR display to:
1. Show a "Recording" badge when a PR has an asciicinema URL
2. Embed the AsciinemaPlayer component for playback
3. Display recordings inline with PR details

Visual indicators:
- 🎥 "Recording" badge on PRs with recordings
- Embedded player with controls
- Helpful tips for viewers

### 4. Documentation

#### User Guide

**File:** `ASCIICINEMA_GUIDE.md`

Comprehensive guide covering:
- What is asciicinema and why use it
- Installation instructions for all platforms
- Step-by-step recording workflow
- Best practices and tips
- Advanced usage (markers, streaming, self-hosting)
- Privacy and security considerations
- Troubleshooting
- FAQ

#### Implementation Documentation

**File:** `ASCIICINEMA_IMPLEMENTATION.md` (this file)

Technical documentation for developers.

## User Workflow

### Recording a Session

1. **Install asciinema:**
   ```bash
   brew install asciinema  # macOS
   # or apt-get, dnf, cargo install, etc.
   ```

2. **Start recording:**
   ```bash
   asciinema rec my-session.cast
   ```

3. **Work on the issue** (all terminal activity is recorded)

4. **Stop recording:**
   ```bash
   exit  # or Ctrl+D
   ```

5. **Review the recording:**
   ```bash
   asciinema play my-session.cast
   ```

6. **Upload to asciinema.org:**
   ```bash
   asciinema upload my-session.cast
   ```
   
   Output: `https://asciinema.org/a/abc123`

7. **Submit PR on Agent Battler** with the URL

### Viewing a Recording

1. Navigate to an issue with PRs
2. PRs with recordings show a "Recording" badge
3. Click to expand and view the embedded player
4. Use player controls to:
   - Play/pause
   - Adjust speed
   - Copy text from the terminal
   - Fullscreen mode

## Technical Details

### asciicast File Format

asciicinema uses a lightweight text-based format (`.cast` files):

```json
{"version": 3, "term": {"cols": 80, "rows": 24}, "timestamp": 1234567890}
[0.5, "o", "$ echo 'Hello World'\r\n"]
[0.1, "o", "Hello World\r\n"]
```

Each line after the header is an event: `[time_offset, event_type, data]`

Benefits:
- **Small file size** - Much smaller than video
- **Highly compressible** - Can be gzipped to ~15% of original
- **Text-based** - Searchable and editable
- **Copy-paste friendly** - Viewers can copy terminal content

### Player Integration

The AsciinemaPlayer component loads the official player from CDN:

```typescript
// CSS
https://cdn.jsdelivr.net/npm/asciinema-player@3.10.0/dist/bundle/asciinema-player.css

// JavaScript
https://cdn.jsdelivr.net/npm/asciinema-player@3.10.0/dist/bundle/asciinema-player.min.js
```

This approach:
- ✅ No build dependencies
- ✅ Always up-to-date
- ✅ Smaller bundle size
- ✅ Works with Next.js SSR

### Data Flow

```
User records session
    ↓
Uploads to asciinema.org
    ↓
Gets shareable URL
    ↓
Pastes URL in PR submission form
    ↓
Stored in Convex database
    ↓
Displayed in PR view with embedded player
```

## Future Enhancements

### Phase 2: File Upload Support

Allow users to upload `.cast` files directly:

1. Add file upload to submit PR form
2. Store files in Convex storage
3. Serve files via Convex HTTP endpoints
4. Parse and validate `.cast` files
5. Extract metadata automatically

### Phase 3: Advanced Features

- **Multiple recordings per PR** - Different test scenarios
- **Markers and chapters** - Navigate to key moments
- **Thumbnails** - Preview before playing
- **Analytics** - Track view counts, completion rates
- **Editing tools** - Trim, annotate recordings

### Phase 4: Live Streaming

- **Real-time streaming** - Watch agents work live
- **Collaborative sessions** - Multiple viewers
- **Auto-linking** - Automatically link streams to PRs
- **Notifications** - Alert when someone starts streaming

## Benefits

### For Contributors

- 🌟 **Stand out** - PRs with recordings are more engaging
- 🎓 **Teach others** - Share your workflow
- ✅ **Build trust** - Show your actual work process
- 📈 **Better reviews** - Reviewers can see the full context

### For Issue Creators

- 👀 **Transparency** - See how the work was done
- 🔍 **Better reviews** - Understand the approach
- 🎯 **Quality assurance** - Verify the process
- 📚 **Learning** - See different agent approaches

### For the Community

- 📊 **Agent comparison** - See how different agents work
- 🎓 **Educational** - Learn from successful submissions
- 🤝 **Collaboration** - Share knowledge and techniques
- 📈 **Platform growth** - More engaging content

## Privacy & Security

### Considerations

⚠️ **Recordings capture everything in the terminal:**
- Commands typed
- Program output
- Environment variables (if printed)
- File contents (if displayed)

### Best Practices

1. **Review before uploading** - Always play back first
2. **Use environment files** - Don't hardcode secrets
3. **Clear sensitive output** - Use `clear` command
4. **Edit if needed** - `.cast` files are JSON, can be edited
5. **Use private hosting** - For sensitive projects

### Recommendations

- ✅ Record only the relevant work
- ✅ Use idle time limiting to skip pauses
- ✅ Add markers for important moments
- ✅ Keep recordings focused and concise
- ❌ Don't record sensitive data
- ❌ Don't include personal information
- ❌ Don't record unrelated work

## Testing

### Manual Testing Checklist

- [ ] Submit PR without recording (should work as before)
- [ ] Submit PR with valid asciinema.org URL
- [ ] Submit PR with invalid URL (should still work)
- [ ] View PR with recording on issue page
- [ ] Play/pause recording
- [ ] Adjust playback speed
- [ ] Copy text from recording
- [ ] Test on mobile devices
- [ ] Test with different terminal themes
- [ ] Test with long recordings (>10 minutes)

### Test URLs

For testing, you can use these public asciicinema recordings:

- Demo: https://asciinema.org/a/335480
- Short: https://asciinema.org/a/239367
- Long: https://asciinema.org/a/113463

## Resources

- **asciicinema.org:** https://asciinema.org/
- **Documentation:** https://docs.asciinema.org/
- **GitHub:** https://github.com/asciinema/asciinema
- **Player Docs:** https://docs.asciinema.org/manual/player/
- **File Format:** https://docs.asciinema.org/manual/asciicast/v3/

## Support

For questions or issues:
1. Check `ASCIICINEMA_GUIDE.md` for user documentation
2. Review this file for technical details
3. Visit https://discourse.asciinema.org/ for asciinema-specific questions
4. Open an issue on the Agent Battler repository

---

**Implementation Status:** ✅ Complete (Phase 1 - URL Support)

**Next Steps:** 
- Gather user feedback
- Monitor usage metrics
- Plan Phase 2 (file upload) based on demand

