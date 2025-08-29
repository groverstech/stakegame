#!/usr/bin/env python3
"""
RTP Calculator and Optimizer for Stake Engine compliance.
Analyzes game statistics and optimizes weights to achieve target RTP.
"""

import csv
import json
import sys
from pathlib import Path
from typing import Dict, List, Tuple

def load_lookup_table(file_path: str) -> List[Dict]:
    """Load simulation data from lookup table CSV."""
    data = []
    with open(file_path, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            data.append({
                'id': int(row['simulation_id']),
                'weight': int(row['weight']),
                'payout': float(row['payout_multiplier'])
            })
    return data

def calculate_rtp(simulations: List[Dict]) -> Tuple[float, Dict]:
    """Calculate current RTP and statistics."""
    total_weight = sum(sim['weight'] for sim in simulations)
    weighted_payout = sum(sim['payout'] * sim['weight'] for sim in simulations)
    
    if total_weight == 0:
        return 0.0, {}
    
    rtp = (weighted_payout / total_weight) * 100
    
    # Calculate additional statistics
    winning_sims = [sim for sim in simulations if sim['payout'] > 0]
    total_wins = sum(sim['weight'] for sim in winning_sims)
    hit_frequency = (total_wins / total_weight) * 100 if total_weight > 0 else 0
    
    max_win = max(sim['payout'] for sim in simulations) if simulations else 0
    avg_win = weighted_payout / total_wins if total_wins > 0 else 0
    
    stats = {
        'rtp': rtp,
        'hit_frequency': hit_frequency,
        'max_win': max_win,
        'average_win': avg_win,
        'total_simulations': len(simulations),
        'winning_simulations': len(winning_sims),
        'total_weight': total_weight
    }
    
    return rtp, stats

def optimize_weights(simulations: List[Dict], target_rtp: float, max_iterations: int = 100) -> List[Dict]:
    """Optimize simulation weights to achieve target RTP."""
    print(f"Optimizing weights for target RTP: {target_rtp}%")
    
    # Create a copy to work with
    optimized = [sim.copy() for sim in simulations]
    
    for iteration in range(max_iterations):
        current_rtp, _ = calculate_rtp(optimized)
        
        if abs(current_rtp - target_rtp) < 0.1:
            print(f"Target RTP achieved in {iteration} iterations")
            break
        
        # Adjust weights based on payout distribution
        adjustment_factor = target_rtp / current_rtp if current_rtp > 0 else 1.0
        
        for sim in optimized:
            if sim['payout'] == 0:
                # Increase weight for non-winning outcomes if RTP is too high
                if current_rtp > target_rtp:
                    sim['weight'] = max(1, int(sim['weight'] * 1.1))
            else:
                # Adjust winning outcomes based on their payout
                if current_rtp < target_rtp:
                    # Need to increase RTP - boost winning weights
                    sim['weight'] = max(1, int(sim['weight'] * adjustment_factor))
                else:
                    # Need to decrease RTP - reduce winning weights
                    sim['weight'] = max(1, int(sim['weight'] / adjustment_factor))
        
        if iteration % 10 == 0:
            print(f"Iteration {iteration}: RTP = {current_rtp:.2f}%")
    
    final_rtp, final_stats = calculate_rtp(optimized)
    print(f"Final RTP: {final_rtp:.2f}%")
    print(f"Hit Frequency: {final_stats['hit_frequency']:.2f}%")
    
    return optimized

def save_optimized_table(optimized_data: List[Dict], output_file: str) -> None:
    """Save optimized lookup table to CSV."""
    with open(output_file, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['simulation_id', 'weight', 'payout_multiplier'])
        
        for sim in optimized_data:
            writer.writerow([sim['id'], sim['weight'], sim['payout']])

def generate_par_sheet(simulations: List[Dict], output_file: str) -> None:
    """Generate PAR sheet with detailed game statistics."""
    rtp, stats = calculate_rtp(simulations)
    
    # Calculate payout distribution
    payout_ranges = {
        '0x': 0,
        '1-10x': 0,
        '11-50x': 0,
        '51-100x': 0,
        '100x+': 0
    }
    
    for sim in simulations:
        payout = sim['payout']
        weight = sim['weight']
        
        if payout == 0:
            payout_ranges['0x'] += weight
        elif payout <= 10:
            payout_ranges['1-10x'] += weight
        elif payout <= 50:
            payout_ranges['11-50x'] += weight
        elif payout <= 100:
            payout_ranges['51-100x'] += weight
        else:
            payout_ranges['100x+'] += weight
    
    # Convert to percentages
    total_weight = stats['total_weight']
    for range_key in payout_ranges:
        payout_ranges[range_key] = (payout_ranges[range_key] / total_weight) * 100
    
    par_data = {
        "game_info": {
            "name": "3x5 Slot Game",
            "version": "1.0",
            "type": "Video Slot",
            "reels": "3x5",
            "paylines": 20
        },
        "mathematics": {
            "rtp_percent": round(rtp, 2),
            "hit_frequency_percent": round(stats['hit_frequency'], 2),
            "volatility": "Medium",
            "max_win_multiplier": stats['max_win'],
            "average_win_multiplier": round(stats['average_win'], 2)
        },
        "simulation_data": {
            "total_simulations": stats['total_simulations'],
            "winning_simulations": stats['winning_simulations'],
            "total_weight": stats['total_weight']
        },
        "payout_distribution": {
            "no_win_percent": round(payout_ranges['0x'], 2),
            "small_win_1_10x_percent": round(payout_ranges['1-10x'], 2),
            "medium_win_11_50x_percent": round(payout_ranges['11-50x'], 2),
            "large_win_51_100x_percent": round(payout_ranges['51-100x'], 2),
            "mega_win_100x_plus_percent": round(payout_ranges['100x+'], 2)
        }
    }
    
    with open(output_file, 'w') as f:
        json.dump(par_data, f, indent=2)
    
    print(f"PAR sheet saved to: {output_file}")

def main():
    """Main entry point for RTP calculation and optimization."""
    if len(sys.argv) < 2:
        print("Usage: python rtp_calculator.py <lookup_table_file> [target_rtp]")
        sys.exit(1)
    
    lookup_file = sys.argv[1]
    target_rtp = float(sys.argv[2]) if len(sys.argv) > 2 else 96.5
    
    if not Path(lookup_file).exists():
        print(f"Error: Lookup table file not found: {lookup_file}")
        sys.exit(1)
    
    try:
        # Load simulation data
        simulations = load_lookup_table(lookup_file)
        print(f"Loaded {len(simulations)} simulations from {lookup_file}")
        
        # Calculate current RTP
        current_rtp, current_stats = calculate_rtp(simulations)
        print(f"Current RTP: {current_rtp:.2f}%")
        print(f"Current Hit Frequency: {current_stats['hit_frequency']:.2f}%")
        
        # Optimize if needed
        if abs(current_rtp - target_rtp) > 0.1:
            optimized_simulations = optimize_weights(simulations, target_rtp)
            
            # Save optimized table
            output_file = lookup_file.replace('.csv', '_optimized.csv')
            save_optimized_table(optimized_simulations, output_file)
            print(f"Optimized lookup table saved to: {output_file}")
            
            # Generate PAR sheet with optimized data
            par_file = lookup_file.replace('.csv', '_par_sheet.json')
            generate_par_sheet(optimized_simulations, par_file)
        else:
            print("RTP is already within target range, no optimization needed")
            
            # Generate PAR sheet with current data
            par_file = lookup_file.replace('.csv', '_par_sheet.json')
            generate_par_sheet(simulations, par_file)
        
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
