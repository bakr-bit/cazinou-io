// Quick test to check what data Sanity is returning
const {createClient} = require('@sanity/client')

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'your-project-id',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
})

async function test() {
  const result = await client.fetch(`
    *[_type == "beginnersGuide"][0]{
      heading,
      topics[0]{
        iconName,
        colorTheme,
        title
      }
    }
  `)
  console.log('Beginners Guide Data:', JSON.stringify(result, null, 2))
}

test().catch(console.error)
