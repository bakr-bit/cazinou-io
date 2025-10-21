import { LottoResult, SingleRow } from '../types';
import { fetchText, normalizeHtml, nowISO } from './_http';
import { uniqueInRange } from './_utils';

export async function fetchIreland(): Promise<LottoResult | null> {
  const sources = [
    { url: 'https://www.lottery.ie/results/lotto/history', name: 'lottery.ie' },
    { url: 'https://www.lotteryextreme.com/ireland/lotto-results', name: 'lotteryextreme.com' },
    { url: 'https://lotto.jackpot.com/irish-lotto/results', name: 'jackpot.com' },
  ];

  for (const s of sources) {
    try {
      const htmlRaw = await fetchText(s.url);
      const html = normalizeHtml(htmlRaw);

      // Collect numbers 1..47 (try ball markers, fallback to general numbers)
      const numbers = [...html.matchAll(/\b([1-9]|[1-4][0-7])\b/g)].map(m => parseInt(m[1], 10));
      const main = uniqueInRange(numbers, 1, 47, 6);
      if (main.length < 6) continue;

      // Bonus sometimes appears right after main six in some sources
      const bonus = numbers.length >= 7 ? numbers[6] : null;

      const jackpotMatch = html.match(/€\s?([\d.,]+(?:\s*(?:m|million))?)/i);
      const jackpot = jackpotMatch ? `€${jackpotMatch[1]}` : null;

      // Date (some pages include nice labels, else fallback)
      const dateMatch =
        html.match(/\b(Wed|Sat)[a-z]*\s*,?\s+[A-Za-z]+\s+\d{1,2},?\s+20\d{2}\b/i) ||
        html.match(/\b20\d{2}-\d{2}-\d{2}\b/);
      const dateLabel = dateMatch ? dateMatch[0] : 'Latest Draw';

      const data: SingleRow = {
        kind: 'single',
        numbers: main,
        bonus,
        jackpot,
        winners: null,
        dateLabel,
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