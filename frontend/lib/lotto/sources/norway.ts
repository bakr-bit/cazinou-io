import { LottoResult, SingleRow } from '../types';
import { fetchText, normalizeHtml, nowISO } from './_http';
import { uniqueInRange } from './_utils';

export async function fetchNorway(): Promise<LottoResult | null> {
  const url = 'https://lotteryguru.com/norway-lottery-results';
  try {
    const html = normalizeHtml(await fetchText(url));

    // Find a section around "Lotto" and grab numbers 1..34
    const section = html.match(/Lotto\s*([\s\S]*?)Vikinglotto/i)?.[0] || html;
    const all = [...section.matchAll(/\b([1-9]|[12]\d|3[0-4])\b/g)].map(m => parseInt(m[1], 10));
    const main = uniqueInRange(all, 1, 34, 7);
    if (main.length < 7) return null;

    const rest = uniqueInRange(all.slice(7), 1, 34);
    const bonus = rest.length ? rest[0] : null;

    const data: SingleRow = {
      kind: 'single',
      numbers: main,
      bonus,
      jackpot: null,
      winners: null,
      dateLabel: 'Latest Draw',
      source: 'lotteryguru.com',
      updatedAt: nowISO(),
    };
    return data;
  } catch {
    return null;
  }
}