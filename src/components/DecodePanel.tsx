import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";

interface DecodePanelProps {
  originalBits?: string;
  decodedBits: string;
  errors?: number[];
}

export const DecodePanel = ({
  originalBits = '',
  decodedBits,
  errors = [],
}: DecodePanelProps) => {
  const hasErrors = errors.length > 0;

  return (
    <Card className="p-6 space-y-4 bg-card border-border">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Decoded Output</h3>
        {originalBits && (
          <div className="flex items-center gap-2">
            {hasErrors ? (
              <>
                <XCircle className="h-5 w-5 text-destructive" />
                <Badge variant="destructive">{errors.length} Error{errors.length > 1 ? 's' : ''}</Badge>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <Badge className="bg-green-500 hover:bg-green-600 text-white">Perfect Match</Badge>
              </>
            )}
          </div>
        )}
      </div>

      <div className="space-y-3">
        {originalBits && (
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Original:</p>
            <div className="font-mono text-lg tracking-wider bg-muted p-3 rounded">
              {originalBits.split('').map((bit, idx) => (
                <span
                  key={idx}
                  className={errors.includes(idx) ? 'text-destructive font-bold' : 'text-foreground'}
                >
                  {bit}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Decoded:</p>
          <div className="font-mono text-lg tracking-wider bg-muted p-3 rounded">
            {decodedBits || <span className="text-muted-foreground italic">No data</span>}
          </div>
        </div>
      </div>

      {decodedBits && (
        <div className="pt-3 border-t border-border">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Bit Count:</p>
              <p className="font-mono font-semibold">{decodedBits.length}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Accuracy:</p>
              <p className="font-mono font-semibold">
                {originalBits
                  ? `${(((originalBits.length - errors.length) / originalBits.length) * 100).toFixed(1)}%`
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
