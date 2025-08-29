import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { useSlotGame } from '../lib/stores/useSlotGame';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';

interface GameUIProps {
  onMuteToggle: () => void;
  isMuted: boolean;
}

export default function GameUI({ onMuteToggle, isMuted }: GameUIProps) {
  const [betAmount, setBetAmount] = useState(1);
  const { requestSpin, balance, totalWin, isSpinning } = useSlotGame();

  const handleSpin = () => {
    if (!isSpinning && balance >= betAmount) {
      requestSpin(betAmount);
    }
  };

  const adjustBet = (amount: number) => {
    const newBet = Math.max(0.1, Math.min(100, betAmount + amount));
    setBetAmount(Number(newBet.toFixed(1)));
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Top UI Bar */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center pointer-events-auto">
        <Card className="bg-black/80 border-gray-600">
          <CardContent className="p-3">
            <div className="flex items-center gap-4 text-white">
              <div className="text-sm">
                <span className="text-gray-400">Balance:</span>
                <span className="ml-2 font-bold text-green-400">${balance.toFixed(2)}</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-400">Win:</span>
                <span className="ml-2 font-bold text-yellow-400">${totalWin.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={onMuteToggle}
          variant="outline"
          size="sm"
          className="bg-black/80 border-gray-600 text-white hover:bg-gray-800"
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
      </div>

      {/* Bottom Control Panel */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 pointer-events-auto">
        <Card className="bg-black/90 border-gray-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-6">
              {/* Bet Controls */}
              <div className="flex items-center gap-2">
                <span className="text-white text-sm">Bet:</span>
                <Button
                  onClick={() => adjustBet(-0.1)}
                  variant="outline"
                  size="sm"
                  className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700 px-2"
                  disabled={isSpinning}
                >
                  -
                </Button>
                <div className="bg-gray-800 border border-gray-600 px-3 py-1 rounded text-white min-w-[60px] text-center">
                  ${betAmount.toFixed(1)}
                </div>
                <Button
                  onClick={() => adjustBet(0.1)}
                  variant="outline"
                  size="sm"
                  className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700 px-2"
                  disabled={isSpinning}
                >
                  +
                </Button>
              </div>

              {/* Spin Button */}
              <Button
                onClick={handleSpin}
                disabled={isSpinning || balance < betAmount}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSpinning ? (
                  <div className="flex items-center gap-2">
                    <Pause className="h-5 w-5" />
                    SPINNING...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Play className="h-5 w-5" />
                    SPIN
                  </div>
                )}
              </Button>

              {/* Max Bet Button */}
              <Button
                onClick={() => setBetAmount(100)}
                variant="outline"
                className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                disabled={isSpinning}
              >
                MAX BET
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Game Info */}
      <div className="absolute bottom-4 right-4 pointer-events-auto">
        <Card className="bg-black/80 border-gray-600">
          <CardContent className="p-3">
            <div className="text-white text-xs space-y-1">
              <div className="font-bold text-green-400">Market Surge</div>
              <div className="text-gray-400">by Grovers Technologies</div>
              <div>RTP: 96.5%</div>
              <div>Lines: 20</div>
              <div>Reels: 3x5</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Win Display */}
      {totalWin > 0 && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white text-4xl font-bold px-8 py-4 rounded-lg shadow-2xl animate-pulse">
            MARKET WIN ${totalWin.toFixed(2)}!
          </div>
        </div>
      )}
    </div>
  );
}
