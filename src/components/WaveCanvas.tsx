import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';

interface WaveCanvasProps {
  samples: number[];
  samplesPerBit: number;
  amplitudePx: number;
  bitLabels?: string;
  width?: number;
  height?: number;
}

export const WaveCanvas = ({
  samples,
  samplesPerBit,
  amplitudePx,
  bitLabels = '',
  width = 1200,
  height = 400,
}: WaveCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Set background
    const isDark = document.documentElement.classList.contains('dark');
    ctx.fillStyle = isDark ? 'hsl(220, 20%, 12%)' : 'hsl(0, 0%, 100%)';
    ctx.fillRect(0, 0, width, height);

    const centerY = height / 2;
    const padding = 40;
    const usableWidth = width - 2 * padding;
    const scaleX = samples.length > 0 ? usableWidth / samples.length : 1;

    // Draw grid
    ctx.strokeStyle = isDark ? 'hsl(220, 15%, 20%)' : 'hsl(215, 15%, 85%)';
    ctx.lineWidth = 0.5;

    // Horizontal grid lines
    for (let i = 0; i <= 4; i++) {
      const y = (height / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Vertical grid lines (bit boundaries)
    const bitCount = bitLabels.length || Math.ceil(samples.length / samplesPerBit);
    for (let i = 0; i <= bitCount; i++) {
      const x = padding + i * samplesPerBit * scaleX;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Draw center line
    ctx.strokeStyle = isDark ? 'hsl(220, 15%, 30%)' : 'hsl(215, 15%, 75%)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(padding, centerY);
    ctx.lineTo(width - padding, centerY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw waveform
    if (samples.length > 0) {
      ctx.strokeStyle = isDark ? 'hsl(190, 95%, 50%)' : 'hsl(190, 95%, 45%)';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = isDark ? 'hsl(190, 100%, 60%)' : 'hsl(190, 95%, 50%)';
      ctx.shadowBlur = isDark ? 8 : 4;

      ctx.beginPath();
      for (let i = 0; i < samples.length; i++) {
        const x = padding + i * scaleX;
        const y = centerY - samples[i] * amplitudePx;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Draw bit labels
    if (bitLabels) {
      ctx.fillStyle = isDark ? 'hsl(210, 20%, 80%)' : 'hsl(215, 25%, 25%)';
      ctx.font = '14px JetBrains Mono, monospace';
      ctx.textAlign = 'center';

      for (let i = 0; i < bitLabels.length; i++) {
        const x = padding + (i + 0.5) * samplesPerBit * scaleX;
        ctx.fillText(bitLabels[i], x, height - 10);
      }
    }

    // Draw amplitude labels
    ctx.fillStyle = isDark ? 'hsl(215, 15%, 60%)' : 'hsl(215, 15%, 45%)';
    ctx.font = '12px JetBrains Mono, monospace';
    ctx.textAlign = 'right';
    ctx.fillText('+1', padding - 10, centerY - amplitudePx + 5);
    ctx.fillText('0', padding - 10, centerY + 5);
    ctx.fillText('-1', padding - 10, centerY + amplitudePx + 5);
  }, [samples, samplesPerBit, amplitudePx, bitLabels, width, height]);

  return (
    <Card className="p-4 bg-card border-border overflow-hidden">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full h-auto rounded"
        aria-label="Signal waveform visualization"
      />
    </Card>
  );
};
