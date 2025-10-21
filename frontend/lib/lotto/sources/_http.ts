export async function fetchText(url: string, ua = 'Mozilla/5.0 (NextJS Fetcher)') {
    const res = await fetch(url, {
      headers: { 'user-agent': ua, 'accept-language': 'en;q=0.8' },
      cache: 'no-store',
      redirect: 'follow',
    });
    if (!res.ok) throw new Error(`${url} -> ${res.status}`);
    return res.text();
  }
  
  export function normalizeHtml(html: string) {
    // Strip scripts and collapse whitespace
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
      .replace(/\s+/g, ' ');
  }
  
  export function nowISO() {
    return new Date().toISOString();
  }
  