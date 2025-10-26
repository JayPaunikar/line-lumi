import { EncodingType } from '@/components/ControlsPanel';

function getSampleValue(samples: number[], index: number): number {
  if (index < 0 || index >= samples.length) return 0;
  return samples[index];
}

export function decodeNRZ(samples: number[], samplesPerBit: number, amplitude: number = 1): string {
  let bits = '';
  const threshold = 0; // Midpoint between +amplitude and -amplitude
  for (let i = 0; i < samples.length; i += samplesPerBit) {
    const midPoint = i + Math.floor(samplesPerBit / 2);
    const value = getSampleValue(samples, midPoint);
    bits += value > threshold ? '1' : '0';
  }
  return bits;
}

export function decodeRZ(samples: number[], samplesPerBit: number, amplitude: number = 1): string {
  let bits = '';
  const threshold = 0; // Midpoint between +amplitude and -amplitude
  for (let i = 0; i < samples.length; i += samplesPerBit) {
    const quarterPoint = i + Math.floor(samplesPerBit / 4);
    const value = getSampleValue(samples, quarterPoint);
    bits += value > threshold ? '1' : '0';
  }
  return bits;
}

export function decodeNRZI(samples: number[], samplesPerBit: number, amplitude: number = 1): string {
  if (samples.length === 0) return '';

  let bits = '';
  let previousLevel = getSampleValue(samples, 0); // start with first sample

  for (let i = 0; i < samples.length; i += samplesPerBit) {
    const midPoint = i + Math.floor(samplesPerBit / 2);
    const currentLevel = getSampleValue(samples, midPoint);

    if (i === 0) {
      // First bit: convention depends on initial level, assume '0'
      bits += '0';
    } else {
      // Transition = 1, no transition = 0
      bits += Math.sign(currentLevel) !== Math.sign(previousLevel) ? '1' : '0';
    }

    previousLevel = currentLevel;
  }

  return bits;
}


export function decodeManchester(samples: number[], samplesPerBit: number, amplitude: number = 1): string {
  let bits = '';
  const threshold = 0; // Midpoint between +amplitude and -amplitude
  for (let i = 0; i < samples.length; i += samplesPerBit) {
    const firstQuarter = i + Math.floor(samplesPerBit / 4);
    const thirdQuarter = i + Math.floor(3 * samplesPerBit / 4);
    
    const firstValue = getSampleValue(samples, firstQuarter);
    const secondValue = getSampleValue(samples, thirdQuarter);
    
    // Low to high = 1, high to low = 0
    if (firstValue < threshold && secondValue > threshold) {
      bits += '1';
    } else {
      bits += '0';
    }
  }
  return bits;
}

export function decodeDiffManchester(samples: number[], samplesPerBit: number, amplitude: number = 1): string {
  if (samples.length === 0) return '';

  let bits = '';
  const half = Math.floor(samplesPerBit / 2);

  // Initial previous mid-bit sample
  let previousMid = getSampleValue(samples, half / 2);

  for (let i = 0; i < samples.length; i += samplesPerBit) {
    const startSample = getSampleValue(samples, i);
    const midSample = getSampleValue(samples, i + half);

    // 0 bit: transition at start (start != previous mid)
    // 1 bit: no transition at start
    bits += Math.sign(startSample) !== Math.sign(previousMid) ? '0' : '1';

    previousMid = midSample; // update previous mid-bit for next bit
  }

  return bits;
}

export function decodeAMI(samples: number[], samplesPerBit: number, amplitude: number = 1): string {
  let bits = '';
  const ampThreshold = Math.abs(amplitude) * 0.5; // amplitude-based threshold
  for (let i = 0; i < samples.length; i += samplesPerBit) {
    const midPoint = i + Math.floor(samplesPerBit / 2);
    const value = getSampleValue(samples, midPoint);
    
    // Zero voltage = 0, any polarity above threshold = 1
    bits += Math.abs(value) > ampThreshold ? '1' : '0';
  }
  return bits;
}

