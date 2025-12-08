import { useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";
import { EncodingType } from "./ControlsPanel";
import { encode } from '@/utils/encoders';

interface ExplanationPanelProps {
  encoding: EncodingType;
}

const encodingInfo: Record<EncodingType, { title: string; description: string; sampleBits: string }> = {
  NRZ: {
    title: "Non-Return to Zero (NRZ)",
    description: "The signal level remains constant during each bit interval. Logic 1 is represented by a positive voltage level, and logic 0 by a negative voltage level. Simple but requires clock synchronization.",
    sampleBits: "10110",
  },
  RZ: {
    title: "Return to Zero (RZ)",
    description: "The signal returns to zero voltage level halfway through each bit interval. Provides better clock synchronization than NRZ but requires more bandwidth due to faster transitions.",
    sampleBits: "10110",
  },
  NRZI: {
    title: "Non-Return to Zero Inverted (NRZI)",
    description: "A transition (change in level) represents a logic 1, while no transition represents a logic 0. Commonly used in USB and other serial communications to avoid long runs of no transitions.",
    sampleBits: "10110",
  },
  Manchester: {
    title: "Manchester Encoding",
    description: "Each bit period has a transition at the midpoint. Logic 1 is represented by a low-to-high transition, and logic 0 by a high-to-low transition. Self-clocking and used in Ethernet (IEEE 802.3).",
    sampleBits: "10110",
  },
  DiffManchester: {
    title: "Differential Manchester",
    description: "Combines concepts of NRZI and Manchester. A transition at the start of the bit indicates a logic 0, while no transition indicates a logic 1. There's always a mid-bit transition for clocking. Used in token ring networks.",
    sampleBits: "10110",
  },
  AMI: {
    title: "Alternate Mark Inversion (AMI)",
    description: "Logic 0 is represented by zero voltage, while logic 1 alternates between positive and negative voltage levels. Provides DC balance and error detection capability. Used in T1/E1 lines.",
    sampleBits: "10110",
  },
  B8ZS: {
    title: "B8ZS (Bipolar with 8-Zero Substitution)",
    description: "An enhancement of AMI encoding. When 8 consecutive zeros occur, they are replaced with the pattern 000VB0VB (V=violation, B=bipolar). This ensures sufficient transitions for clock recovery on long-distance T1 lines while maintaining DC balance.",
    sampleBits: "1000000001",
  },
  HDB3: {
    title: "HDB3 (High-Density Bipolar-3 Zeros)",
    description: "Replaces every 4 consecutive zeros with 000V (if even pulse count) or B00V (if odd pulse count). Tracks non-zero pulses since last substitution. V is a violation (same polarity as previous), B is a balancing pulse (follows AMI). Used in E1 lines.",
    sampleBits: "1000010000",
  },
};

const ExplanationCanvas = ({ 
  samples, 
  bitLabels, 
  samplesPerBit 
}: { 
  samples: number[]; 
  bitLabels: string; 
  samplesPerBit: number;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const width = 600;
  const height = 200;

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
    const padding = 30;
    const usableWidth = width - 2 * padding;
    const scaleX = samples.length > 0 ? usableWidth / samples.length : 1;
    const amplitudePx = 50;

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
      ctx.lineWidth = 2;
      ctx.shadowColor = isDark ? 'hsl(190, 100%, 60%)' : 'hsl(190, 95%, 50%)';
      ctx.shadowBlur = isDark ? 6 : 3;

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
      ctx.font = '12px JetBrains Mono, monospace';
      ctx.textAlign = 'center';

      for (let i = 0; i < bitLabels.length; i++) {
        const x = padding + (i + 0.5) * samplesPerBit * scaleX;
        ctx.fillText(bitLabels[i], x, height - 8);
      }
    }

    // Draw amplitude labels
    ctx.fillStyle = isDark ? 'hsl(215, 15%, 60%)' : 'hsl(215, 15%, 45%)';
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.textAlign = 'right';
    ctx.fillText('+1', padding - 8, centerY - amplitudePx + 4);
    ctx.fillText('0', padding - 8, centerY + 4);
    ctx.fillText('-1', padding - 8, centerY + amplitudePx + 4);
  }, [samples, bitLabels, samplesPerBit]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="w-full h-auto rounded"
      aria-label="Encoding example visualization"
    />
  );
};

export const ExplanationPanel = ({ encoding }: ExplanationPanelProps) => {
  const info = encodingInfo[encoding];
  const sampleBits = info.sampleBits;
  const samplesPerBit = 30;
  const amplitude = 1.0;
  const samples = encode(sampleBits, encoding, samplesPerBit, amplitude);

  return (
    <Card className="p-6 space-y-4 bg-card border-border">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-full bg-primary/10">
          <Info className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 space-y-2">
          <h3 className="text-lg font-semibold">{info.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {info.description}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground font-medium">Visual Example:</p>
          <p className="text-xs text-muted-foreground font-mono">Sample: {sampleBits}</p>
        </div>
        <div className="bg-muted rounded-lg p-4">
          <ExplanationCanvas 
            samples={samples}
            bitLabels={sampleBits}
            samplesPerBit={samplesPerBit}
          />
        </div>
      </div>
    </Card>
  );
};
