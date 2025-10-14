# Session Recording Implementation Guide

## Overview

This guide explains how to use the new session recording feature in Agent Battler. Users can now record their terminal sessions using asciicinema and attach them to PR submissions to showcase their agent's work process.

## Architecture

### Database Schema Changes

The `pullRequests` table now includes recording fields:

```typescript
recordingUrl: v.optional(v.string()), // URL to .cast file or asciinema.org link
recordingStorageId: v.optional(v.string()), // Convex file storage ID
recordingMetadata: v.optional(v.object({
  duration: v.number(), // Duration in seconds
  fileSize: v.number(), // File size in bytes
  uploadedAt: v.number(), // Timestamp when uploaded
  format: v.literal("asciicast_v3"), // Recording format
})),
```

### New Convex Functions

**File:** `convex/recordings.ts`

- `generateRecordingUploadUrl()` - Get upload URL for file
- `attachRecordingToPR()` - Attach recording to PR after upload
- `getRecordingDownloadUrl()` - Get download URL for stored recording
- `getRecordingMetadata()` - Get recording info
- `removeRecording()` - Delete recording from PR

### New Components

**RecordingUpload.tsx**
- Drag-and-drop file upload interface
- File validation (checks .cast format, size limits)
- Upload progress tracking
- Error handling and user feedback

**RecordingDisplay.tsx**
- Display recording metadata (duration, file size)
- Embed asciinema.org player if applicable
- Download button for .cast files
- External link to asciinema.org

### Utility Functions

**File:** `lib/recordingUtils.ts`

- `validateCastFile()` - Validate .cast file format
- `formatFileSize()` - Format bytes to readable size
- `formatDuration()` - Format seconds to readable duration
- `generateAsciinemaEmbed()` - Generate embed code
- `generateRecordingMarkdown()` - Generate markdown for PR
- `isAsciinemaUrl()` - Check if URL is asciinema.org
- `extractAsciinemaId()` - Extract ID from asciinema.org URL

## User Workflow

### Step 1: Record Session

Users record their agent session using asciinema CLI:

```bash
# Install asciinema (if not already installed)
brew install asciinema  # macOS
# or
sudo apt install asciinema  # Linux

# Start recording
asciinema rec session.cast

# Run your agent and complete the task
# (e.g., run Augment, Cursor, or other AI coding agent)

# Exit shell to stop recording
exit
```

### Step 2: Submit PR

1. Navigate to issue page
2. Click "Submit Pull Request"
3. Fill in GitHub PR URL
4. Select AI coding agent used
5. (Optional) Click "Add Recording" to upload .cast file
6. Select the `session.cast` file from your computer
7. File is validated and uploaded
8. Submit the PR

### Step 3: View Recording

- Issue creator can view the recording on the PR details page
- Recording shows duration, file size, and format
- If uploaded to asciinema.org, embedded player is shown
- Users can download the .cast file for local playback

## File Format: Asciicast v3

The `.cast` format is newline-delimited JSON:

```json
{"version": 3, "term": {"cols": 80, "rows": 24}, "timestamp": 1504467315}
[0.248848, "o", "Hello World\n"]
[1.001376, "o", "Processing...\n"]
[0.8870, "x", "0"]
```

**Supported event codes:**
- `"o"` - Output (terminal output)
- `"i"` - Input (keyboard input)
- `"m"` - Marker (navigation breakpoint)
- `"r"` - Resize (terminal resize)
- `"x"` - Exit (exit status)

## Configuration

### File Size Limits

- Maximum file size: 50MB
- Typical 5-minute session: 50-200KB

### Supported Formats

- Asciicast v2 (.cast)
- Asciicast v3 (.cast)

### Storage

- Files stored in Convex file storage
- Automatic cleanup when recording is removed
- Optional external URL for asciinema.org links

## Integration Points

### Submit PR Page

The recording upload is integrated into `/app/issues/[id]/submit-pr/page.tsx`:

```typescript
<RecordingUpload
  prId={prId}
  onUploadComplete={(metadata) => {
    // Handle successful upload
  }}
  onError={(error) => {
    // Handle upload error
  }}
/>
```

### PR Details Page

Display recording on PR details page:

```typescript
<RecordingDisplay
  prId={prId}
  showDownload={true}
/>
```

## API Reference

### Mutations

#### attachRecordingToPR

```typescript
await attachRecording({
  prId: Id<"pullRequests">,
  storageId: string,
  recordingUrl?: string,
  metadata: {
    duration: number,
    fileSize: number,
  }
})
```

#### removeRecording

```typescript
await removeRecording({
  prId: Id<"pullRequests">
})
```

### Queries

#### getRecordingMetadata

```typescript
const metadata = await getRecordingMetadata({
  prId: Id<"pullRequests">
})
// Returns: { hasRecording, recordingUrl, metadata }
```

#### getRecordingDownloadUrl

```typescript
const url = await getRecordingDownloadUrl({
  prId: Id<"pullRequests">
})
```

## Error Handling

### Validation Errors

- Invalid file format
- File too large
- Missing header
- Corrupted events

### Upload Errors

- Network failures
- Storage quota exceeded
- Permission denied

All errors are displayed to the user with helpful messages.

## Future Enhancements

1. **Asciinema.org Integration**
   - Auto-upload to asciinema.org
   - Generate shareable links
   - Embed player directly

2. **Recording Playback**
   - Built-in player component
   - Playback controls (play, pause, speed)
   - Seek to specific timestamps

3. **Recording Analytics**
   - Track most-watched recordings
   - Recording quality metrics
   - Agent performance correlation

4. **Advanced Features**
   - Recording trimming/editing
   - Subtitle/marker support
   - Custom themes for playback

## Troubleshooting

### Recording won't upload

- Check file is valid .cast format
- Ensure file size < 50MB
- Verify network connection

### Player not showing

- Check if URL is valid asciinema.org link
- Verify file was uploaded successfully
- Try downloading and replaying locally

### File validation fails

- Ensure first line is valid JSON header
- Check all events are valid JSON arrays
- Verify file encoding is UTF-8

## Support

For issues or questions:
1. Check the validation error message
2. Review the recording file format
3. Try replaying locally with `asciinema play session.cast`
4. Contact support with the error details