export function decodeB8ZS(samples: number[], samplesPerBit: number, amplitude: number = 1): string {
  // B8ZS decoding: detect 000VB0VB pattern and convert back to 00000000
  let bits = '';
  const ampThreshold = Math.abs(amplitude) * 0.5;
  
  let i = 0;
  while (i < samples.length) {
    // Check if we have at least 8 more bits to check for B8ZS pattern
    if (i <= samples.length - 8 * samplesPerBit) {
      const bit0 = Math.abs(getSampleValue(samples, i + Math.floor(samplesPerBit / 2))) > ampThreshold;
      const bit1 = Math.abs(getSampleValue(samples, i + samplesPerBit + Math.floor(samplesPerBit / 2))) > ampThreshold;
      const bit2 = Math.abs(getSampleValue(samples, i + 2 * samplesPerBit + Math.floor(samplesPerBit / 2))) > ampThreshold;
      const bit3 = Math.abs(getSampleValue(samples, i + 3 * samplesPerBit + Math.floor(samplesPerBit / 2))) > ampThreshold;
      const bit4 = Math.abs(getSampleValue(samples, i + 4 * samplesPerBit + Math.floor(samplesPerBit / 2))) > ampThreshold;
      const bit5 = Math.abs(getSampleValue(samples, i + 5 * samplesPerBit + Math.floor(samplesPerBit / 2))) > ampThreshold;
      const bit6 = Math.abs(getSampleValue(samples, i + 6 * samplesPerBit + Math.floor(samplesPerBit / 2))) > ampThreshold;
      const bit7 = Math.abs(getSampleValue(samples, i + 7 * samplesPerBit + Math.floor(samplesPerBit / 2))) > ampThreshold;
      
      // Pattern: 000VB0VB (0,0,0,pulse,pulse,0,pulse,pulse)
      if (!bit0 && !bit1 && !bit2 && bit3 && bit4 && !bit5 && bit6 && bit7) {
        bits += '00000000';
        i += 8 * samplesPerBit;
        continue;
      }
    }
    
    // Normal AMI decoding
    const value = getSampleValue(samples, i + Math.floor(samplesPerBit / 2));
    bits += Math.abs(value) > ampThreshold ? '1' : '0';
    i += samplesPerBit;
  }
  
  return bits;
}

export function decodeHDB3(samples: number[], samplesPerBit: number, amplitude: number = 1): string {
  // HDB3 decoding: detect B00V or 000V patterns and convert back to 0000
  let bits = '';
  const ampThreshold = Math.abs(amplitude) * 0.5;
  
  let i = 0;
  while (i < samples.length) {
    // Check if we have at least 4 more bits
    if (i <= samples.length - 4 * samplesPerBit) {
      const bit0 = Math.abs(getSampleValue(samples, i + Math.floor(samplesPerBit / 2))) > ampThreshold;
      const bit1 = Math.abs(getSampleValue(samples, i + samplesPerBit + Math.floor(samplesPerBit / 2))) > ampThreshold;
      const bit2 = Math.abs(getSampleValue(samples, i + 2 * samplesPerBit + Math.floor(samplesPerBit / 2))) > ampThreshold;
      const bit3 = Math.abs(getSampleValue(samples, i + 3 * samplesPerBit + Math.floor(samplesPerBit / 2))) > ampThreshold;
      
      // Pattern B00V: (pulse,0,0,pulse)
      if (bit0 && !bit1 && !bit2 && bit3) {
        bits += '0000';
        i += 4 * samplesPerBit;
        continue;
      }
      
      // Pattern 000V: (0,0,0,pulse)
      if (!bit0 && !bit1 && !bit2 && bit3) {
        bits += '0000';
        i += 4 * samplesPerBit;
        continue;
      }
    }
    
    // Normal AMI decoding
    const value = getSampleValue(samples, i + Math.floor(samplesPerBit / 2));
    bits += Math.abs(value) > ampThreshold ? '1' : '0';
    i += samplesPerBit;
  }
  
  return bits;
}

export function decode(samples: number[], encoding: EncodingType, samplesPerBit: number, amplitude: number = 1): string {
  if (samples.length === 0) return '';
  
  switch (encoding) {
    case 'NRZ':
      return decodeNRZ(samples, samplesPerBit, amplitude);
    case 'RZ':
      return decodeRZ(samples, samplesPerBit, amplitude);
    case 'NRZI':
      return decodeNRZI(samples, samplesPerBit, amplitude);
    case 'Manchester':
      return decodeManchester(samples, samplesPerBit, amplitude);
    case 'DiffManchester':
      return decodeDiffManchester(samples, samplesPerBit, amplitude);
    case 'AMI':
      return decodeAMI(samples, samplesPerBit, amplitude);
    case 'B8ZS':
      return decodeB8ZS(samples, samplesPerBit, amplitude);
    case 'HDB3':
      return decodeHDB3(samples, samplesPerBit, amplitude);
    default:
      return decodeNRZ(samples, samplesPerBit, amplitude);
  }
}

export function findErrors(original: string, decoded: string): number[] {
  const errors: number[] = [];
  const minLen = Math.min(original.length, decoded.length);
  
  for (let i = 0; i < minLen; i++) {
    if (original[i] !== decoded[i]) {
      errors.push(i);
    }
  }
  
  return errors;
}
