
/**
 * EngineAdapter — bridges the game to Stake Engine for approvals.
 * 
 * Modes:
 *  - 'engine' : use the global SDK if the host injects it (production on Stake).
 *  - 'server' : call our own backend which runs the math engine (useful for review).
 *  - 'mock'   : fallback random outcomes for local UI work.
 * 
 * Configure with VITE_RUNTIME_MODE = 'engine' | 'server' | 'mock'
 */

import { SLOT_CONFIG } from './slotConfig';

export type EngineMode = 'engine' | 'server' | 'mock';

declare global {
  interface Window {
    stake_engine_sdk?: {
      getBalance: () => Promise<number>;
      play: (payload: { bet: number }) => Promise<any>;
    };
    engine?: {
      getBalance: () => Promise<number>;
      play: (payload: { bet: number }) => Promise<any>;
    };
    Stake?: any;
  }
}

export interface SpinResult {
  board: string[];
  payoutMultiplier: number;
  events: any[];
  totalWin: number;
  wins: Array<{
    symbol: string;
    kind: number;
    win: number;
    positions: number[];
  }>;
}

const MODE: EngineMode = (import.meta as any).env?.VITE_RUNTIME_MODE || 'mock';

const pickSdk = () => window.stake_engine_sdk ?? window.engine ?? null;

/** Real engine calls (Stake host provides the SDK). */
async function enginePlay(bet: number): Promise<SpinResult> {
  const sdk = pickSdk();
  if (!sdk?.play) throw new Error('Engine SDK not available');
  const res = await sdk.play({ bet });
  return normalizeSpinResult(res);
}

async function engineGetBalance(): Promise<number> {
  const sdk = pickSdk();
  if (!sdk?.getBalance) throw new Error('Engine SDK not available');
  const bal = await sdk.getBalance();
  return typeof bal === 'number' ? bal : Number(bal?.balance ?? 0);
}

/** Server fallback — hits our express route which calls the Python math engine. */
async function serverPlay(bet: number): Promise<SpinResult> {
  const res = await fetch('/api/stake/play', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bet })
  });
  if (!res.ok) throw new Error(`Server play failed: ${res.status}`);
  const data = await res.json();
  return normalizeSpinResult(data);
}

async function serverGetBalance(): Promise<number> {
  // Could be backed by session/wallet; keep a simple endpoint for now.
  const res = await fetch('/api/stake/balance');
  if (res.ok) {
    const data = await res.json();
    return Number(data?.balance ?? 0);
  }
  // fallback
  return 1000;
}

/** Mock fallback for local UI work. */
function mockPlay(bet: number): SpinResult {
  const symbols = Object.keys(SLOT_CONFIG.SYMBOLS);
  const board: string[] = Array.from({ length: SLOT_CONFIG.REELS * SLOT_CONFIG.ROWS }, () => {
    const i = Math.floor(Math.random() * symbols.length);
    return symbols[i];
  });

  // naive line evaluation
  const wins: SpinResult['wins'] = [];
  let totalWin = 0;
  for (const line of SLOT_CONFIG.PAYLINES) {
    const lineSyms = line.map((idx) => board[idx]);
    const first = lineSyms[0];
    let count = 1;
    for (let i = 1; i < lineSyms.length; i++) {
      if (lineSyms[i] === first) count++;
      else break;
    }
    const pay = SLOT_CONFIG.PAYTABLE[first]?.[count];
    if (pay) {
      const win = bet * pay;
      totalWin += win;
      wins.push({ symbol: first, kind: count, win, positions: line.slice(0, count) });
    }
  }

  return {
    board,
    payoutMultiplier: totalWin / Math.max(bet, 0.0001),
    events: [
      { index: 0, type: 'reveal', board },
      ...(wins.length ? [{ index: 1, type: 'win', totalWin, wins }] : [])
    ],
    totalWin,
    wins
  };
}

function mockGetBalance(): number {
  return 1000;
}

/** Normalizes various engine/server responses to our SpinResult */
function normalizeSpinResult(raw: any): SpinResult {
  // accept already-normalized
  if (raw?.board && Array.isArray(raw.board)) return raw as SpinResult;

  const events = Array.isArray(raw?.events) ? raw.events : [];
  const reveal = events.find((e: any) => e?.type === 'reveal');
  const winEvt = events.find((e: any) => e?.type === 'win');
  const board = reveal?.board ?? raw?.board ?? [];

  return {
    board,
    payoutMultiplier: Number(raw?.payoutMultiplier ?? (winEvt?.totalWin ?? 0) / Math.max(Number(raw?.bet ?? 1), 0.0001)),
    events,
    totalWin: Number(winEvt?.totalWin ?? raw?.totalWin ?? 0),
    wins: Array.isArray(winEvt?.wins) ? winEvt.wins : []
  };
}

export async function playSpin(bet: number): Promise<SpinResult> {
  if (MODE === 'engine') return enginePlay(bet);
  if (MODE === 'server') return serverPlay(bet);
  return Promise.resolve(mockPlay(bet));
}

export async function getBalance(): Promise<number> {
  if (MODE === 'engine') return engineGetBalance();
  if (MODE === 'server') return serverGetBalance();
  return Promise.resolve(mockGetBalance());
}
