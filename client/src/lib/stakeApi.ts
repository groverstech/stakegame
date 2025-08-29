import { SLOT_CONFIG } from './slotConfig';

interface StakeApiResponse {
  id: number;
  payoutMultiplier: number;
  events: Array<{
    index: number;
    type: string;
    board?: string[];
    totalWin?: number;
    wins?: Array<{
      symbol: string;
      kind: number;
      win: number;
      positions: number[];
    }>;
    amount?: number;
    winLevel?: number;
  }>;
}

// Mock Stake Engine API response for development
const generateMockResponse = (): StakeApiResponse => {
  const symbols = ['BULL', 'BEAR', 'GOLD', 'OIL', 'CHART', 'COIN', 'SURGE', 'NEWS', 'IPO'];
  const board: string[] = [];
  
  // Generate random board
  for (let i = 0; i < SLOT_CONFIG.REELS * SLOT_CONFIG.ROWS; i++) {
    board.push(symbols[Math.floor(Math.random() * symbols.length)]);
  }
  
  // Calculate wins
  const wins: any[] = [];
  let totalWin = 0;
  
  // Simple win detection for mock
  SLOT_CONFIG.PAYLINES.slice(0, 5).forEach((payline, lineIndex) => {
    const lineSymbols = payline.map(pos => board[pos]);
    const firstSymbol = lineSymbols[0];
    
    if (Math.random() < 0.1 && firstSymbol !== 'SURGE' && firstSymbol !== 'NEWS') {
      const count = 3;
      const payout = (SLOT_CONFIG.PAYTABLE as any)[firstSymbol]?.[count] || 0;
      
      if (payout > 0) {
        wins.push({
          symbol: firstSymbol,
          kind: count,
          win: payout,
          positions: payline.slice(0, count)
        });
        totalWin += payout;
      }
    }
  });
  
  const events = [
    {
      index: 0,
      type: "reveal",
      board,
      gameType: "basegame"
    }
  ];
  
  if (totalWin > 0) {
    events.push({
      index: 1,
      type: "winInfo",
      totalWin,
      wins
    } as any);
    
    events.push({
      index: 2,
      type: "setWin",
      amount: totalWin,
      winLevel: totalWin > 50 ? 3 : totalWin > 20 ? 2 : 1
    } as any);
  }
  
  return {
    id: Math.floor(Math.random() * 1000000),
    payoutMultiplier: totalWin,
    events
  };
};

export const stakeApiPlay = async (): Promise<{ board: string[]; payoutMultiplier: number; events: any[]; totalWin: number } | null> => {
  try {
    // In production, this would call the actual Stake Engine API
    // const response = await fetch('/api/stake/play', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ bet: betAmount })
    // });
    
    // For development, use mock response
    const mockResponse = generateMockResponse();
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const revealEvent = mockResponse.events.find(e => e.type === 'reveal');
    const winEvent = mockResponse.events.find(e => e.type === 'winInfo');
    
    return {
      board: revealEvent?.board || [],
      payoutMultiplier: mockResponse.payoutMultiplier,
      events: mockResponse.events,
      totalWin: winEvent?.totalWin || 0
    };
  } catch (error) {
    console.error('Stake API call failed:', error);
    return null;
  }
};

export const stakeApiGetBalance = async (): Promise<number> => {
  // Mock balance endpoint
  return 1000;
};
