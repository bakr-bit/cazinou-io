import { KenoResult } from '../types';
import { fetchText, normalizeHtml, nowISO } from './_http';

export async function fetchKenoLatvia(): Promise<KenoResult | null> {
  const url = 'https://www.lotteryextreme.com/Latvia/keno-results';
  try {
    const html = normalizeHtml(await fetchText(url));

    // Roughly split rows; adjust if you later use a real HTML parser
    const chunks = html.split(/<\/tr>/i).slice(0, 12);
    const rows: { numbers: number[]; datetime?: string }[] = [];

    for (const chunk of chunks) {
      const nums = [...chunk.matchAll(/\b(\d{1,2})\b/g)]
        .map(m => parseInt(m[1], 10))
        .filter(n => n >= 1 && n <= 62);

      // Keno row must have at least 20 numbers
      if (nums.length >= 20) {
        const uniqueSorted = Array.from(new Set(nums)).slice(0, 20).sort((a, b) => a - b);
        if (uniqueSorted.length === 20) {
          const dt = chunk.match(/\b\d{1,2}[./-]\d{1,2}[./-]\d{2,4}\b/)?.[0];
          rows.push({ numbers: uniqueSorted, datetime: dt });
        }
      }
    }

    if (!rows.length) return null;

    return {
      kind: 'keno',
      rows,
      dateLabel: 'Latest Results',
      updatedAt: nowISO(),
      source: 'lotteryextreme.com',
    };
  } catch {
    return null;
  }
}