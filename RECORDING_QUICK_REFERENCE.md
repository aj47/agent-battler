# Session Recording - Quick Reference

## For Users

### Record a Session
```bash
# Install asciinema
brew install asciinema  # macOS
sudo apt install asciinema  # Linux

# Record
asciinema rec session.cast
# Run your agent
exit

# Replay locally
asciinema play session.cast
```

### Submit with Recording
1. Go to issue page
2. Click "Submit Pull Request"
3. Fill in PR URL and agent
4. Click "Add Recording"
5. Upload session.cast
6. Submit

### View Recording
- Recording appears on PR details page
- Shows duration, file size, format
- Download or view on asciinema.org

## For Developers

### File Locations

**Backend:**
- `convex/recordings.ts` - Convex functions
- `convex/schema.ts` - Database schema

**Frontend:**
- `components/RecordingUpload.tsx` - Upload component
- `components/RecordingDisplay.tsx` - Display component
- `lib/recordingUtils.ts` - Utilities

**Scripts:**
- `scripts/record_agent_session.py` - Python recorder

**Documentation:**
- `RECORDING_FEATURE_README.md` - Feature overview
- `RECORDING_IMPLEMENTATION_GUIDE.md` - Architecture
- `RECORDING_CLI_GUIDE.md` - User guide

### Key Functions

#### Convex Mutations
```typescript
// Generate upload URL
const uploadUrl = await generateRecordingUploadUrl();

// Attach recording to PR
await attachRecordingToPR({
  prId,
  storageId,
  recordingUrl?,
  metadata: { duration, fileSize }
});

// Remove recording
await removeRecording({ prId });
```

#### Convex Queries
```typescript
// Get recording metadata
const metadata = await getRecordingMetadata({ prId });

// Get download URL
const url = await getRecordingDownloadUrl({ prId });
```

#### Utilities
```typescript
// Validate .cast file
const result = validateCastFile(file);

// Format file size
formatFileSize(bytes);  // "1.5 MB"

// Format duration
formatDuration(seconds);  // "1m 30s"

// Check if asciinema.org URL
isAsciinemaUrl(url);

// Extract ID from URL
extractAsciinemaId(url);
```

### Components

#### RecordingUpload
```typescript
<RecordingUpload
  prId={prId}
  onUploadComplete={(metadata) => {
    // Handle success
  }}
  onError={(error) => {
    // Handle error
  }}
/>
```

#### RecordingDisplay
```typescript
<RecordingDisplay
  prId={prId}
  showDownload={true}
/>
```

### Database Schema

```typescript
recordingUrl?: string;
recordingStorageId?: string;
recordingMetadata?: {
  duration: number;
  fileSize: number;
  uploadedAt: number;
  format: "asciicast_v3";
};
```

### File Format

Asciicast v3 (newline-delimited JSON):
```json
{"version": 3, "term": {"cols": 80, "rows": 24}, "timestamp": 1504467315}
[0.248848, "o", "Hello World\n"]
[1.001376, "o", "Processing...\n"]
[0.8870, "x", "0"]
```

**Event Types:**
- `"o"` - Output
- `"i"` - Input
- `"m"` - Marker
- `"r"` - Resize
- `"x"` - Exit

### Validation

File must:
- Have .cast extension
- Be < 50MB
- Have valid JSON header
- Have valid event stream
- Be UTF-8 encoded

### Error Handling

```typescript
try {
  const result = validateCastFile(file);
  if (!result.valid) {
    console.error(result.error);
  }
} catch (error) {
  console.error("Validation failed:", error);
}
```

### Testing

```bash
# Create test file
python scripts/record_agent_session.py \
  --command "echo 'test'" \
  --output test.cast

# Validate
asciinema play test.cast

# Upload via UI
# Navigate to PR submission page
# Click "Add Recording"
# Select test.cast
```

### Deployment

```bash
# Deploy schema
npx convex deploy

# Build & deploy
npm run build
npm run deploy:cloudflare
```

### Troubleshooting

**Upload fails:**
- Check file is .cast format
- Verify file size < 50MB
- Ensure valid JSON format

**Player not showing:**
- Check URL is valid asciinema.org link
- Verify file uploaded successfully
- Try downloading and replaying locally

**Validation fails:**
- Ensure first line is valid JSON
- Check all events are valid arrays
- Verify UTF-8 encoding

## API Reference

### generateRecordingUploadUrl()
Returns upload URL for file storage.

### attachRecordingToPR(options)
- `prId` - Pull request ID
- `storageId` - File storage ID
- `recordingUrl?` - External URL
- `metadata` - Duration and file size

### getRecordingDownloadUrl(options)
- `prId` - Pull request ID
Returns download URL.

### getRecordingMetadata(options)
- `prId` - Pull request ID
Returns metadata object.

### removeRecording(options)
- `prId` - Pull request ID
Deletes recording.

## Limits

- Max file size: 50MB
- Supported formats: v2, v3
- Max duration: No limit
- Storage: Convex file storage

## Performance

- Upload: <1s typical
- Validation: <100ms
- File size: 50-200KB for 5min
- Compression: ~15% with gzip

## Security

- File validation required
- Only PR submitter can upload/remove
- Secure Convex storage
- No sensitive data in metadata

## Resources

- **Asciinema Docs**: https://docs.asciinema.org/
- **File Format**: https://docs.asciinema.org/manual/asciicast/v3/
- **Player API**: https://docs.asciinema.org/manual/player/

## Common Tasks

### Add Recording to PR
1. User records with asciinema
2. User uploads via RecordingUpload
3. Component validates file
4. Generates upload URL
5. Uploads to Convex storage
6. Attaches to PR with metadata

### Display Recording
1. Query recording metadata
2. Get download URL
3. Render RecordingDisplay
4. Show metadata
5. Embed player if asciinema.org

### Remove Recording
1. Call removeRecording mutation
2. Delete from storage
3. Update PR record
4. UI updates automatically

## Next Steps

1. Review RECORDING_FEATURE_README.md
2. Check RECORDING_IMPLEMENTATION_GUIDE.md
3. Follow DEPLOYMENT_CHECKLIST.md
4. Test with RECORDING_CLI_GUIDE.md examples
5. Deploy to production

---

**Status**: ✅ COMPLETE  
**Ready**: YES  
**Questions**: See RECORDING_FEATURE_README.md

