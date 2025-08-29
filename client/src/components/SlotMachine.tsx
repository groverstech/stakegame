import { useEffect, useRef, useState } from "react";
import * as PIXI from "pixi.js";
import { useSlotGame } from "../lib/stores/useSlotGame";
import { useAudio } from "../lib/stores/useAudio";
import { SLOT_CONFIG } from "../lib/slotConfig";

interface SlotMachineProps {
  app: PIXI.Application;
}

const SYMBOLS = [
  "BULL",
  "BEAR",
  "GOLD",
  "OIL",
  "CHART",
  "COIN",
  "SURGE",
  "NEWS",
  "IPO",
];
const SYMBOL_IMAGES = {
  BULL: "/symbols/bull.png",
  BEAR: "/symbols/bear.png",
  GOLD: "/symbols/gold.png",
  OIL: "/symbols/oil.png",
  CHART: "/symbols/chart.png",
  COIN: "/symbols/coin.png",
  SURGE: "/symbols/surge.png",
  NEWS: "/symbols/news.png",
  IPO: "/symbols/ipo.png",
};

export default function SlotMachine({ app }: SlotMachineProps) {
  const containerRef = useRef<PIXI.Container | null>(null);
  const reelsRef = useRef<PIXI.Container[]>([]);
  const symbolsRef = useRef<PIXI.Sprite[][]>([]);
  const texturesRef = useRef<Record<string, PIXI.Texture | null>>({});
  const [isSpinning, setIsSpinning] = useState(false);

  const { shouldSpin, spin, updateReels, checkWins, setSpinning } =
    useSlotGame();

  const { playHit, playSuccess } = useAudio();

  useEffect(() => {
    if (!app) return;

    const initializeSlotMachine = async () => {
      // Load symbol textures
      const textures: Record<string, PIXI.Texture | null> = {};
      for (const symbol of SYMBOLS) {
        try {
          textures[symbol] = await PIXI.Assets.load(
            SYMBOL_IMAGES[symbol as keyof typeof SYMBOL_IMAGES],
          );
        } catch (error) {
          console.error(`Failed to load texture for ${symbol}:`, error);
          textures[symbol] = null;
        }
      }
      texturesRef.current = textures;

      const container = new PIXI.Container();
      container.x = app.screen.width / 2;
      container.y = app.screen.height / 2;
      app.stage.addChild(container);
      containerRef.current = container;

      // Create background with stock market theme
      const background = new PIXI.Graphics();
      background.rect(-300, -200, 600, 400);
      background.fill(0x1e293b);
      background.stroke({ width: 3, color: 0x10b981 });
      container.addChild(background);

      // Create reels
      const reels: PIXI.Container[] = [];
      const symbols: PIXI.Sprite[][] = [];

      for (let reelIndex = 0; reelIndex < SLOT_CONFIG.REELS; reelIndex++) {
        const reel = new PIXI.Container();
        reel.x = -240 + reelIndex * 120;
        reel.y = -150;
        container.addChild(reel);
        reels.push(reel);

        const reelSymbols: PIXI.Sprite[] = [];

        // Create symbols for each position in the reel
        for (let row = 0; row < SLOT_CONFIG.ROWS; row++) {
          const randomSymbol =
            SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
          const texture = textures[randomSymbol];

          const sprite = texture ? new PIXI.Sprite(texture) : new PIXI.Sprite();
          sprite.anchor.set(0.5);
          sprite.x = 50;
          sprite.y = row * 100 + 50;
          sprite.width = 70;
          sprite.height = 70;

          // Store symbol name as a custom property
          (sprite as any).symbolName = randomSymbol;

          reel.addChild(sprite);
          reelSymbols.push(sprite);
        }

        symbols.push(reelSymbols);

        // Add reel border with stock market styling
        const border = new PIXI.Graphics();
        border.rect(0, 0, 100, 300);
        border.stroke({ width: 2, color: 0x6b7280 });
        reel.addChild(border);
      }

      reelsRef.current = reels;
      symbolsRef.current = symbols;
    };

    initializeSlotMachine();

    return () => {
      if (containerRef.current && app.stage) {
        app.stage.removeChild(containerRef.current);
      }
    };
  }, [app]);

  const spinReels = async () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setSpinning(true);

    // Play spin sound
    playHit();

    // Animate spinning
    const spinDuration = 2000;
    const spinPromises: Promise<void>[] = [];

    reelsRef.current.forEach((reel, reelIndex) => {
      const promise = new Promise<void>((resolve) => {
        let elapsed = 0;
        const startTime = Date.now();

        const animate = () => {
          elapsed = Date.now() - startTime;
          const progress = Math.min(
            elapsed / (spinDuration + reelIndex * 200),
            1,
          );

          // Spin effect - move symbols down and cycle
          symbolsRef.current[reelIndex].forEach((sprite, row) => {
            sprite.y = row * 100 + 50 + ((elapsed * 0.5) % 400);
            if (sprite.y > 350) {
              sprite.y -= 400;
              // Change symbol during spin
              const newSymbol =
                SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
              const texture = texturesRef.current[newSymbol];
              if (texture && sprite) {
                sprite.texture = texture;
                (sprite as any).symbolName = newSymbol;
                sprite.width = 70;
                sprite.height = 70;
              }
            }
          });

          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            // Stop at final position and ensure proper sizing
            symbolsRef.current[reelIndex].forEach((sprite, row) => {
              sprite.y = row * 100 + 50;
              sprite.width = 70;
              sprite.height = 70;
            });
            resolve();
          }
        };

        animate();
      });

      spinPromises.push(promise);
    });

    // Wait for all reels to stop
    await Promise.all(spinPromises);

    // Generate final result
    const result = await spin();

    if (result) {
      // Update display with final symbols - fix positioning for 3x5 grid
      for (let reelIndex = 0; reelIndex < SLOT_CONFIG.REELS; reelIndex++) {
        for (let row = 0; row < SLOT_CONFIG.ROWS; row++) {
          const boardIndex = reelIndex * SLOT_CONFIG.ROWS + row;
          const symbol = result.board[boardIndex];

          if (
            symbolsRef.current[reelIndex] &&
            symbolsRef.current[reelIndex][row]
          ) {
            const sprite = symbolsRef.current[reelIndex][row];
            const texture = texturesRef.current[symbol];
            if (texture && sprite) {
              sprite.texture = texture;
              (sprite as any).symbolName = symbol;
              // Ensure proper positioning
              sprite.y = row * 100 + 50;
              sprite.width = 70;
              sprite.height = 70;
            }
          }
        }
      }

      // Check for wins and highlight
      const wins = checkWins(result.board);
      if (wins.length > 0) {
        playSuccess();
        highlightWinningLines(wins);
      }
    }

    setIsSpinning(false);
    setSpinning(false);
  };

  const highlightWinningLines = (wins: any[]) => {
    // Highlight winning symbols - fix position calculation for 3x5 grid
    wins.forEach((win) => {
      win.positions.forEach((position: number) => {
        const reelIndex = Math.floor(position / SLOT_CONFIG.ROWS);
        const row = position % SLOT_CONFIG.ROWS;

        if (
          symbolsRef.current[reelIndex] &&
          symbolsRef.current[reelIndex][row]
        ) {
          const sprite = symbolsRef.current[reelIndex][row];

          // Create highlight animation with proper scaling
          const originalScale = 1.0;
          let time = 0;

          const highlight = () => {
            time += 0.1;
            const scale = originalScale + Math.sin(time) * 0.15;
            sprite.scale.set(scale);

            if (time < Math.PI * 4) {
              requestAnimationFrame(highlight);
            } else {
              sprite.scale.set(originalScale);
              // Ensure size stays consistent
              sprite.width = 70;
              sprite.height = 70;
            }
          };

          highlight();
        }
      });
    });
  };

  // Handle spin from game state
  useEffect(() => {
    if (shouldSpin && !isSpinning) {
      spinReels();
    }
  }, [shouldSpin, isSpinning]);

  return null; // This component manages PIXI objects directly
}
