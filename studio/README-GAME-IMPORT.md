# SlotsLaunch Game Import Guide

This guide explains how to easily import games from the SlotsLaunch API into Sanity CMS using the **CLI import script**.

## Overview

Games are imported via **command-line script** which automatically populates:
- `slotsLaunchId` - The game's numeric ID from the API
- `slotsLaunchSlug` - The URL slug (e.g., "book-of-ra-deluxe")
- `slotsLaunchThumb` - The thumbnail image URL
- `name` - The game's display name
- `provider` - Reference to the game provider (auto-created if needed)

## CLI Import Script

### Setup

1. Make sure you have SlotsLaunch credentials in root `.env.local`:
   ```bash
   SLOTSLAUNCH_TOKEN=your_token_here
   SLOTSLAUNCH_ORIGIN=cazinou.io
   ```

2. Navigate to studio directory:
   ```bash
   cd studio
   ```

### Usage

Import a game by **slug**:
```bash
npm run import-game -- --slug="book-of-ra-deluxe"
```

Import a game by **ID**:
```bash
npm run import-game -- --id=12345
```

### Example Output

```bash
$ npm run import-game -- --slug="book-of-ra"

🔍 Searching for game with slug: book-of-ra
   Searched page 1, continuing...

✅ Found game:
   Name: Book of Ra Deluxe
   ID: 12345
   Slug: book-of-ra-deluxe
   Provider: Novomatic
   Thumbnail: https://slotslaunch.com/images/games/...

📝 Creating new provider: Novomatic
📝 Creating new game document...

✅ Successfully imported game!
   Sanity ID: game-abc123
   Edit: https://cazinou.sanity.studio/desk/game;game-abc123
```

### Updating Existing Games

If a game already exists (matched by ID or slug), the script will **update** it instead of creating a duplicate:

```bash
⚠️  Game already exists in Sanity: game-abc123
   Updating existing document...
✅ Updated game: game-abc123
```

---

## Bulk Import Script (Advanced)

For importing multiple games, create a shell script:

**`import-games.sh`:**
```bash
#!/bin/bash

# Import multiple popular games
npm run import-game -- --slug="book-of-ra-deluxe"
npm run import-game -- --slug="shining-crown"
npm run import-game -- --slug="burning-hot"
npm run import-game -- --slug="aztec-gems"
npm run import-game -- --slug="sweet-bonanza"
```

Run it:
```bash
chmod +x import-games.sh
./import-games.sh
```

---

## Troubleshooting

### "SLOTSLAUNCH_TOKEN is not set"

**Fix:**
- Check root `.env.local` has `SLOTSLAUNCH_TOKEN`
- Run from `studio/` directory

### "Game not found"

- Verify the slug is correct (check slotslaunch.com)
- Try searching by ID instead of slug
- The game might not be published in the API

### "SlotsLaunch API returned 401"

- Your token is invalid or expired
- Regenerate token at: https://slotslaunch.com/account/api-token
- Update your `.env.local` files

### "Connect Timeout Error"

- You need to use a VPN to access the SlotsLaunch API
- The API might be temporarily down
- Check your internet connection

---

## Next Steps

After importing a game:

1. **Set Rating** - Add a rating out of 5
2. **Add SEO Content** - Write rich text content for SEO
3. **Upload Main Image** - Optional custom thumbnail (overrides API thumb)
4. **Review Content** - Add game review text
5. **Publish** - Make the game live

The game will now appear:
- On the `/pacanele-gratis` listing page (fetched from SlotsLaunch API)
- With a dedicated page at `/pacanele/{slug}` showing the game iframe
- With your custom SEO content (if added) below the game

---

## API Reference

The SlotsLaunch API provides these game fields:

```typescript
{
  id: number              // Unique game ID
  name: string            // Game display name
  slug: string            // URL-friendly slug
  description: string     // Game description
  url: string             // Iframe URL for playing
  thumb: string           // Thumbnail image URL
  provider: string        // Provider name (e.g., "Novomatic")
  provider_slug: string   // Provider URL slug
  rtp: string             // Return to player %
  volatility: string      // Low, Medium, High
  release: string         // Release date
  // ... many more fields
}
```

---

## Support

For issues or questions:
- Check the SlotsLaunch API docs: https://slotslaunch.com/api-documentation
- Verify your API token is valid
- Ensure you're using a VPN if the API is blocked in your region
