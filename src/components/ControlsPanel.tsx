////hello
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Shuffle, Download, RotateCcw } from "lucide-react";

export type EncodingType = 'NRZ' | 'RZ' | 'NRZI' | 'Manchester' | 'DiffManchester' | 'AMI';

interface ControlsPanelProps {
  bits: string;
  encoding: EncodingType;
  samplesPerBit: number;
  amplitude: number;
  noiseStd: number;
  showEye: boolean;
  onBitsChange: (bits: string) => void;
  onEncodingChange: (encoding: EncodingType) => void;
  onSamplesPerBitChange: (value: number) => void;
  onAmplitudeChange: (value: number) => void;
  onNoiseStdChange: (value: number) => void;
  onShowEyeChange: (value: boolean) => void;
  onRedraw: () => void;
  onRandomize: () => void;
  onDownloadPNG: () => void;
  onReset: () => void;
}

export const ControlsPanel = ({
  bits,
  encoding,
  samplesPerBit,
  amplitude,
  noiseStd,
  showEye,
  onBitsChange,
  onEncodingChange,
  onSamplesPerBitChange,
  onAmplitudeChange,
  onNoiseStdChange,
  onShowEyeChange,
  onRandomize,
  onDownloadPNG,
  onReset,
}: ControlsPanelProps) => {
  const handleBitsInput = (value: string) => {
    // Only allow 0s and 1s
    const cleaned = value.replace(/[^01]/g, '');
    onBitsChange(cleaned);
  };

  const setPreset = (preset: string) => {
    onBitsChange(preset);
  };

  return (
    <Card className="p-6 space-y-6 bg-card border-border">
      <div className="space-y-2">
        <Label htmlFor="bits-input" className="text-sm font-medium">
          Binary Input
        </Label>
        <div className="flex gap-2">
          <Input
            id="bits-input"
            value={bits}
            onChange={(e) => handleBitsInput(e.target.value)}
            placeholder="Enter binary (e.g., 10110011)"
            className="font-mono text-lg tracking-wider bg-background"
            aria-label="Binary data input"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={onRandomize}
            title="Randomize bits"
            aria-label="Randomize binary data"
          >
            <Shuffle className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPreset('1010')}
          >
            Preset: 1010
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPreset('11110000')}
          >
            Preset: 11110000
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPreset('101010101010')}
          >
            Preset: Alternating
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="encoding-select" className="text-sm font-medium">
          Encoding Scheme
        </Label>
        <Select value={encoding} onValueChange={(val) => onEncodingChange(val as EncodingType)}>
          <SelectTrigger id="encoding-select" className="bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="NRZ">NRZ (Non-Return to Zero)</SelectItem>
            <SelectItem value="RZ">RZ (Return to Zero)</SelectItem>
            <SelectItem value="NRZI">NRZI (Non-Return to Zero Inverted)</SelectItem>
            <SelectItem value="Manchester">Manchester</SelectItem>
            <SelectItem value="DiffManchester">Differential Manchester</SelectItem>
            <SelectItem value="AMI">AMI (Alternate Mark Inversion)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="samples-slider" className="text-sm font-medium">
              Samples per Bit
            </Label>
            <span className="text-sm text-muted-foreground font-mono">{samplesPerBit}</span>
          </div>
          {/* FIXED: Pass number directly instead of array */}
          <Slider
            id="samples-slider"
            value={[samplesPerBit]} 
            onValueChange={(vals: number[]) => onSamplesPerBitChange(vals[0])}
            min={20}
            max={100}
            step={10}
            className="w-full"
            aria-label="Samples per bit"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="amplitude-slider" className="text-sm font-medium">
              Amplitude
            </Label>
            <span className="text-sm text-muted-foreground font-mono">{amplitude.toFixed(1)}</span>
          </div>
          {/* FIXED: Pass number directly instead of array */}
          <Slider
            id="amplitude-slider"
            value={[amplitude]}
            onValueChange={(vals: number[]) => onAmplitudeChange(vals[0])}
            min={0.5}
            max={2.0}
            step={0.1}
            className="w-full"
            aria-label="Signal amplitude"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="noise-slider" className="text-sm font-medium">
              Noise Standard Deviation
            </Label>
            <span className="text-sm text-muted-foreground font-mono">{noiseStd.toFixed(2)}</span>
          </div>
          <Slider
            id="noise-slider"
            value={[noiseStd]}
            onValueChange={(vals: number[]) => onNoiseStdChange(vals[0])}
            min={0}
            max={0.5}
            step={0.01}
            className="w-full"
            aria-label="Noise standard deviation"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <Label htmlFor="eye-switch" className="text-sm font-medium">
            Show Eye Diagram
          </Label>
          <Switch
            id="eye-switch"
            checked={showEye}
            onCheckedChange={onShowEyeChange}
            aria-label="Toggle eye diagram view"
          />
        </div>
      </div>

      <div className="flex gap-2 pt-4 border-t border-border">
        <Button
          onClick={onDownloadPNG}
          className="flex-1"
          variant="default"
        >
          <Download className="h-4 w-4 mr-2" />
          Download PNG
        </Button>
        <Button
          onClick={onReset}
          variant="outline"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>
    </Card>
  );
};
