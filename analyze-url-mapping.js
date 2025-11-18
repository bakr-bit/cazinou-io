const fs = require('fs');
const urls = JSON.parse(fs.readFileSync('mapped-urls.json', 'utf8'));

const patterns = {
  covered: [],
  needsRedirect: [],
  missingSections: []
};

urls.forEach(item => {
  const path = item.url.replace('https://cazinou.io', '');

  // Already covered in Next.js
  if (path.match(/^\/pacanele\/[^\/]+\/?$/)) patterns.covered.push(item);
  else if (path.match(/^\/casino\/[^\/]+\/?$/)) patterns.covered.push(item);
  else if (path.match(/^\/pacanele-gratis\/[^\/]+\/?$/)) patterns.covered.push(item);
  else if (path.match(/^\/loto-online-keno\/[^\/]+\/?$/)) patterns.covered.push(item);
  else if (path.match(/^\/metode-de-plata\/[^\/]+\/?$/)) patterns.covered.push(item);
  else if (path.match(/^\/[^\/]+\/?$/) && path !== '/') patterns.covered.push(item);
  else if (path === '/' || path === '') patterns.covered.push(item);

  // Needs redirect (old loto structure)
  else if (path.match(/^\/loto\/[^\/]+\/?$/)) patterns.needsRedirect.push(item);

  // Missing sections
  else if (path.match(/^\/bonusuri\//)) patterns.missingSections.push({...item, section: 'bonusuri'});
  else if (path.match(/^\/sport\//)) patterns.missingSections.push({...item, section: 'sport'});
  else if (path.match(/^\/ghid\//)) patterns.missingSections.push({...item, section: 'ghid'});
  else if (path.match(/^\/category\//)) patterns.missingSections.push({...item, section: 'category'});
  else if (path.match(/^\/author\//)) patterns.missingSections.push({...item, section: 'author'});
  else if (path.match(/^\/blog\/page\//)) patterns.missingSections.push({...item, section: 'blog-pagination'});
  else patterns.missingSections.push({...item, section: 'other'});
});

console.log('URL Analysis Summary:');
console.log('===================\n');
console.log(`✅ Covered: ${patterns.covered.length} URLs`);
console.log(`⚠️  Needs Redirect: ${patterns.needsRedirect.length} URLs`);
console.log(`❓ Missing Sections: ${patterns.missingSections.length} URLs\n`);

console.log('\n🔴 NEEDS REDIRECT (Old /loto/ structure):');
patterns.needsRedirect.forEach(item => {
  const old = item.url.replace('https://cazinou.io', '');
  const newPath = old.replace('/loto/', '/loto-online-keno/');
  console.log(`${old} → ${newPath}`);
});

console.log('\n\n❓ MISSING SECTIONS Breakdown:');
const sections = {};
patterns.missingSections.forEach(item => {
  sections[item.section] = (sections[item.section] || 0) + 1;
});
Object.entries(sections).sort((a,b) => b[1] - a[1]).forEach(([section, count]) => {
  console.log(`  ${section}: ${count} URLs`);
});

console.log('\n\n📋 Sample Missing URLs by Section:');
const grouped = {};
patterns.missingSections.forEach(item => {
  if (!grouped[item.section]) grouped[item.section] = [];
  if (grouped[item.section].length < 5) grouped[item.section].push(item.url);
});
Object.entries(grouped).forEach(([section, urls]) => {
  console.log(`\n${section}:`);
  urls.forEach(url => console.log(`  - ${url.replace('https://cazinou.io', '')}`));
});

// Save detailed report to file
fs.writeFileSync('url-mapping-report.json', JSON.stringify({
  summary: {
    total: urls.length,
    covered: patterns.covered.length,
    needsRedirect: patterns.needsRedirect.length,
    missingSections: patterns.missingSections.length
  },
  covered: patterns.covered.map(i => i.url),
  needsRedirect: patterns.needsRedirect.map(i => ({
    old: i.url.replace('https://cazinou.io', ''),
    new: i.url.replace('https://cazinou.io', '').replace('/loto/', '/loto-online-keno/')
  })),
  missingSections: patterns.missingSections
}, null, 2));

console.log('\n\n📄 Detailed report saved to: url-mapping-report.json');
