#!/usr/bin/env python3
"""
Outcome generator for Stake Engine compliance.
Generates pre-calculated outcomes and lookup tables.
"""

import sys
import json
import csv
import gzip
import os
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import List, Dict, Any

# Add the games directory to path
sys.path.append(str(Path(__file__).parent.parent / "games" / "slot_3x5"))

from gamestate import run_spin
from game_config import GameConfig

def generate_outcomes(num_simulations: int, output_dir: str = "library") -> None:
    """
    Generate pre-calculated outcomes for Stake Engine.
    
    Args:
        num_simulations: Number of simulations to generate
        output_dir: Directory to store output files
    """
    print(f"Generating {num_simulations} outcomes...")
    
    config = GameConfig()
    
    # Create output directories
    books_dir = Path(output_dir) / "books"
    lookup_dir = Path(output_dir) / "lookup_tables"
    publish_dir = Path(output_dir) / "publish_files"
    
    books_dir.mkdir(parents=True, exist_ok=True)
    lookup_dir.mkdir(parents=True, exist_ok=True)
    publish_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate outcomes
    outcomes = []
    lookup_data = []
    
    for sim_id in range(1, num_simulations + 1):
        result = run_spin(config)
        result["id"] = sim_id
        
        outcomes.append(result)
        lookup_data.append({
            "simulation_id": sim_id,
            "weight": 1,  # Initial weight, will be optimized
            "payout_multiplier": result["payoutMultiplier"],
            "criteria": result["criteria"]
        })
        
        if sim_id % 1000 == 0:
            print(f"Generated {sim_id} outcomes...")
    
    # Write books file (compressed)
    books_file = books_dir / "books_base.jsonl.gz"
    with gzip.open(books_file, 'wt') as f:
        for outcome in outcomes:
            f.write(json.dumps(outcome) + '\n')
    
    print(f"Written books file: {books_file}")
    
    # Write lookup table
    lookup_file = lookup_dir / "lookUpTable_base.csv"
    with open(lookup_file, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['simulation_id', 'weight', 'payout_multiplier'])
        
        for data in lookup_data:
            writer.writerow([
                data["simulation_id"],
                data["weight"],
                data["payout_multiplier"]
            ])
    
    print(f"Written lookup table: {lookup_file}")
    
    # Write criteria mapping
    criteria_file = lookup_dir / "lookUpTableIdToCriteria_base.csv"
    with open(criteria_file, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['simulation_id', 'criteria'])
        
        for data in lookup_data:
            writer.writerow([data["simulation_id"], data["criteria"]])
    
    print(f"Written criteria mapping: {criteria_file}")
    
    # Generate statistics
    total_payout = sum(data["payout_multiplier"] for data in lookup_data)
    winning_outcomes = len([d for d in lookup_data if d["payout_multiplier"] > 0])
    
    rtp = (total_payout / num_simulations) * 100
    hit_frequency = (winning_outcomes / num_simulations) * 100
    
    # Write index file
    index_data = {
        "game_name": "3x5 Slot Game",
        "version": "1.0",
        "total_simulations": num_simulations,
        "rtp_percent": round(rtp, 2),
        "hit_frequency_percent": round(hit_frequency, 2),
        "files": {
            "books": "books/books_base.jsonl.gz",
            "lookup_table": "lookup_tables/lookUpTable_base.csv",
            "criteria_mapping": "lookup_tables/lookUpTableIdToCriteria_base.csv"
        },
        "config": {
            "reels": config.reels,
            "rows": config.rows,
            "paylines": len(config.paylines),
            "symbols": config.symbols,
            "target_rtp": config.target_rtp
        }
    }
    
    index_file = publish_dir / "index.json"
    with open(index_file, 'w') as f:
        json.dump(index_data, f, indent=2)
    
    print(f"Written index file: {index_file}")
    print(f"Statistics:")
    print(f"  RTP: {rtp:.2f}%")
    print(f"  Hit Frequency: {hit_frequency:.2f}%")
    print(f"  Total Outcomes: {num_simulations}")
    print(f"  Winning Outcomes: {winning_outcomes}")

def main():
    """Main entry point for outcome generation."""
    if len(sys.argv) < 2:
        print("Usage: python outcome_generator.py <num_simulations>")
        sys.exit(1)
    
    try:
        num_simulations = int(sys.argv[1])
        generate_outcomes(num_simulations)
        print("Outcome generation completed successfully!")
        
    except ValueError:
        print("Error: num_simulations must be an integer")
        sys.exit(1)
    except Exception as e:
        print(f"Error generating outcomes: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
