import random
import json
from typing import Dict, List, Any
from game_config import GameConfig
from paylines import check_paylines

def run_spin(config: GameConfig) -> Dict[str, Any]:
    """
    Main game logic function required by Stake Engine.
    Generates a single spin result with all events.
    """
    
    # Generate random board
    board = generate_board(config)
    
    # Check for wins
    wins = check_paylines(board, config.paylines, config.paytable)
    
    # Calculate total win
    total_win = sum(win['payout'] for win in wins)
    
    # Generate events for Stake Engine
    events = []
    
    # Reveal event - shows the board symbols
    events.append({
        "index": 0,
        "type": "reveal",
        "board": board,
        "paddingPositions": [],
        "gameType": "basegame",
        "anticipation": []
    })
    
    # Win info event - if there are wins
    if wins:
        win_info = {
            "index": 1,
            "type": "winInfo",
            "totalWin": total_win,
            "wins": [
                {
                    "symbol": win['symbol'],
                    "kind": win['count'],
                    "win": win['payout'],
                    "positions": win['positions'],
                    "meta": {}
                } for win in wins
            ]
        }
        events.append(win_info)
        
        # Set win event
        events.append({
            "index": 2,
            "type": "setWin",
            "amount": total_win,
            "winLevel": get_win_level(total_win)
        })
        
        # Total win event
        events.append({
            "index": 3,
            "type": "setTotalWin",
            "amount": total_win
        })
        
        # Final win event
        events.append({
            "index": 4,
            "type": "finalWin",
            "amount": total_win
        })
    
    # Return game result
    result = {
        "id": random.randint(1, 1000000),
        "payoutMultiplier": total_win,
        "events": events,
        "criteria": "basegame",
        "baseGameWins": total_win / 100.0,  # Normalized win amount
        "freeGameWins": 0.0
    }
    
    return result

def generate_board(config: GameConfig) -> List[str]:
    """Generate a random 3x5 slot board."""
    board = []
    
    for reel in range(config.reels):
        reel_symbols = config.reel_strips[reel]
        # Pick random position on reel strip
        start_pos = random.randint(0, len(reel_symbols) - config.rows)
        
        # Take consecutive symbols for this reel
        for row in range(config.rows):
            symbol = reel_symbols[(start_pos + row) % len(reel_symbols)]
            board.append(symbol)
    
    return board

def get_win_level(win_amount: float) -> int:
    """Determine win level for animation purposes."""
    if win_amount == 0:
        return 0
    elif win_amount < 10:
        return 1
    elif win_amount < 50:
        return 2
    elif win_amount < 100:
        return 3
    else:
        return 4

if __name__ == "__main__":
    # Test the game logic
    config = GameConfig()
    result = run_spin(config)
    print(json.dumps(result, indent=2))
