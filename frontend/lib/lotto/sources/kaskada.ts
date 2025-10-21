import { LottoResult, SingleRow } from '../types';
import { fetchText, normalizeHtml, nowISO } from './_http';
import { uniqueInRange } from './_utils';

export async function fetchKaskada(): Promise<LottoResult | null> {
  const url = 'https://lotteryguru.com/poland-lottery-results';
  try {
    const html = normalizeHtml(await fetchText(url));

    // Try to find the Kaskada section then collect 12 numbers 1..24
    const section =
      html.match(/Kaskada\s*([\s\S]*?)Multi\s*Multi/i)?.[0] ||
      html.match(/Kaskada\s*([\s\S]*?)\b(?:Poland|Results)\b/i)?.[0] ||
      html;

    const nums = [...section.matchAll(/\b([1-9]|1\d|2[0-4])\b/g)].map(m => parseInt(m[1], 10));
    const main = uniqueInRange(nums, 1, 24, 12);
    if (main.length < 12) return null;

    const jackpot = (html.match(/PLN\s*([\d.,]+)/i)?.[0]) || null;

    const data: SingleRow = {
      kind: 'single',
      numbers: main,
      jackpot,
      bonus: null,
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