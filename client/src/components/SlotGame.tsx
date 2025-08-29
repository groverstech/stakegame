import { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';
import SlotMachine from './SlotMachine';
import GameUI from './GameUI';
import { useSlotGame } from '../lib/stores/useSlotGame';
import { useAudio } from '../lib/stores/useAudio';

export default function SlotGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const [pixiApp, setPixiApp] = useState<PIXI.Application | null>(null);
  const { initializeGame, balance, totalWin, isSpinning } = useSlotGame();
  const { toggleMute, isMuted } = useAudio();

  useEffect(() => {
    const initPixi = async () => {
      if (!canvasRef.current) return;

      const app = new PIXI.Application();
      await app.init({
        canvas: canvasRef.current,
        width: 1200,
        height: 800,
        backgroundColor: 0x0a0a0a,
        antialias: true
      });

      appRef.current = app;
      setPixiApp(app);
      
      // Initialize game state
      initializeGame();
    };

    initPixi();

    return () => {
      if (appRef.current) {
        appRef.current.destroy(true);
        appRef.current = null;
      }
    };
  }, [initializeGame]);

  const handleMuteToggle = () => {
    toggleMute();
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <canvas
        ref={canvasRef}
        className="border border-gray-700 rounded-lg shadow-2xl"
        style={{ maxWidth: '90vw', maxHeight: '90vh' }}
      />
      
      {pixiApp && <SlotMachine app={pixiApp} />}
      
      <GameUI 
        onMuteToggle={handleMuteToggle}
        isMuted={isMuted}
      />
    </div>
  );
}
