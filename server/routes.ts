import express, { Request, Response } from 'express';
import { runSlotEngine } from '../math_engine/slot_engine';

const router = express.Router();

// Simple in-memory balance store
let balance = 1000;

// --- Get Balance ---
router.get('/api/stake/balance', (req: Request, res: Response) => {
  res.json({ balance });
});

// --- Play Route ---
router.post('/api/stake/play', async (req: Request, res: Response) => {
  try {
    const { bet } = req.body;

    if (typeof bet !== 'number' || bet <= 0) {
      return res.status(400).json({ error: 'Invalid bet amount' });
    }

    if (bet > balance) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Deduct bet
    balance -= bet;

    // Run slot engine
    const result = await runSlotEngine(bet);

    // Add winnings
    balance += result.totalWin;

    res.json({
      ...result,
      balance,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal error' });
  }
});

export default router;
