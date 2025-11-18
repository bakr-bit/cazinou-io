const fs = require('fs');
const urls = JSON.parse(fs.readFileSync('mapped-urls.json', 'utf8'));

const redirects = [];

urls.forEach(item => {
  const path = item.url.replace('https://cazinou.io', '');

  // Bonusuri - map to casino reviews where possible
  if (path.match(/^\/bonusuri\//)) {
    const slug = path.replace('/bonusuri/', '');

    // Try to extract casino name from bonus slug
    const casinoMatch = slug.match(/^([a-z0-9-]+)-(bonus|casino)/);

    if (casinoMatch) {
      let casinoSlug = casinoMatch[1];

      // Only add -casino if it doesn't already end with it
      if (!casinoSlug.endsWith('-casino')) {
        casinoSlug += '-casino';
      }

      redirects.push({
        source: path.replace(/\/$/, ''),
        destination: `/casino/${casinoSlug}/`,
        permanent: true,
        comment: `Bonus page → Casino review`
      });
    } else {
      // Generic bonus pages go to homepage
      redirects.push({
        source: path.replace(/\/$/, ''),
        destination: '/',
        permanent: true,
        comment: 'Generic bonus page → Homepage'
      });
    }
  }

  // Sport - redirect to homepage
  else if (path.match(/^\/sport\//)) {
    redirects.push({
      source: path.replace(/\/$/, ''),
      destination: '/',
      permanent: true,
      comment: 'Sport content → Homepage'
    });
  }

  // Ghid - redirect to homepage
  else if (path.match(/^\/ghid\//)) {
    redirects.push({
      source: path.replace(/\/$/, ''),
      destination: '/',
      permanent: true,
      comment: 'Guide → Homepage'
    });
  }

  // Category pages
  else if (path.match(/^\/category\//)) {
    if (path.includes('/category/bonusuri')) {
      redirects.push({
        source: path.replace(/\/$/, ''),
        destination: '/',
        permanent: true,
        comment: 'Category archive → Homepage'
      });
    } else if (path.includes('/category/loto')) {
      redirects.push({
        source: path.replace(/\/$/, ''),
        destination: '/loto-online-keno/',
        permanent: true,
        comment: 'Loto category → Loto section'
      });
    } else if (path.includes('/category/sport')) {
      redirects.push({
        source: path.replace(/\/$/, ''),
        destination: '/',
        permanent: true,
        comment: 'Sport category → Homepage'
      });
    } else {
      redirects.push({
        source: path.replace(/\/$/, ''),
        destination: '/',
        permanent: true,
        comment: 'Category archive → Homepage'
      });
    }
  }

  // Blog pagination
  else if (path.match(/^\/blog\/page\//)) {
    redirects.push({
      source: path.replace(/\/$/, ''),
      destination: '/',
      permanent: true,
      comment: 'Blog pagination → Homepage'
    });
  }

  // Author pagination (old structure)
  else if (path.match(/^\/author\/[^\/]+\/page\//)) {
    const authorSlug = path.match(/^\/author\/([^\/]+)\//)[1];
    redirects.push({
      source: path.replace(/\/$/, ''),
      destination: `/author/${authorSlug}/`,
      permanent: true,
      comment: 'Author pagination → Author page'
    });
  }

  // Autori → author redirect (for backward compatibility)
  else if (path.match(/^\/autori\//)) {
    const newPath = path.replace('/autori/', '/author/');
    redirects.push({
      source: path.replace(/\/$/, ''),
      destination: newPath,
      permanent: true,
      comment: '/autori/ → /author/ (Romanian to English)'
    });
  }
});

// Generate Next.js redirect format
console.log('// Blog content redirects - generated from WordPress mapping');
console.log('// Total redirects:', redirects.length);
console.log('');

redirects.forEach(r => {
  console.log(`      // ${r.comment}`);
  console.log(`      {`);
  console.log(`        source: '${r.source}',`);
  console.log(`        destination: '${r.destination}',`);
  console.log(`        permanent: ${r.permanent},`);
  console.log(`      },`);
});

// Save to file for review
fs.writeFileSync('blog-redirects.json', JSON.stringify(redirects, null, 2));
console.log('\n\n// Redirects saved to blog-redirects.json for review');
console.log(`// Success rate: ${redirects.filter(r => r.destination !== '/').length}/${redirects.length} mapped to specific pages`);
