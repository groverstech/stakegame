export const SLOT_CONFIG = {
  REELS: 5,
  ROWS: 3,
  PAYLINES: [
    // Horizonatal lines
    [0, 3, 6, 9, 12],   // Top row
    [1, 4, 7, 10, 13],  // Middle row
    [2, 5, 8, 11, 14],  // Bottom row
    
    // Diagonal lines
    [0, 4, 8, 10, 12],  // Top-left to bottom-right zigzag
    [2, 4, 6, 10, 14],  // Bottom-left to top-right zigzag
    
    // V-shapes
    [0, 4, 6, 10, 12],  // V-shape down
    [2, 4, 8, 10, 14],  // V-shape up
    
    // More complex patterns
    [1, 3, 7, 9, 13],   // Up-down pattern
    [1, 5, 7, 11, 13],  // Down-up pattern
    [0, 3, 7, 11, 14],  // Zigzag pattern 1
    [2, 5, 7, 9, 12],   // Zigzag pattern 2
    [0, 5, 6, 11, 12],  // W-shape
    [2, 3, 8, 9, 14],   // M-shape
    [1, 3, 6, 11, 13],  // Complex zigzag 1
    [1, 5, 8, 9, 13],   // Complex zigzag 2
    [0, 4, 7, 9, 14],   // Diamond pattern 1
    [2, 4, 7, 11, 12],  // Diamond pattern 2
    [1, 4, 6, 9, 13],   // X-pattern 1
    [1, 4, 8, 11, 13],  // X-pattern 2
    [0, 5, 7, 10, 14]   // Final complex pattern
  ],
  
  PAYTABLE: {
    'BULL': { 3: 5, 4: 25, 5: 100 },      // Bull market - highest paying
    'BEAR': { 3: 4, 4: 20, 5: 80 },       // Bear market
    'GOLD': { 3: 4, 4: 18, 5: 75 },       // Gold commodity
    'OIL': { 3: 3, 4: 15, 5: 60 },        // Oil commodity
    'CHART': { 3: 3, 4: 12, 5: 50 },      // Trading chart
    'COIN': { 3: 2, 4: 10, 5: 40 },       // Cryptocurrency
    'SURGE': { 3: 10, 4: 50, 5: 200 },    // Market Surge WILD
    'NEWS': { 3: 2, 4: 5, 5: 50 },        // Market News SCATTER
    'IPO': { 3: 0, 4: 0, 5: 0 }           // IPO Launch BONUS
  },
  
  RTP: 96.5,
  MAX_WIN_MULTIPLIER: 1000,
  MIN_BET: 0.1,
  MAX_BET: 100
};
