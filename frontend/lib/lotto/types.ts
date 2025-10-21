export type DrawNumbers = number[];

export type BaseResult = {
  dateLabel: string;   // e.g. "Sat, Oct 4, 2025" or "Latest Draw"
  updatedAt: string;   // ISO string
  source?: string;     // attribution like "lottery.ie"
};

export type SingleRow = BaseResult & {
  kind: 'single';
  numbers: DrawNumbers;
  bonus?: number | null;
  jackpot?: string | null;
  winners?: string | null; // e.g. "0", "1", "3"
};

export type KenoRow = {
  numbers: DrawNumbers; // 20 numbers
  datetime?: string;    // optional source-provided timestamp
};

export type KenoResult = BaseResult & {
  kind: 'keno';
  rows: KenoRow[];
};

export type LottoResult = SingleRow | KenoResult;

export type GameDescriptor = {
  key: string;
  title: string;
  theme: { bg: string; accent: string }; // used by UI if you want
  type: 'single' | 'single+bonus' | 'single+bonus+jackpot' | 'single+jackpot' | 'single+jackpot+winners' | 'keno';
  fetcher: () => Promise<LottoResult | null>;
};