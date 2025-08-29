import React, { useEffect, useState } from "react";
import { getBalance, play, PlayResponse } from "./lib/stakeApi";

const SYMBOLS = ["🍒", "🍋", "🔔", "⭐", "7", "💎"];

// 🎵 Sound Effects
const spinSound = new Audio("/sounds/reel-spin.mp3");
spinSound.loop = true;
const stopSound = new Audio("/sounds/reel-stop.mp3");
const winSound = new Audio("/sounds/win.mp3");

// 🎵 Ambience Music
const ambience = new Audio("/sounds/ambience.mp3");
ambience.loop = true;
ambience.volume = 0.5; // softer than effects

function BalanceBar({ balance }: { balance: number }) {
  return (
    <div
      style={{
        padding: "10px",
        background: "#222",
        color: "#fff",
        fontWeight: "bold",
        textAlign: "center",
      }}
    >
      💰 Balance: {balance}
    </div>
  );
}

function App() {
  const [balance, setBalance] = useState<number>(0);
  const [lastResult, setLastResult] = useState<PlayResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [bet, setBet] = useState<number>(100);
  const [musicOn, setMusicOn] = useState<boolean>(false);

  const rows = 3;
  const cols = 5;
  const [board, setBoard] = useState<string[][]>(
    Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => "❔")
    )
  );
  const [spinningCols, setSpinningCols] = useState<boolean[]>(
    Array(cols).fill(false)
  );

  useEffect(() => {
    getBalance().then(setBalance).catch(console.error);
  }, []);

  // 🎵 Handle ambience toggle
  const toggleMusic = () => {
    if (musicOn) {
      ambience.pause();
    } else {
      ambience.currentTime = 0;
      ambience.play();
    }
    setMusicOn(!musicOn);
  };

  const handleSpin = async () => {
    setLoading(true);
    setLastResult(null);

    // 🎵 Start spinning sound
    spinSound.currentTime = 0;
    spinSound.play();

    setSpinningCols(Array(cols).fill(true));

    // Show random symbols while waiting
    let spinInterval = setInterval(() => {
      setBoard(() =>
        Array.from({ length: rows }, () =>
          Array.from({ length: cols }, () =>
            SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
          )
        )
      );
    }, 100);

    // Call API
    const result = await play(bet);

    result.board[0].forEach((_, colIndex) => {
      setTimeout(() => {
        if (colIndex === cols - 1) {
          spinSound.pause();
        }

        stopSound.currentTime = 0;
        stopSound.play();

        setSpinningCols((prev) => {
          const newCols = [...prev];
          newCols[colIndex] = false;
          return newCols;
        });

        setBoard((prev) =>
          prev.map((row, r) =>
            row.map((_, c) =>
              c === colIndex ? result.board[r][c] : prev[r][c]
            )
          )
        );

        if (colIndex === cols - 1) {
          clearInterval(spinInterval);
          setLastResult(result);
          setBalance(result.balance);
          setLoading(false);

          if (result.wins.length > 0) {
            winSound.currentTime = 0;
            winSound.play();
          }
        }
      }, 800 * (colIndex + 1));
    });
  };

  return (
    <div>
      <BalanceBar balance={balance} />

      {/* 🎵 Music toggle button */}
      <div style={{ textAlign: "center", marginTop: "10px" }}>
        <button onClick={toggleMusic}>
          {musicOn ? "🔇 Mute Ambience" : "🔊 Play Ambience"}
        </button>
      </div>

      <div style={{ padding: "20px", textAlign: "center" }}>
        <label style={{ marginRight: "10px" }}>
          Bet Amount:{" "}
          <input
            type="number"
            value={bet}
            min={1}
            max={balance}
            onChange={(e) => setBet(Number(e.target.value))}
          />
        </label>
        <button onClick={handleSpin} disabled={loading || balance <= 0 || bet <= 0}>
          {loading ? "Spinning..." : "Spin 🎰"}
        </button>
      </div>
    </div>
  );
}

export default App;
