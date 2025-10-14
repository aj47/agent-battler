# asciicinema Quick Reference

## 🚀 Quick Start (3 Steps)

### 1. Install
```bash
# macOS
brew install asciinema

# Ubuntu/Debian
sudo apt-get install asciinema

# Fedora
sudo dnf install asciinema

# From source (any platform)
cargo install --locked --git https://github.com/asciinema/asciinema
```

### 2. Record
```bash
# Start recording
asciinema rec my-session.cast

# Work on your issue...
# (everything is recorded)

# Stop recording
exit  # or press Ctrl+D
```

### 3. Upload & Share
```bash
# Upload to asciinema.org
asciinema upload my-session.cast

# You'll get a URL like:
# https://asciinema.org/a/abc123

# Paste this URL when submitting your PR!
```

## 📝 Common Commands

| Command | Description |
|---------|-------------|
| `asciinema rec file.cast` | Start recording to file |
| `asciinema rec -i 2 file.cast` | Record with max 2s idle time |
| `asciinema rec -t "Title" file.cast` | Record with title |
| `asciinema play file.cast` | Play back recording |
| `asciinema upload file.cast` | Upload to asciinema.org |
| `asciinema stream -l` | Stream locally |
| `asciinema stream -r` | Stream via relay |

## 💡 Pro Tips

### Before Recording
```bash
# Clean your terminal
clear

# Set a descriptive title
asciinema rec -t "Fixing bug #123 with Augment" session.cast
```

### During Recording
- Press `Ctrl+\` to add markers
- Keep it focused (5-15 minutes ideal)
- Narrate what you're doing (optional)

### After Recording
```bash
# Review before uploading
asciinema play session.cast

# Compress if large
gzip session.cast  # Creates session.cast.gz
```

## ⚠️ Privacy Checklist

Before uploading, make sure your recording doesn't contain:
- [ ] API keys or passwords
- [ ] Personal information
- [ ] Sensitive file contents
- [ ] Private repository URLs
- [ ] Environment variables with secrets

## 🎬 Recording Best Practices

### ✅ DO
- Record the complete workflow
- Use idle time limiting (`-i 2`)
- Add a descriptive title
- Review before uploading
- Keep it focused and relevant

### ❌ DON'T
- Record hours of idle time
- Include sensitive data
- Record unrelated work
- Upload without reviewing
- Hardcode secrets in commands

## 🔧 Troubleshooting

### Recording is too large
```bash
# Use idle time limiting
asciinema rec -i 2 session.cast

# Compress the file
gzip session.cast
```

### Can't install asciinema
```bash
# Use Docker
docker run --rm -it -v $PWD:/data asciinema/asciinema rec /data/session.cast
```

### Upload failed
- Check internet connection
- Try uploading at https://asciinema.org/
- Or host the file yourself (GitHub Gist, etc.)

## 📚 Learn More

- **Full Guide:** See `ASCIICINEMA_GUIDE.md`
- **Official Docs:** https://docs.asciinema.org/
- **Community:** https://discourse.asciinema.org/

---

**Need help?** Check the full guide or ask in the community forum!

