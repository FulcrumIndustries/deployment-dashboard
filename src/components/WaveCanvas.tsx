import React, { useEffect, useRef } from "react";

interface WaveProps {
  maxAmplitude?: number;
  length?: number;
  frequency?: number;
  bgOpacity?: number;
  y?: number;
  color?: string;
  glow?: boolean;
}

class Wave {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  maxAmplitude: number;
  amplitude: number;
  length: number;
  frequency: number;
  increment: number;
  bgOpacity: number;
  y: number;
  color: string;
  glow: boolean;
  gradientColors: string[];
  gradientOffset: number;
  frameCallback: () => void;
  animationFrameId: number;

  constructor(
    canvas: HTMLCanvasElement,
    maxAmplitude = 100,
    length = 100,
    frequency = 8,
    bgOpacity = 0.03,
    y?: number,
    color = "255, 255, 255",
    glow = false
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.maxAmplitude = maxAmplitude;
    this.amplitude = 0;
    this.length = length;
    this.frequency = frequency;
    this.increment = Math.random() * 360;
    this.bgOpacity = bgOpacity;
    this.y = y || canvas.height / 2;
    this.color = color;
    this.animationFrameId = 0;
    this.glow = glow;
    this.gradientColors = color.split("|");
    this.gradientOffset = 0;

    this.frameCallback = () => {
      this.draw(this.ctx);
      this.animationFrameId = requestAnimationFrame(this.frameCallback);
    };
  }

  draw(c: CanvasRenderingContext2D) {
    c.beginPath();
    c.fillStyle = `rgba(0,0,0,${this.bgOpacity})`;

    if (this.glow) {
      const isWhiteWave = this.gradientColors.every((color) => {
        const [r, g, b] = color.split(",").map(Number);
        return r > 200 && g > 200 && b > 200; // Check if it's a white/bright color
      });

      if (isWhiteWave) {
        c.shadowBlur = 40; // Increased blur for white waves
        c.shadowColor = `rgba(${this.gradientColors[0]}, 0.9)`; // Increased opacity
        c.lineWidth = 6; // Thicker line for white waves
      } else {
        c.shadowBlur = 30;
        c.shadowColor = `rgba(${this.gradientColors[0]}, 0.7)`;
        c.lineWidth = 4;
      }
    } else {
      c.lineWidth = 2;
    }

    const gradient = c.createLinearGradient(0, 0, this.canvas.width, 0);
    this.gradientColors.forEach((color, index) => {
      const offset =
        (index / (this.gradientColors.length - 1) + this.gradientOffset) % 1;
      gradient.addColorStop(
        offset,
        `rgba(${color}, ${0.9 + Math.sin(this.increment) * 0.1})`
      );
    });

    c.strokeStyle = gradient;
    c.fillRect(0, 0, this.canvas.width, this.canvas.height);
    c.moveTo(0, this.canvas.height / 2);

    for (let i = 0; i < this.canvas.width; i += 1) {
      c.lineTo(
        i,
        this.y + Math.sin(i / this.length + this.increment) * this.amplitude
      );
    }

    c.stroke();
    c.closePath();

    this.amplitude = Math.sin(this.increment) * this.maxAmplitude;
    this.increment -= this.frequency / 1000;
    this.gradientOffset += 0.001;
  }

  animate() {
    this.frameCallback();
  }

  stop() {
    cancelAnimationFrame(this.animationFrameId);
  }
}

export const WaveCanvas: React.FC<WaveProps> = ({
  maxAmplitude = 150,
  length = 200,
  frequency = -8,
  bgOpacity = 0.01,
  y,
  color = "255, 255, 255",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const waveRef = useRef<Wave | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      if (waveRef.current) {
        waveRef.current.y = y || canvas.height / 2;
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);

    waveRef.current = new Wave(
      canvas,
      maxAmplitude,
      length,
      frequency,
      bgOpacity,
      y,
      color
    );
    waveRef.current.animate();

    return () => {
      window.removeEventListener("resize", updateSize);
      if (waveRef.current) {
        waveRef.current.stop();
      }
    };
  }, [maxAmplitude, length, frequency, bgOpacity, y, color]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: "hidden",
        zIndex: -1,
        pointerEvents: "none",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
};
