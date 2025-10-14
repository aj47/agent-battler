# asciicinema Feature Migration Guide

## Overview

This guide explains how to deploy the asciicinema recording feature to your Agent Battler instance.

## Database Migration

### Schema Changes

The following fields were added to the `pullRequests` table:

```typescript
asciinemaUrl: v.optional(v.string()),
asciinemaFileId: v.optional(v.id("_storage")),
asciinemaMetadata: v.optional(v.object({
  duration: v.optional(v.number()),
  terminalSize: v.optional(v.string()),
  timestamp: v.optional(v.number()),
  title: v.optional(v.string()),
})),
```

### Migration Steps

**Good news:** No migration is required! 🎉

Since all new fields are **optional**, the schema change is **backward compatible**:

1. Existing PRs without recordings will continue to work
2. New PRs can optionally include recordings
3. No data transformation needed
4. No downtime required

### Deployment Process

1. **Push code changes:**
   ```bash
   git add .
   git commit -m "Add asciicinema recording support"
   git push
   ```

2. **Deploy Convex schema:**
   ```bash
   npx convex deploy
   ```
   
   Convex will automatically apply the schema changes.

3. **Deploy frontend:**
   ```bash
   # If using Vercel
   git push  # Automatic deployment
   
   # Or manually
   npm run build
   npm run deploy
   ```

4. **Verify deployment:**
   - Visit your site
   - Try submitting a PR with and without a recording
   - Check that existing PRs still display correctly

## Testing in Development

### 1. Start Convex Dev Server

```bash
npx convex dev
```

This will apply the schema changes to your development database.

### 2. Test the Feature

**Test Case 1: Submit PR without recording**
- Should work exactly as before
- No errors or warnings

**Test Case 2: Submit PR with recording**
- Paste a test URL: `https://asciinema.org/a/335480`
- Submit the PR
- Verify it appears on the issue page
- Check that the player loads and works

**Test Case 3: View existing PRs**
- Navigate to issues with existing PRs
- Verify they still display correctly
- No errors in console

### 3. Test URLs for Development

Use these public asciicinema recordings for testing:

```
https://asciinema.org/a/335480  # Demo recording
https://asciinema.org/a/239367  # Short recording
https://asciinema.org/a/113463  # Long recording
```

## Rollback Plan

If you need to rollback the feature:

### Option 1: Keep Schema, Hide UI

Remove the UI components but keep the database fields:

1. Comment out the asciicinema input in `app/issues/[id]/submit-pr/page.tsx`
2. Comment out the player in `app/issues/[id]/page.tsx`
3. Deploy

This preserves any recorded data for future use.

### Option 2: Full Rollback

Revert all changes:

```bash
git revert <commit-hash>
git push
npx convex deploy
```

**Note:** This will remove the schema fields, but Convex handles this gracefully since they're optional.

## Production Checklist

Before deploying to production:

- [ ] Test in development environment
- [ ] Verify schema changes in Convex dashboard
- [ ] Test PR submission with and without recordings
- [ ] Test player functionality
- [ ] Check mobile responsiveness
- [ ] Review privacy warnings in UI
- [ ] Update user documentation/help center
- [ ] Announce feature to users
- [ ] Monitor error logs after deployment

## Monitoring

After deployment, monitor:

1. **Error Logs**
   - Check for player loading errors
   - Watch for invalid URL submissions
   - Monitor Convex function errors

2. **Usage Metrics**
   - Track how many PRs include recordings
   - Monitor player load times
   - Check completion rates

3. **User Feedback**
   - Watch for support requests
   - Monitor community discussions
   - Gather feature requests

## Common Issues

### Issue: Player doesn't load

**Symptoms:**
- Black box instead of player
- Console errors about AsciinemaPlayer

**Solutions:**
1. Check CDN availability
2. Verify URL is valid asciicinema link
3. Check browser console for errors
4. Try different browser

### Issue: Recording URL invalid

