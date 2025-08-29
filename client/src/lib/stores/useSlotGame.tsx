import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { SLOT_CONFIG } from '../slotConfig';
import { playSpin } from '../engineAdapter';

interface SpinResult {
  board: string[];
  payoutMultiplier: number;
  events: any[];
  totalWin: number;
  wins: any[];
}

interface SlotGameState {
  balance: number;
  totalWin: number;
  isSpinning: boolean;
  shouldSpin: boolean;
  currentBoard: string[];
  lastResult: SpinResult | null;
  gamePhase: 'idle' | 'spinning' | 'showing_result';
  
  // Actions
  initializeGame: () => void;
  requestSpin: (betAmount: number) => void;
  spin: () => Promise<SpinResult | null>;
  updateReels: (board: string[]) => void;
  checkWins: (board: string[]) => any[];
  setSpinning: (spinning: boolean) => void;
  addWin: (amount: number) => void;
  resetWin: () => void;
}

const generateRandomBoard = (): string[] => {
  const symbols = ['BULL', 'BEAR', 'GOLD', 'OIL', 'CHART', 'COIN', 'SURGE', 'NEWS', 'IPO'];
  const board: string[] = [];
  
  for (let i = 0; i < SLOT_CONFIG.REELS * SLOT_CONFIG.ROWS; i++) {
    board.push(symbols[Math.floor(Math.random() * symbols.length)]);
  }
  
  return board;
};

const checkWinningLines = (board: string[]): any[] => {
  const wins: any[] = [];
  
  // Check each payline
  SLOT_CONFIG.PAYLINES.forEach((payline, lineIndex) => {
    const lineSymbols = payline.map(pos => board[pos]);
    const firstSymbol = lineSymbols[0];
    
    if (firstSymbol === 'SURGE' || firstSymbol === 'NEWS') return;
    
    let consecutiveCount = 1;
    const positions = [payline[0]];
    
    for (let i = 1; i < lineSymbols.length; i++) {
      if (lineSymbols[i] === firstSymbol || lineSymbols[i] === 'SURGE') {
        consecutiveCount++;
        positions.push(payline[i]);
      } else {
        break;
      }
    }
    
    if (consecutiveCount >= 3) {
      const payout = (SLOT_CONFIG.PAYTABLE as any)[firstSymbol]?.[consecutiveCount] || 0;
      if (payout > 0) {
        wins.push({
          symbol: firstSymbol,
          count: consecutiveCount,
          payout,
          positions,
          line: lineIndex
        });
      }
    }
  });
  
  return wins;
};

export const useSlotGame = create<SlotGameState>()(
  subscribeWithSelector((set, get) => ({
    balance: 1000,
    totalWin: 0,
    isSpinning: false,
    shouldSpin: false,
    currentBoard: generateRandomBoard(),
    lastResult: null,
    gamePhase: 'idle',

    initializeGame: () => {
      set({
        balance: 1000,
        totalWin: 0,
        isSpinning: false,
        shouldSpin: false,
        currentBoard: generateRandomBoard(),
        gamePhase: 'idle'
      });
    },

    requestSpin: (betAmount: number) => {
      const state = get();
      if (state.isSpinning || state.balance < betAmount) return;
      
      set({
        balance: state.balance - betAmount,
        shouldSpin: true,
        totalWin: 0,
        gamePhase: 'spinning'
      });
    },

    spin: async (): Promise<SpinResult | null> => {
      try {
        // Call Stake Engine API (or mock for development)
        const result = await playSpin();
        
        if (result) {
          const wins = checkWinningLines(result.board);
          const totalWin = wins.reduce((sum, win) => sum + win.payout, 0);
          
          const spinResult: SpinResult = {
            ...result,
            wins,
            totalWin
          };
          
          set(state => ({
            lastResult: spinResult,
            currentBoard: result.board,
            totalWin,
            balance: state.balance + totalWin,
            shouldSpin: false,
            gamePhase: 'showing_result'
          }));
          
          // Reset to idle after showing result
          setTimeout(() => {
            set({ gamePhase: 'idle', totalWin: 0 });
          }, 3000);
          
          return spinResult;
        }
      } catch (error) {
        console.error('Spin failed:', error);
        set({
          shouldSpin: false,
          gamePhase: 'idle'
        });
      }
      
      return null;
    },

    updateReels: (board: string[]) => {
      set({ currentBoard: board });
    },

    checkWins: (board: string[]) => {
      return checkWinningLines(board);
    },

    setSpinning: (spinning: boolean) => {
      set({ isSpinning: spinning });
    },

    addWin: (amount: number) => {
      set(state => ({
        totalWin: state.totalWin + amount,
        balance: state.balance + amount
      }));
    },

    resetWin: () => {
      set({ totalWin: 0 });
    }
  }))
);
