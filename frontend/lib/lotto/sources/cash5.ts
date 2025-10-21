import { LottoResult, SingleRow } from '../types';
import { fetchText, normalizeHtml, nowISO } from './_http';
import { uniqueInRange } from './_utils';

export async function fetchCash5(): Promise<LottoResult | null> {
  const url = 'https://www.coloradolottery.com/en/games/cash5/drawings/';
  try {
    const html = normalizeHtml(await fetchText(url));

    // Collect numbers 1..32; grab first 5
    const nums = [...html.matchAll(/\b([1-9]|[12]\d|3[0-2])\b/g)].map(m => parseInt(m[1], 10));
    const main = uniqueInRange(nums, 1, 32, 5);
    if (main.length < 5) return null;

    const jackpot = (html.match(/\$\s?[\d,]+/i)?.[0]) || '$20,000';
    const winners = (html.match(/(\d+)\s+Jackpot\s+Winners?/i)?.[1]) || null;

    const data: SingleRow = {
      kind: 'single',
      numbers: main,
      jackpot,
      winners,
      bonus: null,
      dateLabel: 'Latest Draw',
      source: 'coloradolottery.com',
      updatedAt: nowISO(),
    };
    return data;
  } catch {
    return null;
  }
}