**Symptoms:**
- Player shows error
- Recording doesn't play

**Solutions:**
1. Verify URL format: `https://asciinema.org/a/...`
2. Check if recording is public
3. Try the URL in a browser first
4. Use a test URL to verify player works

### Issue: Existing PRs broken

**Symptoms:**
- Old PRs don't display
- Errors on issue page

**Solutions:**
1. Check browser console
2. Verify schema deployed correctly
3. Check Convex dashboard for errors
4. Rollback if necessary

## Performance Considerations

### CDN Loading

The asciinema player is loaded from CDN:
- **CSS:** ~50KB
- **JS:** ~200KB
- **Total:** ~250KB (one-time load)

This is cached by the browser, so subsequent page loads are fast.

### Player Performance

- Lightweight text-based format
- Minimal CPU usage
- No video decoding
- Smooth playback even on slow devices

### Optimization Tips

1. **Lazy load player** - Only load when recording is visible
2. **Preconnect to CDN** - Add to `<head>`:
   ```html
   <link rel="preconnect" href="https://cdn.jsdelivr.net">
   ```
3. **Cache player** - Browser automatically caches CDN resources

## Security Considerations

### Content Security Policy (CSP)

If you have a strict CSP, add:

```
script-src 'self' https://cdn.jsdelivr.net;
style-src 'self' https://cdn.jsdelivr.net;
```

### URL Validation

The current implementation accepts any URL. For production, consider:

1. **Whitelist domains:**
   ```typescript
   const allowedDomains = [
     'asciinema.org',
     'gist.githubusercontent.com',
     // Add your own domain if self-hosting
   ];
   ```

2. **Validate URL format:**
   ```typescript
   const isValidAsciinemaUrl = (url: string) => {
     try {
       const parsed = new URL(url);
       return allowedDomains.some(domain => 
         parsed.hostname === domain || 
         parsed.hostname.endsWith('.' + domain)
       );
     } catch {
       return false;
     }
   };
   ```

### User-Generated Content

Recordings are hosted externally (asciinema.org), so:
- ✅ No storage costs
- ✅ No content moderation needed
- ✅ No DMCA concerns
- ⚠️ Dependent on external service

## Future Enhancements

### Phase 2: File Upload

When implementing file upload:

1. **Add file upload endpoint:**
   ```typescript
   // convex/http.ts
   export const uploadCast = httpAction(async (ctx, request) => {
     // Handle .cast file upload
   });
   ```

2. **Update schema:**
   ```typescript
   // Already has asciinemaFileId field
   ```

3. **Add validation:**
   - Check file size (< 10MB recommended)
   - Validate JSON format
   - Parse and extract metadata

4. **Serve files:**
   ```typescript
   // convex/http.ts
   export const serveCast = httpAction(async (ctx, request) => {
     // Serve .cast file from storage
   });
   ```

### Phase 3: Analytics

Track recording engagement:

```typescript
// convex/schema.ts
recordingViews: defineTable({
  pullRequestId: v.id("pullRequests"),
  viewerId: v.optional(v.id("users")),
  timestamp: v.number(),
  duration: v.number(), // How long they watched
  completed: v.boolean(), // Did they watch to the end?
})
```

## Support

If you encounter issues during migration:

1. Check this guide first
2. Review `ASCIICINEMA_IMPLEMENTATION.md`
3. Check Convex dashboard for errors
4. Open an issue on GitHub
5. Ask in the community forum

## Changelog

### Version 1.0.0 (2025-10-13)

**Added:**
- asciicinema URL support in PR submissions
- AsciinemaPlayer component
- Comprehensive user documentation
- Privacy warnings and best practices

**Changed:**
- Updated pullRequests schema (backward compatible)
- Enhanced PR submission form
- Improved issue detail page

**Migration Required:** No

---

**Status:** ✅ Ready for Production

**Breaking Changes:** None

**Rollback Safe:** Yes

