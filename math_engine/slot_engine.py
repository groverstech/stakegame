#!/usr/bin/env python3
"""
Main slot engine interface for Stake Engine compliance.
Handles game requests and returns properly formatted responses.
"""

import sys
import json
import os
from pathlib import Path

# Add the games directory to path
sys.path.append(str(Path(__file__).parent.parent / "games" / "slot_3x5"))

from gamestate import run_spin
from game_config import GameConfig

def handle_play_request(bet_amount: float) -> dict:
    """
    Handle a play request and return Stake Engine compatible response.
    
    Args:
        bet_amount: The bet amount for this spin
    
    Returns:
        Dictionary containing game result in Stake Engine format
    """
    try:
        config = GameConfig()
        
        # Validate bet amount
        if bet_amount < config.min_bet or bet_amount > config.max_bet:
            raise ValueError(f"Bet amount must be between {config.min_bet} and {config.max_bet}")
        
        # Run the spin
        result = run_spin(config)
        
        # Scale payout by bet amount
        scaled_payout = result["payoutMultiplier"] * bet_amount
        
        # Update events with scaled amounts
        for event in result["events"]:
            if event["type"] == "winInfo":
                event["totalWin"] = scaled_payout
                for win in event["wins"]:
                    win["win"] = win["win"] * bet_amount
            
            elif event["type"] in ["setWin", "setTotalWin", "finalWin"]:
                event["amount"] = scaled_payout
        
        # Update payout multiplier to actual win amount
        result["payoutMultiplier"] = scaled_payout
        result["baseGameWins"] = scaled_payout
        
        return result
        
    except Exception as e:
        return {
            "error": str(e),
            "id": 0,
            "payoutMultiplier": 0,
            "events": [],
            "criteria": "error",
            "baseGameWins": 0.0,
            "freeGameWins": 0.0
        }

def main():
    """Main entry point for the slot engine."""
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No command specified"}))
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "play":
        bet_amount = float(sys.argv[2]) if len(sys.argv) > 2 else 1.0
        result = handle_play_request(bet_amount)
        print(json.dumps(result))
        
    elif command == "config":
        config = GameConfig()
        config_data = {
            "reels": config.reels,
            "rows": config.rows,
            "paylines": len(config.paylines),
            "symbols": config.symbols,
            "target_rtp": config.target_rtp,
            "min_bet": config.min_bet,
            "max_bet": config.max_bet,
            "max_win_multiplier": config.max_win_multiplier
        }
        print(json.dumps(config_data))
        
    else:
        print(json.dumps({"error": f"Unknown command: {command}"}))
        sys.exit(1)

if __name__ == "__main__":
    main()
