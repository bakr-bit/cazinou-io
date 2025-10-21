# Quick Start: Import SlotsLaunch Games

## 🚀 CLI Import (Only Method)

### One-Time Setup
```bash
# Add to root .env.local (if not already there)
echo "SLOTSLAUNCH_TOKEN=your_token" >> ../.env.local
echo "SLOTSLAUNCH_ORIGIN=cazinou.io" >> ../.env.local
```

### Import a Game
```bash
cd studio
npm run import-game -- --slug="book-of-ra-deluxe"
```

**Done!** The game is now in Sanity with all fields populated.

---

## 📋 Quick Examples

### Import by Slug
```bash
npm run import-game -- --slug="shining-crown"
npm run import-game -- --slug="burning-hot"
npm run import-game -- --slug="sweet-bonanza"
```

### Import by ID
```bash
npm run import-game -- --id=12345
npm run import-game -- --id=67890
```

### Bulk Import (Multiple Games)
```bash
for slug in "book-of-ra" "shining-crown" "burning-hot"; do
  npm run import-game -- --slug="$slug"
done
```

---

## 🔍 Finding Game Slugs

### Method 1: Browse Your Site
Visit `/pacanele-gratis` page on your site and note the game slug from the URL

### Method 2: Check SlotsLaunch Site
Game URL format: `https://slotslaunch.com/slots/{slug}`

### Method 3: Browse API
Visit https://slotslaunch.com/api/games?token=YOUR_TOKEN&per_page=100

---

## ⚡ Common Commands

| Task | Command |
|------|---------|
| Import single game | `npm run import-game -- --slug="game-name"` |
| Import by ID | `npm run import-game -- --id=12345` |
| View games in Studio | Open `http://localhost:3333/desk/game` |
| Edit imported game | Open Studio → Games → Select game |

---

## 🆘 Quick Troubleshooting

**"Token not set"**
→ Add credentials to `.env.local` (root for CLI, studio for UI)

**"Game not found"**
→ Check slug spelling or try using ID instead

**"Timeout error"**
→ Use VPN to access SlotsLaunch API

**"Already exists"**
→ Game will be updated (not duplicated)

---

## 📖 Full Documentation

See `README-GAME-IMPORT.md` for:
- Detailed setup instructions
- Field explanations
- Advanced bulk import scripts
- Troubleshooting guide
- API reference
