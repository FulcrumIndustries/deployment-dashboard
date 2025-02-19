import React from "react";
import { WaveCanvas } from "./WaveCanvas";
import { useParams } from "react-router-dom";

export const WavesBackground = () => {
  const { id } = useParams();

  return (
    <div className="background-wrapper">
      <div className={`gradient-panel dark ${!id ? "active" : ""}`} />
      <div className={`gradient-panel light ${id ? "active" : ""}`} />
      {!id && (
        <>
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
        </>
      )}
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

        .gradient-panel {
          position: absolute;
          width: 200%;
          height: 200%;
          top: -50%;
          left: -50%;
          z-index: -2;
          opacity: 0;
          filter: blur(80px);
          transform: translateX(-100%);
          transition: all 1.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .gradient-panel.active {
          opacity: 1;
          transform: translateX(0);
        }

        .gradient-panel.dark {
          background: linear-gradient(
            45deg,
            #f0f9ff,
            #e0f2fe,
            #dbeafe,
            #e0e7ff,
            #f0f9ff
          );
          animation: moveGradient 30s linear infinite;
        }

        .gradient-panel.light {
          transform: translateX(100%);
          z-index: -1;
        }

        .gradient-panel.light.active {
          transform: translateX(0);
        }

        .noise {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          opacity: 0.02;
          z-index: -1;
          animation: noise 2s steps(4) infinite;
          mix-blend-mode: overlay;
          transition: opacity 1s ease-in-out;
        }

        .overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          transition: opacity 1s ease-in-out;
          background: radial-gradient(
            circle at 50% 50%, 
            rgba(255, 255, 255, 0) 0%, 
            rgba(255, 255, 255, 0.5) 85%, 
            rgba(255, 255, 255, 0.8) 100%
          );
          opacity: 0;
        }

        .overlay.active {
          opacity: 1;
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

        .fade-in {
          animation: fadeIn 0.5s ease-out;
        }

        .white-background {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: white;
          z-index: -1;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};
