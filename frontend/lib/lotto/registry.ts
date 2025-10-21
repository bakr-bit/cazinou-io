import { GameDescriptor } from './types';
import { fetchIreland } from './sources/ireland';
import { fetchNorway } from './sources/norway';
import { fetchBari } from './sources/bari';
import { fetchKenoLatvia } from './sources/kenoLatvia';
import { fetchKaskada } from './sources/kaskada';
import { fetchCash5 } from './sources/cash5';
import { fetchBucko } from './sources/bucko';

export const GAMES: Record<string, GameDescriptor> = {
  // Matches your PHP shortcodes:

  keno_latvia: {
    key: 'keno_latvia',
    title: '🎲 Latvia Keno 20/62',
    theme: { bg: '#ffffff', accent: '#667eea' },
    type: 'keno',
    fetcher: fetchKenoLatvia,
  },

  bari: {
    key: 'bari',
    title: '🎰 Lotto Italia - Bari 5/90',
    theme: { bg: '#f9f9f9', accent: '#0073aa' },
    type: 'single',
    fetcher: fetchBari,
  },

  norway: {
    key: 'norway',
    title: '🇳🇴 Norway Lotto 7/34',
    theme: { bg: '#fef2f2', accent: '#dc2626' },
    type: 'single+bonus',
    fetcher: fetchNorway,
  },

  ireland: {
    key: 'Ireland',
    title: '🍀 Ireland Lotto 6/47',
    theme: { bg: '#f0fdf4', accent: '#22c55e' },
    type: 'single+bonus+jackpot',
    fetcher: fetchIreland,
  },

  kaskada: {
    key: 'kaskada',
    title: '🇵🇱 Polonia Kaskada 12/24',
    theme: { bg: '#fff5f5', accent: '#dc143c' },
    type: 'single+jackpot',
    fetcher: fetchKaskada,
  },

  cash5: {
    key: 'cash5',
    title: '🏔️ Colorado Cash 5/32',
    theme: { bg: '#eff6ff', accent: '#1e40af' },
    type: 'single+jackpot+winners',
    fetcher: fetchCash5,
  },

  bucko: {
    key: 'bucko',
    title: '🇨🇦 Atlantic Bucko 5/41',
    theme: { bg: '#fef2f2', accent: '#dc2626' },
    type: 'single+jackpot',
    fetcher: fetchBucko,
  },
};