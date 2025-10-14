# Session Recording Feature - Deployment Checklist

## Pre-Deployment

### Code Review
- [ ] Review `convex/recordings.ts` for security and error handling
- [ ] Review `components/RecordingUpload.tsx` for UI/UX
- [ ] Review `components/RecordingDisplay.tsx` for display logic
- [ ] Review `lib/recordingUtils.ts` for validation logic
- [ ] Review `app/issues/[id]/submit-pr/page.tsx` integration
- [ ] Check TypeScript compilation: `npm run build`
- [ ] Run linter: `npm run lint`

### Testing
- [ ] Test file upload with valid .cast file
- [ ] Test file upload with invalid file (should show error)
- [ ] Test file size limit (>50MB should fail)
- [ ] Test recording metadata extraction
- [ ] Test download functionality
- [ ] Test recording removal
- [ ] Test with different terminal sizes
- [ ] Test error handling and user feedback
- [ ] Test on mobile/responsive design
- [ ] Test with slow network (upload progress)

### Documentation Review
- [ ] Review RECORDING_FEATURE_README.md
- [ ] Review RECORDING_IMPLEMENTATION_GUIDE.md
- [ ] Review RECORDING_CLI_GUIDE.md
- [ ] Verify all code examples work
- [ ] Check for broken links
- [ ] Verify API documentation is complete

## Deployment Steps

### 1. Database Schema Deployment

```bash
# Deploy schema changes to Convex
npx convex deploy

# Expected output:
# ✔ Added table indexes:
#   [+] pullRequests.recordingUrl
#   [+] pullRequests.recordingStorageId
#   [+] pullRequests.recordingMetadata
# ✔ Convex functions ready!
```

**Checklist:**
- [ ] Schema deployment successful
- [ ] No errors in deployment output
- [ ] Verify in Convex dashboard

### 2. Code Deployment

```bash
# Build the application
npm run build

# Deploy to Cloudflare Pages
npm run deploy:cloudflare

# Or deploy to your hosting platform
```

**Checklist:**
- [ ] Build completes without errors
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Deployment successful
- [ ] No 404 errors on deployed site

### 3. Post-Deployment Verification

#### Functionality Tests
- [ ] Navigate to issue page
- [ ] Click "Submit Pull Request"
- [ ] See recording upload section
- [ ] Upload a test .cast file
- [ ] Verify file validation works
- [ ] Verify metadata is stored
- [ ] View recording on PR details page
- [ ] Download recording works
- [ ] Recording removal works

#### Performance Tests
- [ ] Upload completes in <5s
- [ ] Page loads without lag
- [ ] No console errors
- [ ] Network requests are efficient

#### Browser Compatibility
- [ ] Test in Chrome/Chromium
- [ ] Test in Firefox
- [ ] Test in Safari
- [ ] Test in Edge
- [ ] Test on mobile browsers

#### Error Handling
- [ ] Test with corrupted file
- [ ] Test with oversized file
- [ ] Test with wrong file type
- [ ] Test network failure during upload
- [ ] Verify error messages are helpful

## Rollback Plan

If issues occur after deployment:

### Quick Rollback
```bash
# Revert to previous deployment
npm run deploy:cloudflare --rollback

# Or manually redeploy previous version
git checkout <previous-commit>
npm run build
npm run deploy:cloudflare
```

### Database Rollback
- Recording fields are optional, so no data migration needed
- If critical issues, can disable recording feature in UI
- No data loss if rolled back

## Monitoring

### Post-Deployment Monitoring

**First 24 Hours:**
- [ ] Monitor error logs
- [ ] Check upload success rate
- [ ] Monitor storage usage
- [ ] Check for performance issues
- [ ] Monitor user feedback

**First Week:**
- [ ] Track feature usage
- [ ] Monitor file sizes
- [ ] Check for edge cases
- [ ] Gather user feedback
- [ ] Monitor storage growth

### Metrics to Track

- Upload success rate
- Average file size
- Average session duration
- Storage usage
- Error rates
- User adoption rate

## User Communication

### Before Deployment
- [ ] Announce feature in changelog
- [ ] Share documentation links
- [ ] Provide quick start guide
- [ ] Share CLI guide

### After Deployment
- [ ] Send announcement email
- [ ] Post in community channels
- [ ] Update help documentation
- [ ] Monitor support tickets

## Documentation Updates

### Update Main README
- [ ] Add recording feature to feature list
- [ ] Link to RECORDING_FEATURE_README.md
- [ ] Add quick start section

### Update Setup Guide
- [ ] Add asciinema installation steps
- [ ] Add recording workflow
- [ ] Add troubleshooting section

### Create Help Articles
- [ ] How to record a session
- [ ] How to upload a recording
- [ ] How to view recordings
- [ ] Troubleshooting guide

## Post-Deployment Tasks

### Week 1
- [ ] Gather user feedback
- [ ] Fix any reported issues
- [ ] Optimize based on usage patterns
- [ ] Update documentation based on questions

### Week 2-4
- [ ] Analyze usage metrics
- [ ] Plan enhancements
- [ ] Consider asciinema.org integration
- [ ] Plan next features

## Success Criteria

✅ Feature is live and accessible  
✅ Users can record and upload sessions  
✅ Recordings display correctly  
✅ No critical errors in logs  
✅ Upload success rate > 95%  
✅ Average upload time < 5s  
✅ User feedback is positive  
✅ Documentation is clear and helpful  

## Contacts & Support

### For Issues
- Check error logs in Convex dashboard
- Review browser console for errors
- Check network tab for failed requests
- Review RECORDING_FEATURE_README.md troubleshooting

### For Questions
- Refer to RECORDING_CLI_GUIDE.md
- Refer to RECORDING_IMPLEMENTATION_GUIDE.md
- Check RECORDING_FEATURE_README.md

## Sign-Off

- [ ] Product Owner: Approved for deployment
- [ ] Tech Lead: Code review complete
- [ ] QA: Testing complete
- [ ] DevOps: Deployment ready

**Deployment Date:** _______________  
**Deployed By:** _______________  
**Verified By:** _______________  

## Notes

_Use this section to document any special considerations, known issues, or important notes about this deployment._

---

For questions or issues, refer to the documentation files:
- RECORDING_FEATURE_README.md
- RECORDING_IMPLEMENTATION_GUIDE.md
- RECORDING_CLI_GUIDE.md

