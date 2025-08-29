from typing import Dict, List, Any

class GameConfig:
    """Configuration class for 3x5 slot game."""
    
    def __init__(self):
        self.reels = 5
        self.rows = 3
        self.total_positions = self.reels * self.rows
        
        # Symbol definitions - Market Surge theme
        self.symbols = ['BULL', 'BEAR', 'GOLD', 'OIL', 'CHART', 'COIN', 'SURGE', 'NEWS', 'IPO']
        
        # Paytable: symbol -> {count: payout_multiplier}
        self.paytable = {
            'BULL': {3: 5, 4: 25, 5: 100},     # Bull market - highest paying
            'BEAR': {3: 4, 4: 20, 5: 80},      # Bear market
            'GOLD': {3: 4, 4: 18, 5: 75},      # Gold commodity
            'OIL': {3: 3, 4: 15, 5: 60},       # Oil commodity
            'CHART': {3: 3, 4: 12, 5: 50},     # Trading chart
            'COIN': {3: 2, 4: 10, 5: 40},      # Cryptocurrency
            'SURGE': {3: 10, 4: 50, 5: 200},   # Market Surge WILD
            'NEWS': {3: 2, 4: 5, 5: 50},       # Market News SCATTER
            'IPO': {3: 0, 4: 0, 5: 0}          # IPO Launch BONUS
        }
        
        # Paylines (20 lines for 3x5 grid)
        # Positions numbered 0-14: 0,1,2 = reel1, 3,4,5 = reel2, etc.
        self.paylines = [
            # Horizontal lines
            [0, 3, 6, 9, 12],   # Top row
            [1, 4, 7, 10, 13],  # Middle row
            [2, 5, 8, 11, 14],  # Bottom row
            
            # Diagonal lines
            [0, 4, 8, 10, 12],  # Top-left to bottom-right zigzag
            [2, 4, 6, 10, 14],  # Bottom-left to top-right zigzag
            
            # V-shapes and patterns
            [0, 4, 6, 10, 12],  # V-shape down
            [2, 4, 8, 10, 14],  # V-shape up
            [1, 3, 7, 9, 13],   # Up-down pattern
            [1, 5, 7, 11, 13],  # Down-up pattern
            [0, 3, 7, 11, 14],  # Zigzag pattern 1
            [2, 5, 7, 9, 12],   # Zigzag pattern 2
            [0, 5, 6, 11, 12],  # W-shape
            [2, 3, 8, 9, 14],   # M-shape
            [1, 3, 6, 11, 13],  # Complex zigzag 1
            [1, 5, 8, 9, 13],   # Complex zigzag 2
            [0, 4, 7, 9, 14],   # Diamond pattern 1
            [2, 4, 7, 11, 12],  # Diamond pattern 2
            [1, 4, 6, 9, 13],   # X-pattern 1
            [1, 4, 8, 11, 13],  # X-pattern 2
            [0, 5, 7, 10, 14]   # Final complex pattern
        ]
        
        # Reel strips (symbol distribution on each reel) - Market themed
        self.reel_strips = [
            # Reel 1 - Higher chance of starting symbols
            ['BULL', 'BEAR', 'GOLD', 'OIL', 'CHART', 'COIN', 'BULL', 'BEAR', 'GOLD', 'OIL', 'CHART', 'COIN', 'SURGE', 'NEWS', 'IPO'] * 3,
            
            # Reel 2 - Balanced distribution
            ['BULL', 'BEAR', 'GOLD', 'OIL', 'CHART', 'COIN', 'BULL', 'BEAR', 'GOLD', 'OIL', 'CHART', 'COIN', 'SURGE', 'NEWS'] * 3,
            
            # Reel 3 - Balanced distribution
            ['BULL', 'BEAR', 'GOLD', 'OIL', 'CHART', 'COIN', 'BULL', 'BEAR', 'GOLD', 'OIL', 'CHART', 'COIN', 'SURGE', 'NEWS'] * 3,
            
            # Reel 4 - Balanced distribution
            ['BULL', 'BEAR', 'GOLD', 'OIL', 'CHART', 'COIN', 'BULL', 'BEAR', 'GOLD', 'OIL', 'CHART', 'COIN', 'SURGE', 'NEWS'] * 3,
            
            # Reel 5 - Lower chance of completing lines
            ['BULL', 'BEAR', 'GOLD', 'OIL', 'CHART', 'COIN', 'BEAR', 'GOLD', 'OIL', 'CHART', 'COIN', 'SURGE'] * 3
        ]
        
        # Game settings
        self.target_rtp = 96.5
        self.min_bet = 0.1
        self.max_bet = 100.0
        self.max_win_multiplier = 1000
        
        # Special features
        self.wild_substitutes = True
        self.scatter_pays_any = True
        self.bonus_trigger_count = 3
