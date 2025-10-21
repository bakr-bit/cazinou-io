import { LottoResult, SingleRow } from '../types';
import { fetchText, normalizeHtml, nowISO } from './_http';
import { matchDateLabel, uniqueInRange } from './_utils';

export async function fetchBari(): Promise<LottoResult | null> {
  const url = 'https://lotterytexts.com/italy/lottomatica-bari/';
  try {
    const html = normalizeHtml(await fetchText(url));
    const nums = [...html.matchAll(/\b([1-9]\d?|90)\b/g)].map(m => parseInt(m[1], 10)); // 1..90
    const main = uniqueInRange(nums, 1, 90, 5);
    if (main.length < 5) return null;

    const dateLabel = matchDateLabel(html);
    const data: SingleRow = {
      kind: 'single',
      numbers: main,
      dateLabel,
      jackpot: null,
      bonus: null,
      winners: null,
      source: 'lotterytexts.com',
      updatedAt: nowISO(),
    };
    return data;
  } catch {
    return null;
  }
}