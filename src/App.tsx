import { Suspense, useEffect, useState } from "react";
import "@fontsource/inter";
import SlotGame from "./components/SlotGame";
import { useAudio } from "./lib/stores/useAudio";

function App() {
  const [showGame, setShowGame] = useState(false);
  const { setBackgroundMusic, setHitSound, setSuccessSound } = useAudio();

  useEffect(() => {
    // Initialize audio
    const bgMusic = new Audio('/sounds/background.mp3');
    const hitSound = new Audio('/sounds/hit.mp3');
    const successSound = new Audio('/sounds/success.mp3');
    
    bgMusic.loop = true;
    bgMusic.volume = 0.3;
    
    setBackgroundMusic(bgMusic);
    setHitSound(hitSound);
    setSuccessSound(successSound);
    
    setShowGame(true);
  }, [setBackgroundMusic, setHitSound, setSuccessSound]);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)' }}>
      {showGame && (
        <Suspense fallback={
          <div className="flex items-center justify-center w-full h-full">
            <div className="text-white text-xl">Loading Market Surge...</div>
          </div>
        }>
          <SlotGame />
        </Suspense>
      )}
    </div>
  );
}

export default App;
