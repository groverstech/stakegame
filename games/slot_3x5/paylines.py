from typing import List, Dict, Any, Tuple

def check_paylines(board: List[str], paylines: List[List[int]], paytable: Dict[str, Dict[int, float]]) -> List[Dict[str, Any]]:
    """
    Check all paylines for winning combinations.
    
    Args:
        board: List of symbols representing the game board
        paylines: List of payline definitions (position indices)
        paytable: Payout table for symbol combinations
    
    Returns:
        List of winning combinations with details
    """
    wins = []
    
    for line_index, payline in enumerate(paylines):
        win = check_single_payline(board, payline, paytable, line_index)
        if win:
            wins.append(win)
    
    return wins

def check_single_payline(board: List[str], payline: List[int], paytable: Dict[str, Dict[int, float]], line_index: int) -> Dict[str, Any] | None:
    """
    Check a single payline for winning combinations.
    
    Args:
        board: List of symbols representing the game board
        payline: Single payline definition (position indices)
        paytable: Payout table for symbol combinations
        line_index: Index of the payline being checked
    
    Returns:
        Win details if there's a winning combination, None otherwise
    """
    line_symbols = [board[pos] for pos in payline]
    first_symbol = line_symbols[0]
    
    # Skip if first symbol is special (handled separately)
    if first_symbol in ['NEWS', 'IPO']:
        return None
    
    # Check for consecutive matching symbols (including WILD substitution)
    consecutive_count = 1
    winning_positions = [payline[0]]
    
    for i in range(1, len(line_symbols)):
        current_symbol = line_symbols[i]
        
        # SURGE can substitute for any symbol except NEWS/IPO
        if current_symbol == first_symbol or current_symbol == 'SURGE' or (first_symbol == 'SURGE' and current_symbol not in ['NEWS', 'IPO']):
            consecutive_count += 1
            winning_positions.append(payline[i])
            
            # If first symbol was SURGE, update to actual symbol
            if first_symbol == 'SURGE' and current_symbol != 'SURGE':
                first_symbol = current_symbol
        else:
            break
    
    # Check if we have a winning combination (minimum 3 symbols)
    if consecutive_count >= 3:
        symbol_paytable = paytable.get(first_symbol, {})
        payout = symbol_paytable.get(consecutive_count, 0)
        
        if payout > 0:
            return {
                'symbol': first_symbol,
                'count': consecutive_count,
                'payout': payout,
                'positions': winning_positions,
                'line': line_index,
                'line_positions': payline[:consecutive_count]
            }
    
    return None

def check_scatter_wins(board: List[str], paytable: Dict[str, Dict[int, float]]) -> List[Dict[str, Any]]:
    """
    Check for scatter symbol wins (pay anywhere on the board).
    
    Args:
        board: List of symbols representing the game board
        paytable: Payout table for symbol combinations
    
    Returns:
        List of scatter wins
    """
    wins = []
    news_positions = [i for i, symbol in enumerate(board) if symbol == 'NEWS']
    news_count = len(news_positions)
    
    if news_count >= 3:
        news_paytable = paytable.get('NEWS', {})
        payout = news_paytable.get(news_count, 0)
        
        if payout > 0:
            wins.append({
                'symbol': 'NEWS',
                'count': news_count,
                'payout': payout,
                'positions': news_positions,
                'line': -1,  # News doesn't use paylines
                'line_positions': news_positions
            })
    
    return wins

def check_bonus_trigger(board: List[str], trigger_count: int = 3) -> bool:
    """
    Check if bonus feature is triggered (IPO Launch).
    
    Args:
        board: List of symbols representing the game board
        trigger_count: Number of IPO symbols needed to trigger
    
    Returns:
        True if bonus is triggered, False otherwise
    """
    ipo_count = board.count('IPO')
    return ipo_count >= trigger_count

def get_all_wins(board: List[str], paylines: List[List[int]], paytable: Dict[str, Dict[int, float]]) -> List[Dict[str, Any]]:
    """
    Get all wins from a board including paylines and scatter wins.
    
    Args:
        board: List of symbols representing the game board
        paylines: List of payline definitions
        paytable: Payout table for symbol combinations
    
    Returns:
        List of all winning combinations
    """
    all_wins = []
    
    # Check payline wins
    payline_wins = check_paylines(board, paylines, paytable)
    all_wins.extend(payline_wins)
    
    # Check news wins (scatter equivalent)
    news_wins = check_scatter_wins(board, paytable)
    all_wins.extend(news_wins)
    
    return all_wins
