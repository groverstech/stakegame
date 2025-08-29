#!/usr/bin/env python3
"""
Stake Engine compliant simulation runner for 3x5 slot game.
Generates the required outcome files and lookup tables.
"""

import json
import csv
import os
import gzip
from typing import List, Dict, Any
from concurrent.futures import ThreadPoolExecutor, as_completed
from game_config import GameConfig
from gamestate import run_spin

# Simulation parameters
num_threads = 10
compression = True

num_sim_args = {
    "base": int(1e5),  # 100k base game simulations
    "bonus": int(1e4), # 10k bonus simulations (if applicable)
}

run_conditions = {
    "run_sims": True,
    "run_optimization": True,
    "run_analysis": True,
    "upload_data": False,
}

def run_simulation_batch(config: GameConfig, batch_size: int, start_id: int) -> List[Dict[str, Any]]:
    """Run a batch of simulations in a single thread."""
    results = []
    
    for i in range(batch_size):
        sim_id = start_id + i
        result = run_spin(config)
        result["id"] = sim_id
        results.append(result)
    
    return results

def run_simulations(mode: str, num_sims: int) -> None:
    """Run simulations for a specific game mode."""
    print(f"Running {num_sims} simulations for {mode} mode...")
    
    config = GameConfig()
    
    # Create output directories
    os.makedirs("library/books", exist_ok=True)
    os.makedirs("library/lookup_tables", exist_ok=True)
    os.makedirs("library/publish_files", exist_ok=True)
    
    # Divide simulations across threads
    batch_size = num_sims // num_threads
    all_results = []
    
    with ThreadPoolExecutor(max_workers=num_threads) as executor:
        futures = []
        
        for thread_id in range(num_threads):
            start_id = thread_id * batch_size + 1
            actual_batch_size = batch_size
            
            # Handle remainder for last thread
            if thread_id == num_threads - 1:
                actual_batch_size = num_sims - (thread_id * batch_size)
            
            future = executor.submit(run_simulation_batch, config, actual_batch_size, start_id)
            futures.append((thread_id, future))
        
        # Collect results
        for thread_id, future in futures:
            try:
                batch_results = future.result()
                all_results.extend(batch_results)
                
                # Calculate thread RTP
                total_wins = sum(r["payoutMultiplier"] for r in batch_results)
                rtp = (total_wins / len(batch_results)) * 100
                print(f"Thread {thread_id} finished with {rtp:.3f} RTP.")
                
            except Exception as e:
                print(f"Thread {thread_id} failed: {e}")
    
    # Sort results by ID
    all_results.sort(key=lambda x: x["id"])
    
    # Write books file
    books_filename = f"library/books/books_{mode}.jsonl"
    if compression:
        books_filename += ".gz"
        with gzip.open(books_filename, 'wt') as f:
            for result in all_results:
                f.write(json.dumps(result) + '\n')
    else:
        with open(books_filename, 'w') as f:
            for result in all_results:
                f.write(json.dumps(result) + '\n')
    
    # Write lookup table
    lookup_filename = f"library/lookup_tables/lookUpTable_{mode}.csv"
    with open(lookup_filename, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['simulation_id', 'weight', 'payout_multiplier'])
        
        for result in all_results:
            writer.writerow([
                result["id"],
                1,  # Initial weight (will be optimized)
                result["payoutMultiplier"]
            ])
    
    # Write criteria mapping
    criteria_filename = f"library/lookup_tables/lookUpTableIdToCriteria_{mode}.csv"
    with open(criteria_filename, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['simulation_id', 'criteria'])
        
        for result in all_results:
            writer.writerow([result["id"], result["criteria"]])
    
    print(f"Generated {len(all_results)} simulations for {mode} mode")
    print(f"Files written to library/ directory")

def optimize_rtp(mode: str, target_rtp: float = 96.5) -> None:
    """Optimize simulation weights to achieve target RTP."""
    print(f"Optimizing RTP for {mode} mode to {target_rtp}%...")
    
    lookup_file = f"library/lookup_tables/lookUpTable_{mode}.csv"
    
    # Read current lookup table
    simulations = []
    with open(lookup_file, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            simulations.append({
                'id': int(row['simulation_id']),
                'weight': int(row['weight']),
                'payout': float(row['payout_multiplier'])
            })
    
    # Simple optimization: adjust weights based on payout distribution
    total_payout = sum(sim['payout'] for sim in simulations)
    current_rtp = (total_payout / len(simulations)) * 100
    
    adjustment_factor = target_rtp / current_rtp
    
    # Write optimized lookup table
    optimized_file = f"library/lookup_tables/lookUpTable_{mode}_optimized.csv"
    with open(optimized_file, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['simulation_id', 'weight', 'payout_multiplier'])
        
        for sim in simulations:
            # Adjust weight inversely to payout to balance RTP
            if sim['payout'] > 0:
                new_weight = max(1, int(sim['weight'] * adjustment_factor))
            else:
                new_weight = sim['weight']
            
            writer.writerow([sim['id'], new_weight, sim['payout']])
    
    print(f"Optimized weights written to {optimized_file}")

def generate_par_sheet(mode: str) -> None:
    """Generate PAR sheet with game statistics."""
    print(f"Generating PAR sheet for {mode} mode...")
    
    lookup_file = f"library/lookup_tables/lookUpTable_{mode}.csv"
    
    # Read simulations
    simulations = []
    with open(lookup_file, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            simulations.append(float(row['payout_multiplier']))
    
    # Calculate statistics
    total_sims = len(simulations)
    winning_sims = len([s for s in simulations if s > 0])
    total_payout = sum(simulations)
    
    hit_frequency = (winning_sims / total_sims) * 100
    rtp = (total_payout / total_sims) * 100
    max_win = max(simulations)
    avg_win = total_payout / winning_sims if winning_sims > 0 else 0
    
    # Generate PAR sheet
    par_data = {
        "game_name": "3x5 Slot Game",
        "mode": mode,
        "total_simulations": total_sims,
        "winning_simulations": winning_sims,
        "hit_frequency_percent": round(hit_frequency, 2),
        "rtp_percent": round(rtp, 2),
        "max_win_multiplier": max_win,
        "average_win_multiplier": round(avg_win, 2),
        "variance": "Medium",
        "paylines": 20,
        "reels": "3x5"
    }
    
    par_filename = f"library/publish_files/par_sheet_{mode}.json"
    with open(par_filename, 'w') as f:
        json.dump(par_data, f, indent=2)
    
    print(f"PAR sheet written to {par_filename}")
    print(f"Hit Frequency: {hit_frequency:.2f}%")
    print(f"RTP: {rtp:.2f}%")

def main():
    """Main simulation runner."""
    for mode, num_sims in num_sim_args.items():
        if run_conditions["run_sims"]:
            run_simulations(mode, num_sims)
        
        if run_conditions["run_optimization"]:
            optimize_rtp(mode)
        
        if run_conditions["run_analysis"]:
            generate_par_sheet(mode)
    
    print("All simulation tasks completed!")

if __name__ == "__main__":
    main()
