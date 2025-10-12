import { useState, useRef, useEffect } from 'react';
import { ControlsPanel, EncodingType } from '@/components/ControlsPanel';
import { WaveCanvas } from '@/components/WaveCanvas';
import { DecodePanel } from '@/components/DecodePanel';
import { ExplanationPanel } from '@/components/ExplanationPanel';
import { ThemeToggle } from '@/components/ThemeToggle';
import { encode } from '@/utils/encoders';
import { decode, findErrors } from '@/utils/decoders';
import { toast } from '@/hooks/use-toast';
import { Activity } from 'lucide-react';

const Index = () => {
  const [bits, setBits] = useState('10110011');
  const [encoding, setEncoding] = useState<EncodingType>('NRZ');
  const [samplesPerBit, setSamplesPerBit] = useState(40);
  const [amplitude, setAmplitude] = useState(1.0);
  const [samples, setSamples] = useState<number[]>([]);
  const [decodedBits, setDecodedBits] = useState('');
  const [errors, setErrors] = useState<number[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Set dark mode by default
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Auto-encode when inputs change
  useEffect(() => {
    if (bits.length > 0) {
      handleEncode();
    }
  }, [bits, encoding, samplesPerBit, amplitude]);

  const handleEncode = () => {
    try {
      const newSamples = encode(bits, encoding, samplesPerBit, amplitude);
      setSamples(newSamples);
      
      // Auto-decode
      const decoded = decode(newSamples, encoding, samplesPerBit);
      setDecodedBits(decoded);
      
      // Find errors
      const foundErrors = findErrors(bits, decoded);
      setErrors(foundErrors);
      
      if (foundErrors.length === 0 && decoded.length > 0) {
        toast({
          title: "Encoding successful",
          description: `${bits.length} bits encoded using ${encoding}`,
        });
      }
    } catch (error) {
      toast({
        title: "Encoding failed",
        description: "Please check your input and try again",
        variant: "destructive",
      });
    }
  };

  const handleRandomize = () => {
    const length = Math.floor(Math.random() * 8) + 8; // 8-16 bits
    const randomBits = Array.from({ length }, () => Math.random() > 0.5 ? '1' : '0').join('');
    setBits(randomBits);
  };

  const handleDownloadPNG = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) {
      toast({
        title: "Download failed",
        description: "Canvas not found",
        variant: "destructive",
      });
      return;
    }

    try {
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `waveform-${encoding}-${bits}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        
        toast({
          title: "Download successful",
          description: `Waveform saved as ${encoding}-${bits}.png`,
        });
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Could not save waveform image",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    setBits('10110011');
    setEncoding('NRZ');
    setSamplesPerBit(40);
    setAmplitude(1.0);
    toast({
      title: "Reset complete",
      description: "All settings restored to defaults",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <Activity className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Line Encoding Simulator</h1>
              <p className="text-sm text-muted-foreground">Digital Signal Processing & Visualization</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column: Controls */}
          <div className="lg:col-span-1 space-y-6">
            <ControlsPanel
              bits={bits}
              encoding={encoding}
              samplesPerBit={samplesPerBit}
              amplitude={amplitude}
              onBitsChange={setBits}
              onEncodingChange={setEncoding}
              onSamplesPerBitChange={setSamplesPerBit}
              onAmplitudeChange={setAmplitude}
              onRedraw={handleEncode}
              onRandomize={handleRandomize}
              onDownloadPNG={handleDownloadPNG}
              onReset={handleReset}
            />
            
            <ExplanationPanel encoding={encoding} />
          </div>

          {/* Right Column: Visualization & Decode */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Waveform Visualization</h2>
              <WaveCanvas
                samples={samples}
                samplesPerBit={samplesPerBit}
                amplitudePx={80}
                bitLabels={bits}
                width={1200}
                height={400}
              />
            </div>

            <DecodePanel
              originalBits={bits}
              decodedBits={decodedBits}
              errors={errors}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-border bg-card/30">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>Educational tool for understanding digital line encoding schemes</p>
            <p className="mt-1">
              Supports NRZ, RZ, NRZI, Manchester, Differential Manchester & AMI encoding
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
