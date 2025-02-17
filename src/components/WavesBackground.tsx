import React from "react";
import { WaveCanvas } from "./WaveCanvas";

export const WavesBackground = () => {
  return (
    <div className="background-wrapper">
      <div className="gradient-background" />
      <div className="noise" />
      {/* Larger background waves */}
      <WaveCanvas
        maxAmplitude={120}
        length={300}
        frequency={-2}
        y={window.innerHeight * 0.3}
        color="35, 0, 128|107, 51, 234|0, 153, 255" // Pink to Purple to Blue
        glow={true}
      />
      {/* Pure white wave with different frequency */}
      <WaveCanvas
        maxAmplitude={200}
        length={250}
        frequency={-1.2}
        y={window.innerHeight * 0.4}
        color="255, 255, 255|230, 230, 255|255, 255, 255" // Brighter white gradient
        glow={true}
      />
      <WaveCanvas
        maxAmplitude={120}
        length={280}
        frequency={-3}
        y={window.innerHeight * 0.7}
        color="255, 126, 0|255, 0, 128|147, 51, 234" // Orange to Pink to Purple
        glow={true}
      />
      {/* Original waves with enhanced colors */}
      <WaveCanvas
        maxAmplitude={70}
        length={200}
        frequency={-4}
        y={window.innerHeight * 0.45}
        color="0, 255, 255|0, 128, 255|0, 255, 128" // Cyan to Blue to Green
        glow={true}
      />
      <WaveCanvas
        maxAmplitude={90}
        length={180}
        frequency={-5}
        y={window.innerHeight * 0.5}
        color="255, 0, 128|255, 0, 255|147, 51, 234" // Pink to Magenta to Purple
        glow={true}
      />
      <WaveCanvas
        maxAmplitude={80}
        length={220}
        frequency={-3}
        y={window.innerHeight * 0.55}
        color="255, 208, 0|255, 126, 0|255, 0, 128" // Gold to Orange to Pink
        glow={true}
      />
      <div className="overlay" />
      <style>{`
        .background-wrapper {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1;
          overflow: hidden;
          pointer-events: none;
        }

        .gradient-background {
          position: absolute;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            45deg,
            #4a154b,
            #ff6b00,
            #fbbf24,
            #059669,
            #4a154b
          );
          animation: moveGradient 30s linear infinite;
          top: -50%;
          left: -50%;
          z-index: -2;
          opacity: 0.6;
          filter: blur(120px) contrast(1.2);
          transform-origin: center center;
        }

        .noise {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          opacity: 0.03;
          z-index: -1;
          animation: noise 2s steps(4) infinite;
          mix-blend-mode: overlay;
        }

        .overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(
            circle at 50% 50%, 
            rgb(10, 10, 15) 0%, 
            rgba(14, 10, 15, 0.3) 85%, 
            rgba(12, 9, 13, 0.95) 100%
          );
          z-index: 0;
        }

        @keyframes moveGradient {
          0% {
            transform: translate(-50%, -50%) scale(1.5) rotate(0deg);
          }
          50% {
            transform: translate(-50%, -50%) scale(1.5) rotate(180deg);
          }
          100% {
            transform: translate(-50%, -50%) scale(1.5) rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};
