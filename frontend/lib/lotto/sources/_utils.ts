export function uniqueInRange(nums: number[], min: number, max: number, take?: number) {
    const uniq = Array.from(new Set(nums)).filter(n => n >= min && n <= max);
    return typeof take === 'number' ? uniq.slice(0, take) : uniq;
  }
  
  export function matchDateLabel(html: string) {
    // Try a few common date patterns; fallback to "Latest Draw"
    const m =
      html.match(/\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*\s*,?\s+[A-Za-z]+\s+\d{1,2},?\s+20\d{2}\b/i) ||
      html.match(/\b\d{1,2}\s+[A-Za-z]{3,}\s+20\d{2}\b/) ||
      html.match(/\b20\d{2}-\d{2}-\d{2}\b/);
    return m ? m[0] : 'Latest Draw';
  }