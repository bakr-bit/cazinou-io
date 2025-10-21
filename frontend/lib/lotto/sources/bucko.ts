import { LottoResult, SingleRow } from '../types';
import { fetchText, normalizeHtml, nowISO } from './_http';
import { uniqueInRange } from './_utils';

export async function fetchBucko(): Promise<LottoResult | null> {
  const sources = [
    { url: 'https://www.alc.ca/content/alc/en/lotto/bucko.html', name: 'alc.ca' }, // official (structure can change)
    { url: 'https://www.slotscalendar.com/lotteries/lotto-canada-atlantic-bucko-5-41/', name: 'slotscalendar.com' },
    { url: 'https://www.smartluck.com/free-lottery-tips/canada-atlantic-bucko-541.htm', name: 'smartluck.com' },
  ];

  for (const s of sources) {
    try {
      const html = normalizeHtml(await fetchText(s.url));

      const nums = [...html.matchAll(/\b([1-9]|[1-3]\d|4[01])\b/g)].map(m => parseInt(m[1], 10)); // 1..41
      const main = uniqueInRange(nums, 1, 41, 5);
      if (main.length < 5) continue;

      const data: SingleRow = {
        kind: 'single',
        numbers: main,
        jackpot: (html.match(/CAD?\s*\$?\s*[\d,]+/i)?.[0]) || null, // prize pool (if shown)
        bonus: null,
        winners: null,
        dateLabel: 'Latest Draw',
        source: s.name,
        updatedAt: nowISO(),
      };
      return data;
    } catch {
      // try next source
    }
  }
  return null;
}