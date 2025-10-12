import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";
import { EncodingType } from "./ControlsPanel";

interface ExplanationPanelProps {
  encoding: EncodingType;
}

const encodingInfo: Record<EncodingType, { title: string; description: string; diagram: string }> = {
  NRZ: {
    title: "Non-Return to Zero (NRZ)",
    description: "The signal level remains constant during each bit interval. Logic 1 is represented by a positive voltage level, and logic 0 by a negative voltage level. Simple but requires clock synchronization.",
    diagram: `
Bit:  1    0    1    1    0
      ┌────┐         ┌────┬────┐
  +V  │    │         │    │    │
  ────┤    ├─────────┤    │    ├────
      │    │         │    │    │
  -V  │    └─────────┘    │    └────
    `,
  },
  RZ: {
    title: "Return to Zero (RZ)",
    description: "The signal returns to zero voltage level halfway through each bit interval. Provides better clock synchronization than NRZ but requires more bandwidth due to faster transitions.",
    diagram: `
Bit:  1    0    1    1    0
      ┌─┐       ┌─┐  ┌─┐
  +V  │ │       │ │  │ │
  ────┤ ├───────┤ ├──┤ ├────────
      │ │   │   │ │  │ │   │
  -V  │ │   └───┘ │  │ │   └────
    `,
  },
  NRZI: {
    title: "Non-Return to Zero Inverted (NRZI)",
    description: "A transition (change in level) represents a logic 1, while no transition represents a logic 0. Commonly used in USB and other serial communications to avoid long runs of no transitions.",
    diagram: `
Bit:  1    0    1    1    0
      ┌────┐    ┌────┐    ┌────
  +V  │    │    │    │    │
  ────┤    ├────┤    ├────┤
      │    │    │    │    │
  -V  │    │    │    │    │
    `,
  },
  Manchester: {
    title: "Manchester Encoding",
    description: "Each bit period has a transition at the midpoint. Logic 1 is represented by a low-to-high transition, and logic 0 by a high-to-low transition. Self-clocking and used in Ethernet (IEEE 802.3).",
    diagram: `
Bit:  1    0    1    1    0
      ┌─┐       ┌─┐  ┌─┐
  +V  │ │    ┌──┤ │  │ └──┐
  ────┤ ├────┤  │ ├──┤    ├──
      │ │    │  │ │  │    │
  -V  │ └────┘  │ │  │    └──
    `,
  },
  DiffManchester: {
    title: "Differential Manchester",
    description: "Combines concepts of NRZI and Manchester. A transition at the start of the bit indicates a logic 0, while no transition indicates a logic 1. There's always a mid-bit transition for clocking. Used in token ring networks.",
    diagram: `
Bit:  1    0    1    1    0
      ┌──┐ ┌─┐  ┌──┐ ┌─┐
  +V  │  │ │ │  │  │ │ │
  ────┤  ├─┤ ├──┤  ├─┤ ├───
      │  │ │ │  │  │ │ │
  -V  │  └─┘ └──┘  └─┘ └───
    `,
  },
  AMI: {
    title: "Alternate Mark Inversion (AMI)",
    description: "Logic 0 is represented by zero voltage, while logic 1 alternates between positive and negative voltage levels. Provides DC balance and error detection capability. Used in T1/E1 lines.",
    diagram: `
Bit:  1    0    1    1    0
      ┌────┐         ┌────┐
  +V  │    │         │    │
  ────┤    ├─────────┤    ├────
      │    │    ┌────┘    │
  -V  │    │    │         │
    `,
  },
};

export const ExplanationPanel = ({ encoding }: ExplanationPanelProps) => {
  const info = encodingInfo[encoding];

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

      <div className="bg-muted rounded-lg p-4">
        <p className="text-xs text-muted-foreground mb-2">Visual Example:</p>
        <pre className="font-mono text-xs leading-relaxed overflow-x-auto">
          {info.diagram.trim()}
        </pre>
      </div>
    </Card>
  );
};
