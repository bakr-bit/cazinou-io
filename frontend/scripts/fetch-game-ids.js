const https = require('https')

const missingGames = [
  '20-golden-coins',
  'amazons-battle',
  'faust',
  'fruit-party',
  'gems-bonanza',
  'great-rhino',
  'john-hunter-and-the-book-of-tut',
  'just-jewels-deluxe',
  'katana',
  'lord-of-the-ocean',
  'majestic-forest',
  'mines',
  'neon-shapes-tetris-gratis',
  'penguin-style',
  'rise-of-ra',
  'roaring-forties',
  'san-quentin',
  'starlight-princess',
  'supreme-hot',
  'the-dog-house-megaways',
  'vampire-night',
  'wild-north',
]

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = ''
      res.on('data', (chunk) => data += chunk)
      res.on('end', () => resolve(data))
    }).on('error', reject)
  })
}

function extractGameId(html) {
  // First try: data-src="https://slotslaunch.com/iframe/XXXXX?token=..."
  let match = html.match(/data-src="https:\/\/slotslaunch\.com\/iframe\/(\d+)\?token=/)
  if (match) return match[1]

  // Second try: https://assets.slotslaunch.com/XXXXX/game-name.jpg
  match = html.match(/https:\/\/assets\.slotslaunch\.com\/(\d+)\//)
  if (match) return match[1]

  // Third try: src="https://slotslaunch.com/iframe/XXXXX?token=..."
  match = html.match(/src="https:\/\/slotslaunch\.com\/iframe\/(\d+)\?token=/)
  if (match) return match[1]

  return null
}

async function fetchAllGameIds() {
  console.log('\n🎰 Fetching SlotsLaunch Game IDs from cazinou.io\n')
  console.log('='.repeat(80))

  const results = []

  for (const slug of missingGames) {
    const urls = [
      `https://cazinou.io/pacanele/${slug}/`,
      `https://cazinou.io/pacanele/${slug}-demo/`
    ]

    let gameId = null
    let workingUrl = null

    process.stdout.write(`Fetching ${slug}... `)

    for (const url of urls) {
      try {
        const html = await fetchPage(url)
        gameId = extractGameId(html)

        if (gameId) {
          workingUrl = url
          break
        }
      } catch (error) {
        // Try next URL
      }

      // Small delay between attempts
      await new Promise(resolve => setTimeout(resolve, 300))
    }

    if (gameId) {
      console.log(`✅ ID: ${gameId}`)
      results.push({ slug, gameId, url: workingUrl })
    } else {
      console.log(`❌ No ID found`)
      results.push({ slug, gameId: null, url: urls[0] })
    }

    // Small delay to be nice to the server
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  console.log('\n' + '='.repeat(80))
  console.log('\n📊 Results:\n')

  const found = results.filter(r => r.gameId)
  const notFound = results.filter(r => !r.gameId)

  console.log(`✅ Found: ${found.length}`)
  console.log(`❌ Not found: ${notFound.length}`)

  console.log('\n\n📋 CSV Output (slug,gameId):\n')
  console.log('='.repeat(80))
  console.log('slug,gameId,url')
  results.forEach(r => {
    console.log(`${r.slug},${r.gameId || 'NOT_FOUND'},${r.url}`)
  })

  console.log('\n\n📋 JSON Output:\n')
  console.log('='.repeat(80))
  console.log(JSON.stringify(results, null, 2))
}

fetchAllGameIds()
